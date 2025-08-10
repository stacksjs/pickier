import type { PickierConfig, PickierPlugin, LintIssue as PluginLintIssue, RuleContext, RulesConfigMap } from '../types'
import { readFileSync, writeFileSync } from 'node:fs'
import { extname, isAbsolute, relative, resolve } from 'node:path'
import process from 'node:process'
import fg from 'fast-glob'
import { config as defaultConfig } from '../config'
import { detectQuoteIssues, formatImports, hasIndentIssue } from '../format'
import { colors } from '../utils'

export interface LintOptions {
  fix?: boolean
  dryRun?: boolean
  maxWarnings?: number
  reporter?: 'stylish' | 'json' | 'compact'
  config?: string
  ignorePath?: string
  ext?: string
  cache?: boolean
  verbose?: boolean
}

interface LintIssue {
  filePath: string
  line: number
  column: number
  ruleId: string
  message: string
  severity: 'warning' | 'error'
}

function mergeConfig(base: PickierConfig, override: Partial<PickierConfig>): PickierConfig {
  return {
    ...base,
    ...override,
    lint: { ...base.lint, ...(override.lint || {}) },
    format: { ...base.format, ...(override.format || {}) },
    rules: { ...base.rules, ...(override.rules || {}) },
  }
}

async function loadConfigFromPath(pathLike: string | undefined): Promise<PickierConfig> {
  if (!pathLike)
    return defaultConfig

  const abs = isAbsolute(pathLike) ? pathLike : resolve(process.cwd(), pathLike)
  const ext = extname(abs).toLowerCase()

  if (ext === '.json') {
    const raw = readFileSync(abs, 'utf8')
    return mergeConfig(defaultConfig, JSON.parse(raw) as Partial<PickierConfig>)
  }

  const mod = await import(abs)
  return mergeConfig(defaultConfig, (mod.default || mod) as Partial<PickierConfig>)
}

function expandPatterns(patterns: string[]): string[] {
  return patterns.map((p) => {
    const hasMagic = /[\\*?[\]{}()!]/.test(p)
    if (hasMagic)
      return p
    // if it looks like a file path with an extension, keep as-is
    if (/\.[A-Z0-9]+$/i.test(p))
      return p
    // treat as directory; search all files under it
    return `${p.replace(/\/$/, '')}/**/*`
  })
}

function isCodeFile(file: string, allowedExts: Set<string>): boolean {
  const idx = file.lastIndexOf('.')
  if (idx < 0)
    return false
  const ext = file.slice(idx)
  return allowedExts.has(ext)
}

function applyPlugins(filePath: string, content: string, cfg: PickierConfig): PluginLintIssue[] {
  const issues: PluginLintIssue[] = []
  const pluginDefs: Array<PickierPlugin> = []
  // Built-in pickier plugin with sort-objects rule (simple heuristic)
  const builtin: PickierPlugin = {
    name: 'pickier',
    rules: {
      'sort-objects': {
        meta: { docs: 'Enforce sorted object keys' },
        check: (text, ctx) => {
          const opts: any = ctx.options || {}
          const type: 'alphabetical' | 'line-length' = opts.type || 'alphabetical'
          const order: 'asc' | 'desc' = opts.order || 'asc'
          const ignoreCase: boolean = opts.ignoreCase !== false
          const partitionByNewLine: boolean = Boolean(opts.partitionByNewLine)
          const lines = text.split(/\r?\n/)
          const out: PluginLintIssue[] = []
          const cmp = (a: string, b: string): number => {
            let res = 0
            if (type === 'line-length') {
              res = a.length - b.length
            }
            else {
              const aa = ignoreCase ? a.toLowerCase() : a
              const bb = ignoreCase ? b.toLowerCase() : b
              res = aa.localeCompare(bb)
            }
            return order === 'asc' ? res : -res
          }
          let i = 0
          while (i < lines.length) {
            const line = lines[i]
            const openIdx = line.indexOf('{')
            if (openIdx !== -1) {
              const before = line.slice(0, openIdx)
              if (/=\s*$|\(\s*$|\breturn\s*$/.test(before)) {
                let depth = 0; const start = i; let j = i
                for (; j < lines.length; j++) {
                  for (const ch of lines[j]) {
                    if (ch === '{')
                      depth++; else if (ch === '}')
                      depth--
                  }
                  if (depth === 0)
                    break
                }
                if (j > start) {
                  const inner = lines.slice(start + 1, j)
                  const groups: Array<{ startLine: number, props: Array<{ key: string, line: number }> }> = []
                  let current: { startLine: number, props: Array<{ key: string, line: number }> } = { startLine: start + 2, props: [] }
                  const flush = () => {
                    if (current.props.length)
                      groups.push(current); current = { startLine: 0, props: [] }
                  }
                  for (let k = 0; k < inner.length; k++) {
                    const ln = inner[k]
                    if (partitionByNewLine && /^\s*$/.test(ln)) { flush(); continue }
                    if (/^\s*\.\.\./.test(ln))
                      continue
                    if (/\{|\}/.test(ln))
                      continue
                    const m = ln.match(/^\s*['"]?([\w$-]+)['"]?\s*:/)
                    if (m) {
                      if (current.startLine === 0)
                        current.startLine = start + 2 + k
                      current.props.push({ key: m[1], line: start + 2 + k })
                    }
                  }
                  flush()
                  for (const g of groups) {
                    const keys = g.props.map(p => p.key)
                    const sorted = [...keys].sort(cmp)
                    const same = keys.length <= 1 || keys.every((k, idx) => k === sorted[idx])
                    if (!same && g.props.length > 0) {
                      const first = g.props[0]
                      out.push({ filePath: ctx.filePath, line: first.line, column: 1, ruleId: 'pickier/sort-objects', message: 'Object keys are not sorted', severity: 'warning' })
                    }
                  }
                  i = j + 1
                  continue
                }
              }
            }
            i++
          }
          return out
        },
      },
      'sort-imports': {
        meta: { docs: 'Enforce sorted imports (delegates to formatter check only)' },
        check: (text, ctx) => {
          // Only analyze the import block at top; if formatting would change, flag
          const lines = text.split(/\r?\n/)
          let idx = 0
          while (idx < lines.length && (/^\s*$/.test(lines[idx]) || /^\s*\/\//.test(lines[idx]) || /^\s*\/\*/.test(lines[idx]))) idx++
          const start = idx
          const imports: string[] = []
          while (idx < lines.length && /^\s*import\b/.test(lines[idx])) { imports.push(lines[idx].trim()); idx++ }
          if (imports.length === 0)
            return []
          const block = imports.join('\n')
          const rest = lines.slice(idx).join('\n')
          const reconstructed = `${block}\n${rest}`
          const formatted = formatImports(reconstructed)
          if (formatted !== reconstructed) {
            return [{ filePath: ctx.filePath, line: start + 1, column: 1, ruleId: 'pickier/sort-imports', message: 'Imports are not sorted/grouped consistently', severity: 'warning' }]
          }
          return []
        },
      },
      'sort-named-imports': {
        meta: { docs: 'Enforce sorted named imports within each import statement' },
        check: (text, ctx) => {
          const opts: any = ctx.options || {}
          const type: 'alphabetical' | 'line-length' = opts.type || 'alphabetical'
          const order: 'asc' | 'desc' = opts.order || 'asc'
          const ignoreCase: boolean = opts.ignoreCase !== false
          const ignoreAlias: boolean = Boolean(opts.ignoreAlias)
          const lines = text.split(/\r?\n/)
          const out: PluginLintIssue[] = []
          const cmp = (a: string, b: string): number => {
            let res = 0
            if (type === 'line-length') {
              res = a.length - b.length
            }
            else {
              const aa = ignoreCase ? a.toLowerCase() : a
              const bb = ignoreCase ? b.toLowerCase() : b
              res = aa.localeCompare(bb)
            }
            return order === 'asc' ? res : -res
          }
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            const m = line.match(/^\s*import\s+\{([^}]*)\}\s+from\s+['"][^'"]+['"]/)
            if (!m)
              continue
            const inner = m[1]
            const items = inner.split(',').map(s => s.trim()).filter(Boolean)
            if (items.length <= 1)
              continue
            const names = items.map((it) => {
              const withoutType = it.replace(/^type\s+/, '')
              const am = withoutType.match(/^([\w$]+)\s+as\s+([\w$]+)$/)
              if (am)
                return ignoreAlias ? am[2] : am[1]
              const sm = withoutType.match(/^([\w$]+)$/)
              return sm ? sm[1] : withoutType
            })
            const sorted = [...names].sort(cmp)
            const same = names.every((n, idx) => n === sorted[idx])
            if (!same) {
              out.push({ filePath: ctx.filePath, line: i + 1, column: 1, ruleId: 'pickier/sort-named-imports', message: 'Named imports are not sorted', severity: 'warning' })
            }
          }
          return out
        },
      },
      'sort-keys': {
        meta: { docs: 'Require object keys to be sorted (ESLint-compatible core rule subset)' },
        check: (text, ctx) => {
          // Options: [order, { caseSensitive, natural, minKeys, allowLineSeparatedGroups, ignoreComputedKeys }]
          const opt = Array.isArray(ctx.options) ? ctx.options : []
          const order: 'asc' | 'desc' = (opt[0] as any) || 'asc'
          const o = (opt[1] as any) || {}
          const caseSensitive: boolean = o.caseSensitive !== false
          const natural: boolean = Boolean(o.natural)
          const minKeys: number = typeof o.minKeys === 'number' ? o.minKeys : 2
          const allowLineSeparatedGroups: boolean = Boolean(o.allowLineSeparatedGroups)
          const ignoreComputedKeys: boolean = Boolean(o.ignoreComputedKeys)
          const lines = text.split(/\r?\n/)
          const out: PluginLintIssue[] = []
          const cmpAlpha = (a: string, b: string) => (caseSensitive ? a : a.toLowerCase()).localeCompare(caseSensitive ? b : b.toLowerCase())
          const cmpNat = (a: string, b: string) => (caseSensitive ? a : a.toLowerCase()).localeCompare(caseSensitive ? b : b.toLowerCase(), undefined, { numeric: true })
          const cmp = natural ? cmpNat : cmpAlpha
          const dir = (r: number) => (order === 'asc' ? r : -r)

          // reuse object block detection from sort-objects
          let i = 0
          while (i < lines.length) {
            const line = lines[i]
            const openIdx = line.indexOf('{')
            if (openIdx !== -1) {
              const before = line.slice(0, openIdx)
              if (/=\s*$|\(\s*$|\breturn\s*$/.test(before)) {
                let depth = 0; const start = i; let j = i
                for (; j < lines.length; j++) {
                  for (const ch of lines[j]) {
                    if (ch === '{')
                      depth++; else if (ch === '}')
                      depth--
                  }
                  if (depth === 0)
                    break
                }
                if (j > start) {
                  const inner = lines.slice(start + 1, j)
                  let group: Array<{ key: string, line: number, computed: boolean }> = []
                  const flush = () => {
                    if (group.length >= minKeys) {
                      // omit computed if requested
                      const filtered = ignoreComputedKeys ? group.filter(p => !p.computed) : group
                      const keys = filtered.map(p => p.key)
                      const sorted = [...keys].sort((a, b) => dir(cmp(a, b)))
                      const same = keys.length <= 1 || keys.every((k, idx) => k === sorted[idx])
                      if (!same && filtered.length > 0) {
                        const first = filtered[0]
                        out.push({ filePath: ctx.filePath, line: first.line, column: 1, ruleId: 'sort-keys', message: 'Expected object keys to be in order', severity: 'warning' })
                      }
                    }
                    group = []
                  }
                  for (let k = 0; k < inner.length; k++) {
                    const ln = inner[k]
                    if (allowLineSeparatedGroups && /^\s*$/.test(ln)) { flush(); continue }
                    if (/^\s*\.\.\./.test(ln)) { flush(); continue }
                    if (/\{|\}/.test(ln))
                      continue
                    const mSimple = ln.match(/^\s*['"]?([\w$-]+)['"]?\s*:/)
                    const mComputed = ln.match(/^\s*\[(.+?)\]\s*:/)
                    if (mSimple) {
                      group.push({ key: mSimple[1], line: start + 2 + k, computed: false })
                    }
                    else if (mComputed) {
                      // simple computed names treated as keys unless ignored
                      const literal = mComputed[1].match(/^['"](.+?)['"]$/)
                      const ident = mComputed[1].match(/^[A-Z_$][\w$]*$/i)
                      const simple = (literal && literal[1]) || (ident && ident[0])
                      if (simple)
                        group.push({ key: simple, line: start + 2 + k, computed: true })
                      else flush() // non-simple resets order per ESLint behavior
                    }
                  }
                  flush()
                  i = j + 1
                  continue
                }
              }
            }
            i++
          }
          return out
        },
      },
    },
  }
  pluginDefs.push(builtin)
  // Built-in style plugin
  const stylePlugin: PickierPlugin = {
    name: 'style',
    rules: {
      'max-statements-per-line': {
        meta: { docs: 'Limit the number of statements allowed on a single line' },
        check: (text, ctx) => {
          // options: { max?: number }
          const max: number = (ctx.options && typeof (ctx.options as any).max === 'number') ? (ctx.options as any).max : 1
          const issues: PluginLintIssue[] = []
          const lines = text.split(/\r?\n/)

          const countStatementsOnLine = (line: string): number => {
            // Skip trailing inline comments
            const commentIdx = line.indexOf('//')
            const effective = commentIdx >= 0 ? line.slice(0, commentIdx) : line
            let countSemis = 0
            let inSingle = false; let inDouble = false; let inBacktick = false
            let escape = false
            // Detect for-header parentheses to ignore semicolons there
            let inForHeader = false
            let parenDepth = 0
            for (let i = 0; i < effective.length; i++) {
              const ch = effective[i]
              if (escape) {
                escape = false
                continue
              }
              if (ch === '\\') { escape = true; continue }
              if (!inDouble && !inBacktick && ch === '\'') { inSingle = !inSingle; continue }
              if (!inSingle && !inBacktick && ch === '"') { inDouble = !inDouble; continue }
              if (!inSingle && !inDouble && ch === '`') { inBacktick = !inBacktick; continue }
              if (inSingle || inDouble || inBacktick)
                continue
              // crude detection of for header
              if (!inForHeader) {
                if (ch === 'f' && effective.slice(i, i + 4).match(/^for\b/)) {
                  // find '(' after for
                  const rest = effective.slice(i + 3).trimStart()
                  const offset = effective.length - rest.length
                  if (effective[offset] === '(') { inForHeader = true; parenDepth = 1; i = offset; continue }
                }
              }
              else {
                if (ch === '(') {
                  parenDepth++
                }
                else if (ch === ')') {
                  parenDepth--; if (parenDepth <= 0)
                    inForHeader = false
                }
                else if (ch === ';') { /* ignore semicolons inside for(...) */ continue }
              }
              if (ch === ';')
                countSemis++
            }
            if (countSemis === 0)
              return 1
            // If line ends with ';' assume count equals number of statements
            const trimmed = effective.trimEnd()
            const endsWithSemi = trimmed.endsWith(';')
            return endsWithSemi ? countSemis : countSemis + 1
          }

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            if (/^\s*$/.test(line))
              continue
            const num = countStatementsOnLine(line)
            if (num > max) {
              issues.push({
                filePath: ctx.filePath,
                line: i + 1,
                column: 1,
                ruleId: 'style/max-statements-per-line',
                message: `This line has ${num} statements. Maximum allowed is ${max}`,
                severity: 'warning',
              })
            }
          }
          return issues
        },
      },
    },
  }
  pluginDefs.push(stylePlugin)
  // Built-in unused-imports-like plugin (no-unused-vars subset)
  const unusedImportsPlugin: PickierPlugin = {
    name: 'unused-imports',
    rules: {
      'no-unused-vars': {
        meta: { docs: 'Report variables and parameters that are declared/assigned but never used' },
        check: (text, ctx) => {
          const issues: PluginLintIssue[] = []
          const opts: any = ctx.options || {}
          const varsIgnorePattern = typeof opts.varsIgnorePattern === 'string' ? opts.varsIgnorePattern : '^_'
          const argsIgnorePattern = typeof opts.argsIgnorePattern === 'string' ? opts.argsIgnorePattern : '^_'
          const varIgnoreRe = new RegExp(varsIgnorePattern, 'u')
          const argIgnoreRe = new RegExp(argsIgnorePattern, 'u')

          const lines = text.split(/\r?\n/)
          const full = text
          const idRe = /[$A-Z_][\w$]*/gi

          // collect variable declarations (const/let/var)
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            const decl = line.match(/^\s*(?:const|let|var)\s+(.+?);?\s*$/)
            if (!decl)
              continue
            const after = decl[1]
            // split by ',' at top level (ignore inside braces/brackets roughly)
            const parts = after.split(',')
            for (const partRaw of parts) {
              const part = partRaw.trim()
              if (!part)
                continue
              // capture identifiers in simple or destructuring forms
              const simple = part.match(/^([$A-Z_][\w$]*)/i)
              const destruct = part.match(/^[{[](.+)[}\]]/)
              const names: string[] = []
              if (simple) {
                names.push(simple[1])
              }
              else if (destruct) {
                const inner = destruct[1]
                // pick bare identifiers and aliases like a: b
                const tokens = inner.split(/[^$\w]+/).filter(Boolean)
                for (const t of tokens) names.push(t)
              }
              for (const name of names) {
                if (varIgnoreRe.test(name))
                  continue
                // search usage after this line within the file (exclude declaration occurrence on this line)
                const restStartIdx = full.indexOf(line)
                const rest = full.slice(restStartIdx + line.length)
                const refRe = new RegExp(`\\b${name}\\b`, 'g')
                if (!refRe.test(rest)) {
                  issues.push({
                    filePath: ctx.filePath,
                    line: i + 1,
                    column: Math.max(1, line.indexOf(name) + 1),
                    ruleId: 'unused-imports/no-unused-vars',
                    message: `'${name}' is assigned a value but never used. Allowed unused vars must match /${varsIgnorePattern}/u`,
                    severity: 'error',
                  })
                }
              }
            }
          }

          // collect function parameters and check their usage within function body
          // function decl: function name(params) { ... }
          const funcDeclRe = /function\s+[A-Za-z_$][\w$]*\s*\(([^)]*)\)\s*\{/g
          let m: RegExpExecArray | null
          while ((m = funcDeclRe.exec(full))) {
            const paramsSrc = m[1]
            const paramNames = paramsSrc.split(',').map(s => s.trim()).filter(Boolean).map((p) => {
              // strip default and type after colon, and destructuring keep bare names
              const simple = p.match(/^([$A-Z_][\w$]*)/i)
              if (simple)
                return simple[1]
              const id = p.match(/\b([$A-Z_][\w$]*)\b/i)
              return id ? id[1] : ''
            }).filter(Boolean)
            // find body start at m.index of '{' and balance braces
            const bodyStart = full.indexOf('{', m.index)
            if (bodyStart === -1)
              continue
            let depth = 0
            let bodyEnd = -1
            for (let i = bodyStart; i < full.length; i++) {
              const ch = full[i]
              if (ch === '{') {
                depth++
              }
              else if (ch === '}') { depth--; if (depth === 0) { bodyEnd = i; break } }
            }
            const body = bodyEnd > bodyStart ? full.slice(bodyStart + 1, bodyEnd) : ''
            for (const name of paramNames) {
              if (!name || argIgnoreRe.test(name))
                continue
              const refRe = new RegExp(`\\b${name}\\b`, 'g')
              if (!refRe.test(body)) {
                // compute line number from start
                const startText = full.slice(0, m.index)
                const baseLine = (startText.match(/\n/g) || []).length + 1
                const lineOffset = (m[0].slice(0, m[0].indexOf('(')).match(/\n/g) || []).length
                issues.push({
                  filePath: ctx.filePath,
                  line: baseLine + lineOffset,
                  column: 1,
                  ruleId: 'unused-imports/no-unused-vars',
                  message: `'${name}' is assigned a value but never used. Allowed unused vars must match /${argsIgnorePattern}/u`,
                  severity: 'error',
                })
              }
            }
          }

          // simple arrow/function expressions: const f = (params) => { ... }
          const arrowRe = /\(([^)]*)\)\s*=>\s*(\{)?/g
          while ((m = arrowRe.exec(full))) {
            const paramsSrc = m[1]
            const paramNames = paramsSrc.split(',').map(s => s.trim()).filter(Boolean).map((p) => {
              const simple = p.match(/^([$A-Z_][\w$]*)/i)
              if (simple)
                return simple[1]
              const id = p.match(/\b([$A-Z_][\w$]*)\b/i)
              return id ? id[1] : ''
            }).filter(Boolean)
            let body = ''
            if (m[2] === '{') {
              const bodyStart = full.indexOf('{', m.index)
              let depth = 0
              let bodyEnd = -1
              for (let i = bodyStart; i < full.length; i++) {
                const ch = full[i]
                if (ch === '{') {
                  depth++
                }
                else if (ch === '}') { depth--; if (depth === 0) { bodyEnd = i; break } }
              }
              body = bodyEnd > bodyStart ? full.slice(bodyStart + 1, bodyEnd) : ''
            }
            else {
              // concise body expression up to end of line or semicolon
              const rest = full.slice(m.index + m[0].length)
              const endIdx = rest.search(/[\n;]/)
              body = endIdx === -1 ? rest : rest.slice(0, endIdx)
            }
            for (const name of paramNames) {
              if (!name || argIgnoreRe.test(name))
                continue
              const refRe = new RegExp(`\\b${name}\\b`, 'g')
              if (!refRe.test(body)) {
                // compute approximate line
                const before = full.slice(0, m.index)
                const baseLine = (before.match(/\n/g) || []).length + 1
                issues.push({
                  filePath: ctx.filePath,
                  line: baseLine,
                  column: 1,
                  ruleId: 'unused-imports/no-unused-vars',
                  message: `'${name}' is assigned a value but never used. Allowed unused vars must match /${argsIgnorePattern}/u`,
                  severity: 'error',
                })
              }
            }
          }

          return issues
        },
      },
    },
  }
  pluginDefs.push(unusedImportsPlugin)
  if (cfg.plugins && cfg.plugins.length > 0) {
    for (const p of cfg.plugins) {
      if (typeof p === 'string')
        continue // string form not yet supported for runtime import here
      pluginDefs.push(p)
    }
  }
  if (pluginDefs.length === 0)
    return issues

  const configured: RulesConfigMap = cfg.pluginRules || {}
  for (const plugin of pluginDefs) {
    for (const [ruleName, rule] of Object.entries(plugin.rules)) {
      const fullName = `${plugin.name}/${ruleName}`
      const conf = configured[fullName]
      const sev = Array.isArray(conf) ? conf[0] : conf
      const options = Array.isArray(conf) ? conf[1] : undefined
      if (!conf || sev === 'off')
        continue
      const context: RuleContext = { filePath, config: cfg, options }
      try {
        const res = rule.check(content, context)
        for (const i of res) {
          issues.push(i)
        }
      }
      catch (e) {
        // mark WIP rules as errors when requested via meta
        if (rule.meta?.wip) {
          issues.push({
            filePath,
            line: 1,
            column: 1,
            ruleId: `${fullName}:wip-error`,
            message: `Rule ${fullName} is marked as WIP and threw: ${String(e)}`,
            severity: 'error',
          })
        }
      }
    }
  }
  return issues
}

function scanContent(filePath: string, content: string, cfg: PickierConfig): LintIssue[] {
  const issues: LintIssue[] = []
  const lines = content.split(/\r?\n/)

  const debuggerStmt = /^\s*debugger\b/ // statement-only, not inside strings

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNo = i + 1

    if (cfg.rules.noDebugger !== 'off' && debuggerStmt.test(line)) {
      const col = line.search(/\S|$/) + 1
      issues.push({
        filePath,
        line: lineNo,
        column: col,
        ruleId: 'no-debugger',
        message: 'Unexpected debugger statement.',
        severity: cfg.rules.noDebugger === 'error' ? 'error' : 'warning',
      })
    }

    if (cfg.rules.noConsole !== 'off') {
      const conCol = line.indexOf('console.')
      if (conCol !== -1) {
        issues.push({
          filePath,
          line: lineNo,
          column: conCol + 1,
          ruleId: 'no-console',
          message: 'Unexpected console usage.',
          severity: cfg.rules.noConsole === 'error' ? 'error' : 'warning',
        })
      }
    }

    // quote preference diagnostics (only for code files)
    if (/\.(?:ts|tsx|js|jsx)$/.test(filePath)) {
      const quoteIdx = detectQuoteIssues(line, cfg.format.quotes)
      for (const idx of quoteIdx) {
        issues.push({
          filePath,
          line: lineNo,
          column: idx + 1,
          ruleId: 'quotes',
          message: `Strings must use ${cfg.format.quotes} quotes.`,
          severity: 'warning',
        })
      }

      // indentation diagnostics
      const leadingMatch = line.match(/^[ \t]*/)
      const leading = leadingMatch ? leadingMatch[0] : ''
      if (hasIndentIssue(leading, cfg.format.indent)) {
        const firstNonWs = line.search(/\S|$/)
        issues.push({
          filePath,
          line: lineNo,
          column: Math.max(1, firstNonWs),
          ruleId: 'indent',
          message: `Indentation must be a multiple of ${cfg.format.indent} spaces.`,
          severity: 'warning',
        })
      }
    }
  }

  // RegExp: no-unused-capturing-group (heuristic across entire file)
  if (cfg.rules.noUnusedCapturingGroup && cfg.rules.noUnusedCapturingGroup !== 'off') {
    const addIssue = (line: number, col: number) => {
      issues.push({
        filePath,
        line,
        column: col,
        ruleId: 'regexp/no-unused-capturing-group',
        message: 'Capturing group number 1 is defined but never used',
        severity: cfg.rules.noUnusedCapturingGroup === 'error' ? 'error' : 'warning',
      })
    }
    const regexLiteral = /\/[^/\\]*(?:\\.[^/\\]*)*\//g
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      regexLiteral.lastIndex = 0
      let m: RegExpExecArray | null
      while ((m = regexLiteral.exec(line))) {
        const pattern = m[0]
        // skip if backreferences present (\\1, \\k<name>)
        if (/\\\d|\\k<[^>]+>/.test(line))
          continue
        const capCount = (pattern.match(/\((?!\?:|\?<)[^)]*\)/g) || []).length
        if (capCount > 0)
          addIssue(i + 1, m.index + 1)
      }
    }
  }

  // no-cond-assign: flag assignments inside if/while/do-while/for conditions
  if (cfg.rules.noCondAssign && cfg.rules.noCondAssign !== 'off') {
    const addIssue = (l: number, c: number) => issues.push({ filePath, line: l, column: c, ruleId: 'no-cond-assign', message: 'Unexpected assignment within a \'while\' statement', severity: cfg.rules.noCondAssign === 'error' ? 'error' : 'warning' })
    const conds = [/^\s*if\s*\((.*)\)/, /^\s*while\s*\((.*)\)/, /^\s*do\s*\{?/, /^\s*for\s*\((.*)\)/]
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      // simple detection for while/if/for on single line
      const checkAssign = (s: string) => /(^|[^=!<>])=(?!=)/.test(s)
      const ifm = line.match(/^\s*if\s*\((.*)\)/)
      if (ifm && checkAssign(ifm[1]))
        addIssue(i + 1, (ifm.index || 0) + 1)
      const whm = line.match(/^\s*while\s*\((.*)\)/)
      if (whm && checkAssign(whm[1]))
        addIssue(i + 1, (whm.index || 0) + 1)
      const form = line.match(/^\s*for\s*\((.*)\)/)
      if (form) {
        const inner = form[1]
        // for(init; condition; update) — flag only in condition segment
        const parts = inner.split(';')
        if (parts.length >= 2 && checkAssign(parts[1]))
          addIssue(i + 1, (form.index || 0) + 1)
      }
    }
  }

  // plugin-based rules
  const pluginIssues = applyPlugins(filePath, content, cfg)
  return issues.concat(pluginIssues)
}

function applyFixes(filePath: string, content: string, cfg: PickierConfig): string {
  // Only remove debugger statements for --fix in lint. Formatting stays in formatter.
  const lines = content.split(/\r?\n/)
  const fixed: string[] = []
  const debuggerStmt = /^\s*debugger\b/
  for (const line of lines) {
    if (cfg.rules.noDebugger !== 'off' && debuggerStmt.test(line))
      continue
    fixed.push(line)
  }
  return fixed.join('\n')
}

function formatStylish(issues: LintIssue[]): string {
  const rel = (p: string) => relative(process.cwd(), p)
  let out = ''
  let lastFile = ''
  for (const issue of issues) {
    if (issue.filePath !== lastFile) {
      lastFile = issue.filePath
      out += `\n${colors.bold(rel(issue.filePath))}\n`
    }
    const sev = issue.severity === 'error' ? colors.red('error') : colors.yellow('warn ')
    out += `${sev}  ${colors.gray(String(issue.line))}:${colors.gray(String(issue.column))}  ${colors.blue(issue.ruleId)}  ${issue.message}\n`
  }
  return out
}

export async function runLint(globs: string[], options: LintOptions): Promise<number> {
  const cfg = await loadConfigFromPath(options.config)

  const raw = globs.length ? globs : ['.']
  const patterns = expandPatterns(raw)
  const extCsv = options.ext || cfg.lint.extensions.join(',')
  const extSet = new Set(extCsv.split(',').map((s) => {
    const t = s.trim()
    return t.startsWith('.') ? t : `.${t}`
  }))

  const entries = await fg(patterns, {
    dot: false,
    ignore: cfg.ignores,
    onlyFiles: true,
    unique: true,
    absolute: true,
  })

  const files = entries.filter(f => isCodeFile(f, extSet))

  let allIssues: LintIssue[] = []
  for (const file of files) {
    const src = readFileSync(file, 'utf8')
    let issues = scanContent(file, src, cfg)

    if (options.fix) {
      const fixed = applyFixes(file, src, cfg)
      if (!options.dryRun && fixed !== src)
        writeFileSync(file, fixed, 'utf8')
      // recompute issues after simulated or real fix
      issues = scanContent(file, fixed, cfg)

      if (options.dryRun && src !== fixed && (options.verbose || cfg.verbose)) {
        console.log(colors.gray(`dry-run: would apply fixes in ${relative(process.cwd(), file)}`))
      }
    }

    allIssues = allIssues.concat(issues)
  }

  const errors = allIssues.filter(i => i.severity === 'error').length
  const warnings = allIssues.filter(i => i.severity === 'warning').length

  const reporter = options.reporter || cfg.lint.reporter
  if (reporter === 'json') {
    console.log(JSON.stringify({ errors, warnings, issues: allIssues }, null, 2))
  }
  else if (reporter === 'compact') {
    for (const i of allIssues) {
      console.log(`${relative(process.cwd(), i.filePath)}:${i.line}:${i.column} ${i.severity} ${i.ruleId} ${i.message}`)
    }
  }
  else if (allIssues.length > 0) {
    console.log(formatStylish(allIssues))
  }

  if (options.verbose || cfg.verbose) {
    console.log(colors.gray(`Scanned ${files.length} files, found ${errors} errors and ${warnings} warnings.`))
  }

  const maxWarnings = options.maxWarnings ?? cfg.lint.maxWarnings
  if (errors > 0)
    return 1
  if (maxWarnings >= 0 && warnings > maxWarnings)
    return 1
  return 0
}
