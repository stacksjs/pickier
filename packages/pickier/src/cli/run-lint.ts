import type { PickierConfig, PickierPlugin, LintIssue as PluginLintIssue, RuleContext, RulesConfigMap } from '../types'
import { readFileSync, writeFileSync } from 'node:fs'
import { extname, isAbsolute, relative, resolve } from 'node:path'
import process from 'node:process'
import { glob as tinyGlob } from 'tinyglobby'
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
                      out.push({ filePath: ctx.filePath, line: first.line, column: 1, ruleId: 'sort-objects', message: 'Object keys are not sorted', severity: 'warning' })
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
            return [{ filePath: ctx.filePath, line: start + 1, column: 1, ruleId: 'sort-imports', message: 'Imports are not sorted/grouped consistently', severity: 'warning' }]
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
              out.push({ filePath: ctx.filePath, line: i + 1, column: 1, ruleId: 'sort-named-imports', message: 'Named imports are not sorted', severity: 'warning' })
            }
          }
          return out
        },
      },
      'sort-heritage-clauses': {
        meta: { docs: 'Enforce sorted TypeScript heritage clauses (extends/implements lists)' },
        check: (text, ctx) => {
          const opts: any = ctx.options || {}
          const type: 'alphabetical' | 'natural' | 'line-length' | 'unsorted' = opts.type || 'alphabetical'
          const order: 'asc' | 'desc' = opts.order || 'asc'
          const ignoreCase: boolean = opts.ignoreCase !== false
          const groupsOpt: Array<string | string[]> = Array.isArray(opts.groups) ? opts.groups : []
          const customGroups: Record<string, string | string[]> = opts.customGroups || {}
          const lines = text.split(/\r?\n/)
          const issues: PluginLintIssue[] = []

          const dir = (n: number) => (order === 'asc' ? n : -n)
          const cmpAlpha = (a: string, b: string) => (ignoreCase ? a.toLowerCase() : a).localeCompare(ignoreCase ? b.toLowerCase() : b)
          const cmpNat = (a: string, b: string) => (ignoreCase ? a.toLowerCase() : a).localeCompare(ignoreCase ? b.toLowerCase() : b, undefined, { numeric: true })
          const cmp = (a: string, b: string) => {
            if (type === 'line-length')
              return dir(a.length - b.length)
            if (type === 'natural')
              return dir(cmpNat(a, b))
            if (type === 'unsorted')
              return 0
            return dir(cmpAlpha(a, b))
          }

          const compileCustom = Object.fromEntries(Object.entries(customGroups).map(([g, p]) => {
            const arr = Array.isArray(p) ? p : [p]
            const regs = arr.map(s => new RegExp(s))
            return [g, regs]
          })) as Record<string, RegExp[]>

          const flatGroups: string[] = []
          for (const g of groupsOpt) {
            if (Array.isArray(g))
              flatGroups.push(...g); else flatGroups.push(g)
          }
          if (!flatGroups.includes('unknown'))
            flatGroups.push('unknown')

          const chooseGroup = (name: string): string => {
            for (const [g, regs] of Object.entries(compileCustom)) {
              if (regs.some(r => r.test(name)))
                return g
            }
            return 'unknown'
          }

          const splitTopLevel = (src: string): string[] => {
            const out: string[] = []
            let depth = 0
            let token = ''
            for (let i = 0; i < src.length; i++) {
              const ch = src[i]
              if (ch === '<')
                depth++
              else if (ch === '>')
                depth = Math.max(0, depth - 1)
              if (ch === ',' && depth === 0) { out.push(token.trim()); token = ''; continue }
              token += ch
            }
            if (token.trim())
              out.push(token.trim())
            return out
          }

          const baseName = (s: string): string => {
            const t = s.trim()
            const m = t.match(/^([A-Z_$][\w$.]*)/i)
            return m ? m[1] : t
          }

          const checkList = (lineNo: number, listSrc: string) => {
            const items = splitTopLevel(listSrc)
            if (items.length <= 1)
              return
            const names = items.map(baseName)
            const groups = names.map(chooseGroup)
            const orderByGroup = names
              .map((n, i) => ({ n, g: groups[i], i }))
              .sort((a, b) => {
                const gi = flatGroups.indexOf(a.g)
                const gj = flatGroups.indexOf(b.g)
                if (gi !== gj)
                  return gi - gj
                return cmp(a.n, b.n)
              })
              .map(x => x.n)
            const same = names.every((n, i) => n === orderByGroup[i])
            if (!same) {
              issues.push({ filePath: ctx.filePath, line: lineNo, column: 1, ruleId: 'sort-heritage-clauses', message: 'Heritage clauses are not sorted', severity: 'warning' })
            }
          }

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            // interface ... extends A, B, C { ... }
            const intf = line.match(/^\s*interface\s+[A-Za-z_$][^{]*\bextends\s+(.+?)\s*\{/)
            if (intf)
              checkList(i + 1, intf[1])
            // class ... implements A, B { ... }
            const impl = line.match(/^\s*class\s+[A-Za-z_$][^{]*\bimplements\s+(.+?)\s*\{/)
            if (impl)
              checkList(i + 1, impl[1])
          }
          return issues
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
      'sort-exports': {
        meta: { docs: 'Enforce sorted export statements' },
        check: (text, ctx) => {
          const opts: any = ctx.options || {}
          const type: 'alphabetical' | 'natural' | 'line-length' | 'unsorted' = opts.type || 'alphabetical'
          const order: 'asc' | 'desc' = opts.order || 'asc'
          const ignoreCase: boolean = opts.ignoreCase !== false
          const partitionByNewLine: boolean = Boolean(opts.partitionByNewLine)
          const lines = text.split(/\r?\n/)
          const issues: PluginLintIssue[] = []

          const dir = (n: number) => (order === 'asc' ? n : -n)
          const cmpAlpha = (a: string, b: string) => (ignoreCase ? a.toLowerCase() : a).localeCompare(ignoreCase ? b.toLowerCase() : b)
          const cmpNat = (a: string, b: string) => (ignoreCase ? a.toLowerCase() : a).localeCompare(ignoreCase ? b.toLowerCase() : b, undefined, { numeric: true })
          const cmp = (a: string, b: string) => {
            if (type === 'line-length')
              return dir(a.length - b.length)
            if (type === 'natural')
              return dir(cmpNat(a, b))
            if (type === 'unsorted')
              return 0
            return dir(cmpAlpha(a, b))
          }

          const isExportLine = (s: string) => /^\s*export\b/.test(s)

          let i = 0
          while (i < lines.length) {
            // skip until first export line
            while (i < lines.length && !isExportLine(lines[i])) i++
            if (i >= lines.length)
              break
            const start = i
            const group: string[] = []
            // build group until non-export encountered; if partitionByNewLine is true, also break on blank line
            while (i < lines.length && isExportLine(lines[i])) { group.push(lines[i].trim()); i++ }
            if (partitionByNewLine) {
              // Examine following lines for additional export blocks separated by blank lines? We keep groups per contiguous run; blank lines already break contiguous run
            }
            if (group.length > 1) {
              const keyLines = group.map(ln => ln)
              const sorted = [...keyLines].sort(cmp)
              const same = keyLines.every((ln, idx) => ln === sorted[idx])
              if (!same) {
                issues.push({ filePath: ctx.filePath, line: start + 1, column: 1, ruleId: 'sort-exports', message: 'Export statements are not sorted', severity: 'warning' })
              }
            }
          }
          return issues
        },
      },
      'prefer-const': {
        meta: { docs: 'Suggest \'const\' for variables that are never reassigned (heuristic)' },
        check: (text, ctx) => {
          const issues: PluginLintIssue[] = []
          const lines = text.split(/\r?\n/)
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            // match let/var declarations only (skip const)
            const decl = line.match(/^\s*(?:let|var)\s+(.+?);?\s*$/)
            if (!decl)
              continue
            const after = decl[1]
            // naive split by comma at top level
            const parts = after.split(',')
            for (const partRaw of parts) {
              const part = partRaw.trim()
              if (!part)
                continue
              // Determine if this variable has an initializer on the declaration
              // Capture identifier name then see if '=' follows somewhere in this part
              const simple = part.match(/^([$A-Z_][\w$]*)/i)
              const destruct = part.match(/^[{[]/)
              if (destruct)
                continue // skip destructuring for now to avoid false positives
              if (!simple)
                continue
              const name = simple[1]
              const hasInitializer = /=/.test(part)
              if (!hasInitializer)
                continue // we only suggest const when initialized on the declaration
              // search for reassignments after this line
              const restStartIdx = text.indexOf(line)
              const rest = text.slice(restStartIdx + line.length)
              // operators like =, +=, -=, *=, /=, %=, **=, <<=, >>=, >>>=, &=, |=, ^= and ++/--
              const assignOp = new RegExp(`\\b${name}\\s*([+\-*/%&|^]|<<|>>>?|\*\*)?=`, 'g')
              const incDec = new RegExp(`(\\+\\+|--)(?=${name}\\b)|(?:\\b${name})(?:\\+\\+|--)`, 'g')
              const directAssign = (() => {
                let m: RegExpExecArray | null
                while ((m = assignOp.exec(rest))) {
                  const op = m[1]
                  // '=' with no left operator implies reassignment
                  if (op == null || op.length > 0)
                    return true
                }
                return false
              })()
              const changed = directAssign || incDec.test(rest)
              if (!changed) {
                issues.push({
                  filePath: ctx.filePath,
                  line: i + 1,
                  column: Math.max(1, line.indexOf(name) + 1),
                  ruleId: 'prefer-const',
                  message: `'${name}' is never reassigned. Use 'const' instead`,
                  severity: 'error',
                })
              }
            }
          }
          return issues
        },
      },
      'sort-classes': {
        meta: { docs: 'Enforce sorted class members (heuristic)' },
        check: (text, ctx) => {
          const issues: PluginLintIssue[] = []
          const opts: any = ctx.options || {}
          const type: 'alphabetical' | 'natural' | 'line-length' | 'custom' | 'unsorted' = opts.type || 'alphabetical'
          const order: 'asc' | 'desc' = opts.order || 'asc'
          const ignoreCase: boolean = opts.ignoreCase !== false
          const specialCharacters: 'keep' | 'trim' | 'remove' = opts.specialCharacters || 'keep'
          const partitionByNewLine: boolean = Boolean(opts.partitionByNewLine)
          const alphabet: string = typeof opts.alphabet === 'string' ? opts.alphabet : ''

          const dir = (n: number) => (order === 'asc' ? n : -n)
          const normalizeKey = (s: string): string => {
            let k = s
            if (specialCharacters === 'trim')
              k = k.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '')
            else if (specialCharacters === 'remove')
              k = k.replace(/[^\p{L}\p{N}]+/gu, '')
            return ignoreCase ? k.toLowerCase() : k
          }
          const cmpAlpha = (a: string, b: string) => a.localeCompare(b)
          const cmpNat = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true })
          const cmpCustom = (a: string, b: string) => {
            if (!alphabet)
              return cmpAlpha(a, b)
            const ai = (c: string) => {
              const i = alphabet.indexOf(c)
              return i === -1 ? alphabet.length + c.codePointAt(0)! : i
            }
            const len = Math.min(a.length, b.length)
            for (let i = 0; i < len; i++) {
              const da = ai(a[i])
              const db = ai(b[i])
              if (da !== db)
                return da - db
            }
            return a.length - b.length
          }
          const cmpKey = (ka: string, kb: string): number => {
            if (type === 'unsorted')
              return 0
            if (type === 'line-length')
              return dir(ka.length - kb.length)
            if (type === 'natural')
              return dir(cmpNat(ka, kb))
            if (type === 'custom')
              return dir(cmpCustom(ka, kb))
            return dir(cmpAlpha(ka, kb))
          }

          const lines = text.split(/\r?\n/)
          // naive class scanner with brace balancing
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            const cls = line.match(/^\s*class\s+[A-Za-z_$][\w$]*/)
            if (!cls)
              continue
            // find opening brace
            let bodyStart = line.indexOf('{')
            let startLine = i
            if (bodyStart === -1) {
              // search next lines for '{'
              let j = i + 1
              for (; j < lines.length; j++) {
                const k = lines[j].indexOf('{')
                if (k !== -1) { bodyStart = k; startLine = j; break }
              }
              if (bodyStart === -1)
                continue
            }
            // balance braces to find body end
            let depth = 0
            let endLine = -1
            for (let j = startLine; j < lines.length; j++) {
              const ln = lines[j]
              for (const ch of ln) {
                if (ch === '{')
                  depth++
                else if (ch === '}')
                  depth--
              }
              if (depth === 0) { endLine = j; break }
            }
            if (endLine === -1)
              continue
            const body = lines.slice(startLine + 1, endLine) // exclude braces
            // collect member heads (first non-empty/non-decorator line of each member)
            const members: Array<{ name: string, line: number }> = []
            let idx = 0
            const nameFromSig = (sig: string): string => {
              // remove modifiers
              let s = sig.trim()
              s = s.replace(/^(public|protected|private|readonly|abstract|static|declare|async|override|accessor)\s+/g, '')
              if (/^constructor\b/.test(s))
                return 'constructor'
              const acc = s.match(/^(get|set)\s+([A-Za-z_$][\w$]*)/)
              if (acc)
                return acc[2]
              const meth = s.match(/^([A-Z_$][\w$]*)\s*\(/i)
              if (meth)
                return meth[1]
              const prop = s.match(/^([A-Z_$][\w$]*)\s*[:=]/i)
              if (prop)
                return prop[1]
              return s.split(/\s+/)[0] || 'unknown'
            }
            while (idx < body.length) {
              // skip blank lines and decorators
              while (idx < body.length && (/^\s*$/.test(body[idx]) || /^\s*@/.test(body[idx]))) idx++
              if (idx >= body.length)
                break
              const headLine = body[idx]
              const name = nameFromSig(headLine)
              members.push({ name, line: startLine + 1 + idx + 1 })
              // advance until next plausible member start: naive, stop at next line that looks like a member head or a blank separator
              idx++
            }

            // Partition by blank lines if requested
            const groups: Array<typeof members> = []
            if (partitionByNewLine) {
              let current: Array<{ name: string, line: number }> = []
              let lastNonEmpty = -2
              for (let j = 0; j < body.length; j++) {
                const isEmpty = /^\s*$/.test(body[j])
                if (!isEmpty)
                  lastNonEmpty = j
                const m = members.find(mm => mm.line === startLine + 1 + j + 1)
                if (m)
                  current.push(m)
                const nextIsEmpty = j + 1 < body.length ? /^\s*$/.test(body[j + 1]) : true
                if (partitionByNewLine && !isEmpty && nextIsEmpty) {
                  if (current.length)
                    groups.push(current)
                  current = []
                }
              }
              if (current.length)
                groups.push(current)
            }
            else {
              groups.push(members)
            }

            // Check each group ordering
            for (const g of groups) {
              if (g.length <= 1)
                continue
              const keys = g.map(m => normalizeKey(m.name))
              const sorted = [...keys].sort((a, b) => cmpKey(a, b))
              const same = keys.every((k, idx2) => k === sorted[idx2])
              if (!same) {
                const first = g[0]
                issues.push({
                  filePath: ctx.filePath,
                  line: first.line,
                  column: 1,
                  ruleId: 'sort-classes',
                  message: 'Class members are not sorted',
                  severity: 'warning',
                })
              }
            }
            i = endLine
          }
          return issues
        },
      },
      'sort-enums': {
        meta: { docs: 'Enforce sorted TypeScript enum members (heuristic)' },
        check: (text, ctx) => {
          const issues: PluginLintIssue[] = []
          const opts: any = ctx.options || {}
          const type: 'alphabetical' | 'natural' | 'line-length' | 'custom' | 'unsorted' = opts.type || 'alphabetical'
          const order: 'asc' | 'desc' = opts.order || 'asc'
          const ignoreCase: boolean = opts.ignoreCase !== false
          const specialCharacters: 'keep' | 'trim' | 'remove' = opts.specialCharacters || 'keep'
          const alphabet: string = typeof opts.alphabet === 'string' ? opts.alphabet : ''
          const partitionByNewLine: boolean = Boolean(opts.partitionByNewLine)
          const sortByValue: boolean = Boolean(opts.sortByValue)
          const forceNumericSort: boolean = Boolean(opts.forceNumericSort)

          const dir = (n: number) => (order === 'asc' ? n : -n)
          const normalizeKey = (s: string): string => {
            let k = s
            if (specialCharacters === 'trim')
              k = k.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '')
            else if (specialCharacters === 'remove')
              k = k.replace(/[^\p{L}\p{N}]+/gu, '')
            return ignoreCase ? k.toLowerCase() : k
          }
          const cmpAlpha = (a: string, b: string) => a.localeCompare(b)
          const cmpNat = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true })
          const cmpCustom = (a: string, b: string) => {
            if (!alphabet)
              return cmpAlpha(a, b)
            const ai = (c: string) => {
              const i = alphabet.indexOf(c)
              return i === -1 ? alphabet.length + c.codePointAt(0)! : i
            }
            const len = Math.min(a.length, b.length)
            for (let i = 0; i < len; i++) {
              const da = ai(a[i])
              const db = ai(b[i])
              if (da !== db)
                return da - db
            }
            return a.length - b.length
          }
          const cmpKey = (ka: string, kb: string): number => {
            if (type === 'unsorted')
              return 0
            if (type === 'line-length')
              return dir(ka.length - kb.length)
            if (type === 'natural')
              return dir(cmpNat(ka, kb))
            if (type === 'custom')
              return dir(cmpCustom(ka, kb))
            return dir(cmpAlpha(ka, kb))
          }

          const lines = text.split(/\r?\n/)
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            const enumStart = line.match(/^\s*enum\s+[A-Za-z_$][\w$]*/)
            if (!enumStart)
              continue
            // find opening brace
            let bodyStart = line.indexOf('{')
            let startLine = i
            if (bodyStart === -1) {
              let j = i + 1
              for (; j < lines.length; j++) {
                const k = lines[j].indexOf('{')
                if (k !== -1) { bodyStart = k; startLine = j; break }
              }
              if (bodyStart === -1)
                continue
            }
            // balance braces
            let depth = 0
            let endLine = -1
            for (let j = startLine; j < lines.length; j++) {
              const ln = lines[j]
              for (const ch of ln) {
                if (ch === '{')
                  depth++
                else if (ch === '}')
                  depth--
              }
              if (depth === 0) { endLine = j; break }
            }
            if (endLine === -1)
              continue
            const body = lines.slice(startLine + 1, endLine) // exclude braces

            // collect enum members (NAME [= value])
            interface Member { name: string, value?: string, line: number }
            const members: Member[] = []
            for (let j = 0; j < body.length; j++) {
              const ln = body[j]
              if (/^\s*$/.test(ln) || /^\s*\/\//.test(ln) || /^\s*\*/.test(ln))
                continue
              const m = ln.match(/^\s*([A-Z_$][\w$]*)\s*(?:=\s*([^,/]+)\s*)?,?\s*(?:\/\/.*)?$/i)
              if (!m)
                continue
              const name = m[1]
              const value = m[2] ? m[2].trim() : undefined
              members.push({ name, value, line: startLine + 1 + j + 1 })
            }

            // partition groups by blank line if requested
            const groups: Array<Member[]> = []
            if (partitionByNewLine) {
              let current: Member[] = []
              for (let j = 0; j < body.length; j++) {
                const ln = body[j]
                const mem = members.find(m => m.line === startLine + 1 + j + 1)
                if (mem)
                  current.push(mem)
                const nextEmpty = j + 1 < body.length ? /^\s*$/.test(body[j + 1]) : true
                if (!/^\s*$/.test(ln) && nextEmpty) { groups.push(current); current = [] }
              }
              if (current.length)
                groups.push(current)
            }
            else {
              groups.push(members)
            }

            // detect numeric enum values
            const isNumericValue = (v?: string): boolean => v != null && /^-?\d+(?:_\d+)*$/.test(v.trim())
            for (const g of groups) {
              if (g.length <= 1)
                continue
              const allNumericValues = g.every(m => isNumericValue(m.value))
              // build keys by name or value
              const keys = g.map((m) => {
                if (forceNumericSort || (sortByValue && allNumericValues)) {
                  const num = Number((m.value || '').replace(/_/g, ''))
                  return String(num)
                }
                const raw = sortByValue && m.value != null ? m.value : m.name
                return normalizeKey(String(raw))
              })
              const sorted = [...keys].sort((a, b) => cmpKey(a, b))
              const same = keys.every((k, idx2) => k === sorted[idx2])
              if (!same) {
                const first = g[0]
                issues.push({
                  filePath: ctx.filePath,
                  line: first.line,
                  column: 1,
                  ruleId: 'sort-enums',
                  message: 'Enum members are not sorted',
                  severity: 'warning',
                })
              }
            }
            i = endLine
          }
          return issues
        },
      },
      'sort-array-includes': {
        meta: { docs: 'Enforce sorted array values when immediately used with .includes(...) (heuristic)' },
        check: (text, ctx) => {
          const issues: PluginLintIssue[] = []
          const opts: any = ctx.options || {}
          const type: 'alphabetical' | 'natural' | 'line-length' | 'custom' | 'unsorted' = opts.type || 'alphabetical'
          const order: 'asc' | 'desc' = opts.order || 'asc'
          const ignoreCase: boolean = opts.ignoreCase !== false
          const specialCharacters: 'keep' | 'trim' | 'remove' = opts.specialCharacters || 'keep'
          const alphabet: string = typeof opts.alphabet === 'string' ? opts.alphabet : ''
          const partitionByNewLine: boolean = Boolean(opts.partitionByNewLine)

          const dir = (n: number) => (order === 'asc' ? n : -n)
          const normalizeKey = (s: string): string => {
            let k = s
            if (specialCharacters === 'trim')
              k = k.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '')
            else if (specialCharacters === 'remove')
              k = k.replace(/[^\p{L}\p{N}]+/gu, '')
            return ignoreCase ? k.toLowerCase() : k
          }
          const cmpAlpha = (a: string, b: string) => a.localeCompare(b)
          const cmpNat = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true })
          const cmpCustom = (a: string, b: string) => {
            if (!alphabet)
              return cmpAlpha(a, b)
            const ai = (c: string) => {
              const i = alphabet.indexOf(c)
              return i === -1 ? alphabet.length + c.codePointAt(0)! : i
            }
            const len = Math.min(a.length, b.length)
            for (let i = 0; i < len; i++) {
              const da = ai(a[i])
              const db = ai(b[i])
              if (da !== db)
                return da - db
            }
            return a.length - b.length
          }
          const cmpKey = (ka: string, kb: string): number => {
            if (type === 'unsorted')
              return 0
            if (type === 'line-length')
              return dir(ka.length - kb.length)
            if (type === 'natural')
              return dir(cmpNat(ka, kb))
            if (type === 'custom')
              return dir(cmpCustom(ka, kb))
            return dir(cmpAlpha(ka, kb))
          }

          // Scan for array literals immediately followed by .includes(
          const content = text
          const lines = content.split(/\r?\n/)
          const lineOf = (idx: number) => (content.slice(0, idx).match(/\n/g) || []).length + 1
          let i = 0
          while (i < content.length) {
            const start = content.indexOf('[', i)
            if (start === -1)
              break
            // find closing matching ']' with minimal parsing
            let j = start + 1
            let depth = 1
            let mode: 'none' | 'single' | 'double' | 'backtick' = 'none'
            let escape = false
            for (; j < content.length; j++) {
              const ch = content[j]
              if (escape) { escape = false; continue }
              if (ch === '\\') { escape = true; continue }
              if (mode === 'none') {
                if (ch === '\'') {
                  mode = 'single'
                }
                else if (ch === '"') {
                  mode = 'double'
                }
                else if (ch === '`') {
                  mode = 'backtick'
                }
                else if (ch === '[') {
                  depth++
                }
                else if (ch === ']') { depth--; if (depth === 0) { break } }
              }
              else {
                if ((mode === 'single' && ch === '\'') || (mode === 'double' && ch === '"') || (mode === 'backtick' && ch === '`'))
                  mode = 'none'
              }
            }
            if (depth !== 0) { i = start + 1; continue }
            // ensure immediate call to .includes
            let k = j + 1
            while (k < content.length && /\s/.test(content[k])) k++
            if (!content.startsWith('.includes', k)) { i = j + 1; continue }
            const arrText = content.slice(start + 1, j)
            // Partition elements by blank lines if requested
            const arrLines = arrText.split(/\r?\n/)
            const groups: string[][] = []
            if (partitionByNewLine) {
              let current: string[] = []
              for (let li = 0; li < arrLines.length; li++) {
                const ln = arrLines[li]
                if (/^\s*$/.test(ln)) { if (current.length) { groups.push(current); current = [] } continue }
                current.push(ln)
              }
              if (current.length)
                groups.push(current)
            }
            else {
              groups.push(arrLines)
            }
            // Extract simple string or numeric literals split by commas per group
            for (const g of groups) {
              const textBlock = g.join('\n')
              // split by commas not inside quotes (simple approach: match literals)
              const literals: Array<{ raw: string, key: string }> = []
              const litRe = /(['"])((?:\\.|(?!\1).)*)\1\s*,?/gs
              let m: RegExpExecArray | null
              while ((m = litRe.exec(textBlock))) {
                const raw = m[0].trim().replace(/,\s*$/, '')
                const val = m[2]
                literals.push({ raw, key: normalizeKey(val) })
              }
              if (literals.length <= 1)
                continue
              const keys = literals.map(l => l.key)
              const sorted = [...keys].sort((a, b) => cmpKey(a, b))
              const same = keys.every((k2, idx) => k2 === sorted[idx])
              if (!same) {
                const reportLine = lineOf(start)
                issues.push({ filePath: ctx.filePath, line: reportLine, column: 1, ruleId: 'sort-array-includes', message: 'Array passed to .includes(...) is not sorted', severity: 'warning' })
              }
            }
            i = j + 1
          }
          return issues
        },
      },
      'sort-switch-case': {
        meta: { docs: 'Enforce sorted switch case statements (heuristic)' },
        check: (text, ctx) => {
          const issues: PluginLintIssue[] = []
          const opts: any = ctx.options || {}
          const type: 'alphabetical' | 'natural' | 'line-length' | 'custom' | 'unsorted' = opts.type || 'alphabetical'
          const order: 'asc' | 'desc' = opts.order || 'asc'
          const ignoreCase: boolean = opts.ignoreCase !== false
          const specialCharacters: 'keep' | 'trim' | 'remove' = opts.specialCharacters || 'keep'
          const alphabet: string = typeof opts.alphabet === 'string' ? opts.alphabet : ''

          const dir = (n: number) => (order === 'asc' ? n : -n)
          const normalizeKey = (s: string): string => {
            let k = s
            if (specialCharacters === 'trim')
              k = k.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '')
            else if (specialCharacters === 'remove')
              k = k.replace(/[^\p{L}\p{N}]+/gu, '')
            return ignoreCase ? k.toLowerCase() : k
          }
          const cmpAlpha = (a: string, b: string) => a.localeCompare(b)
          const cmpNat = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true })
          const cmpCustom = (a: string, b: string) => {
            if (!alphabet)
              return cmpAlpha(a, b)
            const ai = (c: string) => {
              const i = alphabet.indexOf(c)
              return i === -1 ? alphabet.length + c.codePointAt(0)! : i
            }
            const len = Math.min(a.length, b.length)
            for (let i = 0; i < len; i++) {
              const da = ai(a[i])
              const db = ai(b[i])
              if (da !== db)
                return da - db
            }
            return a.length - b.length
          }
          const cmpKey = (ka: string, kb: string): number => {
            if (type === 'unsorted')
              return 0
            if (type === 'line-length')
              return dir(ka.length - kb.length)
            if (type === 'natural')
              return dir(cmpNat(ka, kb))
            if (type === 'custom')
              return dir(cmpCustom(ka, kb))
            return dir(cmpAlpha(ka, kb))
          }

          const content = text
          let i = 0
          const lineOf = (idx: number) => (content.slice(0, idx).match(/\n/g) || []).length + 1
          while (i < content.length) {
            const sw = content.indexOf('switch', i)
            if (sw === -1)
              break
            // ensure followed by whitespace and '('
            const after = content.slice(sw)
            const m = after.match(/^switch\s*\(/)
            if (!m) { i = sw + 6; continue }
            // find '{' for switch body
            let p = sw + m[0].length
            let paren = 1
            while (p < content.length && paren > 0) {
              const ch = content[p]
              if (ch === '(')
                paren++
              else if (ch === ')')
                paren--
              p++
            }
            // now expect optional ws then '{'
            while (p < content.length && /\s/.test(content[p])) p++
            if (content[p] !== '{') { i = p + 1; continue }
            const bodyStart = p
            // balance braces for switch
            let depth = 0
            let q = bodyStart
            for (; q < content.length; q++) {
              const ch = content[q]
              if (ch === '{') {
                depth++
              }
              else if (ch === '}') { depth--; if (depth === 0) { q++; break } }
            }
            const body = content.slice(bodyStart + 1, q - 1)
            // extract top-level case labels in this switch
            const caseRe = /^\s*case\s+([\s\S]*?):/gm
            const cases: Array<{ raw: string, key: string, idx: number }> = []
            let mm: RegExpExecArray | null
            while ((mm = caseRe.exec(body))) {
              const raw = mm[1].trim()
              // name for comparison: try to get string literal content or identifier
              let name = raw
              const str = raw.match(/^(['"])((?:\\.|(?!\1).)*)\1/)
              if (str)
                name = str[2]
              else name = raw.split(/[\s|&+\-*/%<>=,;]+/)[0]
              const key = normalizeKey(name)
              cases.push({ raw: name, key, idx: mm.index })
            }
            if (cases.length > 1) {
              const keys = cases.map(c => c.key)
              const sorted = [...keys].sort((a, b) => cmpKey(a, b))
              const same = keys.every((k2, idx2) => k2 === sorted[idx2])
              if (!same) {
                const report = lineOf(bodyStart + 1 + (cases[0]?.idx || 0))
                issues.push({ filePath: ctx.filePath, line: report, column: 1, ruleId: 'sort-switch-case', message: 'Switch cases are not sorted', severity: 'warning' })
              }
            }
            i = q
          }
          return issues
        },
      },
      'sort-interfaces': {
        meta: { docs: 'Enforce sorted TypeScript interface properties (heuristic)' },
        check: (text, ctx) => {
          const issues: PluginLintIssue[] = []
          const opts: any = ctx.options || {}
          const type: 'alphabetical' | 'natural' | 'line-length' | 'custom' | 'unsorted' = opts.type || 'alphabetical'
          const order: 'asc' | 'desc' = opts.order || 'asc'
          const ignoreCase: boolean = opts.ignoreCase !== false
          const specialCharacters: 'keep' | 'trim' | 'remove' = opts.specialCharacters || 'keep'
          const alphabet: string = typeof opts.alphabet === 'string' ? opts.alphabet : ''
          const partitionByNewLine: boolean = Boolean(opts.partitionByNewLine)
          const sortBy: 'name' | 'value' = (opts.sortBy === 'value' ? 'value' : 'name')

          const dir = (n: number) => (order === 'asc' ? n : -n)
          const normalizeKey = (s: string): string => {
            let k = s
            if (specialCharacters === 'trim')
              k = k.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '')
            else if (specialCharacters === 'remove')
              k = k.replace(/[^\p{L}\p{N}]+/gu, '')
            return ignoreCase ? k.toLowerCase() : k
          }
          const cmpAlpha = (a: string, b: string) => a.localeCompare(b)
          const cmpNat = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true })
          const cmpCustom = (a: string, b: string) => {
            if (!alphabet)
              return cmpAlpha(a, b)
            const ai = (c: string) => {
              const i = alphabet.indexOf(c)
              return i === -1 ? alphabet.length + c.codePointAt(0)! : i
            }
            const len = Math.min(a.length, b.length)
            for (let i = 0; i < len; i++) {
              const da = ai(a[i])
              const db = ai(b[i])
              if (da !== db)
                return da - db
            }
            return a.length - b.length
          }
          const cmpKey = (ka: string, kb: string): number => {
            if (type === 'unsorted')
              return 0
            if (type === 'line-length')
              return dir(ka.length - kb.length)
            if (type === 'natural')
              return dir(cmpNat(ka, kb))
            if (type === 'custom')
              return dir(cmpCustom(ka, kb))
            return dir(cmpAlpha(ka, kb))
          }

          const content = text
          const lines = content.split(/\r?\n/)
          const lineOf = (idx: number) => (content.slice(0, idx).match(/\n/g) || []).length + 1
          let i = 0
          while (i < content.length) {
            const pos = content.indexOf('interface ', i)
            if (pos === -1)
              break
            // ensure keyword at boundary
            const prev = pos > 0 ? content[pos - 1] : ' '
            if (/\w/.test(prev)) { i = pos + 1; continue }
            // find name and opening brace
            const j = pos + 'interface'.length
            // move to '{'
            const braceIdx = content.indexOf('{', j)
            if (braceIdx === -1) { i = pos + 1; continue }
            // balance braces
            let depth = 0
            let k = braceIdx
            for (; k < content.length; k++) {
              const ch = content[k]
              if (ch === '{') {
                depth++
              }
              else if (ch === '}') { depth--; if (depth === 0) { k++; break } }
            }
            const body = content.slice(braceIdx + 1, k - 1)
            const bodyLines = body.split(/\r?\n/)
            interface Member { name: string, value?: string, line: number }
            const members: Member[] = []
            // parse simple property/method signatures per line
            for (let bi = 0; bi < bodyLines.length; bi++) {
              const ln = bodyLines[bi]
              if (/^\s*$/.test(ln))
                continue
              if (/^\s*\//.test(ln) || /^\s*\*/.test(ln))
                continue // skip comment lines
              const signature = ln.trim()
              // property: name ... : type
              let m = signature.match(/^([A-Z_$][\w$]*)(\??)\s*:\s*([^;]+)/i)
              if (m) {
                const name = m[1]
                const value = m[3].trim()
                members.push({ name, value, line: lineOf(braceIdx + 1) + bi })
                continue
              }
              // method: name(...)
              m = signature.match(/^([A-Z_$][\w$]*)\s*\(/i)
              if (m) {
                const name = m[1]
                members.push({ name, line: lineOf(braceIdx + 1) + bi })
              }
            }

            // partition by blank lines if requested
            const groups: Member[][] = []
            if (partitionByNewLine) {
              let current: Member[] = []
              for (let bi = 0; bi < bodyLines.length; bi++) {
                const ln = bodyLines[bi]
                const mem = members.find(m => m.line === lineOf(braceIdx + 1) + bi)
                if (mem)
                  current.push(mem)
                const nextEmpty = bi + 1 < bodyLines.length ? /^\s*$/.test(bodyLines[bi + 1]) : true
                if (!/^\s*$/.test(ln) && nextEmpty) {
                  if (current.length)
                    groups.push(current); current = []
                }
              }
              if (current.length)
                groups.push(current)
            }
            else {
              groups.push(members)
            }

            for (const g of groups) {
              if (g.length <= 1)
                continue
              const keys = g.map((m) => {
                if (sortBy === 'value' && m.value)
                  return normalizeKey(m.value)
                return normalizeKey(m.name)
              })
              const sorted = [...keys].sort((a, b) => cmpKey(a, b))
              const same = keys.every((kk, idx2) => kk === sorted[idx2])
              if (!same) {
                const reportLine = g[0].line
                issues.push({ filePath: ctx.filePath, line: reportLine, column: 1, ruleId: 'sort-interfaces', message: 'Interface members are not sorted', severity: 'warning' })
              }
            }
            i = k
          }
          return issues
        },
      },
      'sort-object-types': {
        meta: { docs: 'Enforce sorted object type properties in TypeScript (heuristic)' },
        check: (text, ctx) => {
          const issues: PluginLintIssue[] = []
          const opts: any = ctx.options || {}
          const type: 'alphabetical' | 'natural' | 'line-length' | 'custom' | 'unsorted' = opts.type || 'alphabetical'
          const order: 'asc' | 'desc' = opts.order || 'asc'
          const ignoreCase: boolean = opts.ignoreCase !== false
          const specialCharacters: 'keep' | 'trim' | 'remove' = opts.specialCharacters || 'keep'
          const alphabet: string = typeof opts.alphabet === 'string' ? opts.alphabet : ''
          const partitionByNewLine: boolean = Boolean(opts.partitionByNewLine)
          const sortBy: 'name' | 'value' = (opts.sortBy === 'value' ? 'value' : 'name')

          const dir = (n: number) => (order === 'asc' ? n : -n)
          const normalizeKey = (s: string): string => {
            let k = s
            if (specialCharacters === 'trim')
              k = k.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '')
            else if (specialCharacters === 'remove')
              k = k.replace(/[^\p{L}\p{N}]+/gu, '')
            return ignoreCase ? k.toLowerCase() : k
          }
          const cmpAlpha = (a: string, b: string) => a.localeCompare(b)
          const cmpNat = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true })
          const cmpCustom = (a: string, b: string) => {
            if (!alphabet)
              return cmpAlpha(a, b)
            const ai = (c: string) => {
              const i = alphabet.indexOf(c)
              return i === -1 ? alphabet.length + c.codePointAt(0)! : i
            }
            const len = Math.min(a.length, b.length)
            for (let i = 0; i < len; i++) {
              const da = ai(a[i])
              const db = ai(b[i])
              if (da !== db)
                return da - db
            }
            return a.length - b.length
          }
          const cmpKey = (ka: string, kb: string): number => {
            if (type === 'unsorted')
              return 0
            if (type === 'line-length')
              return dir(ka.length - kb.length)
            if (type === 'natural')
              return dir(cmpNat(ka, kb))
            if (type === 'custom')
              return dir(cmpCustom(ka, kb))
            return dir(cmpAlpha(ka, kb))
          }

          const content = text
          const lineOf = (idx: number) => (content.slice(0, idx).match(/\n/g) || []).length + 1
          let i = 0
          while (i < content.length) {
            const pos = content.indexOf('type ', i)
            if (pos === -1)
              break
            // must have '=' and '{' after
            const eq = content.indexOf('=', pos)
            if (eq === -1) { i = pos + 1; continue }
            // find first '{' after '='
            const braceIdx = content.indexOf('{', eq)
            if (braceIdx === -1) { i = eq + 1; continue }
            // balance braces until matching '}'
            let depth = 0
            let k = braceIdx
            for (; k < content.length; k++) {
              const ch = content[k]
              if (ch === '{') {
                depth++
              }
              else if (ch === '}') { depth--; if (depth === 0) { k++; break } }
            }
            const body = content.slice(braceIdx + 1, k - 1)
            const bodyLines = body.split(/\r?\n/)
            interface Member { name: string, value?: string, line: number }
            const members: Member[] = []
            for (let bi = 0; bi < bodyLines.length; bi++) {
              const ln = bodyLines[bi]
              if (/^\s*$/.test(ln))
                continue
              if (/^\s*\//.test(ln) || /^\s*\*/.test(ln))
                continue
              const signature = ln.trim()
              // property signature: name ... : type
              let m = signature.match(/^([A-Z_$][\w$]*)(\??)\s*:\s*([^;]+)/i)
              if (m) {
                const name = m[1]
                const value = m[3].trim()
                members.push({ name, value, line: lineOf(braceIdx + 1) + bi })
                continue
              }
              // method signature: name(...)
              m = signature.match(/^([A-Z_$][\w$]*)\s*\(/i)
              if (m) {
                const name = m[1]
                members.push({ name, line: lineOf(braceIdx + 1) + bi })
              }
            }
            // grouping by new lines
            const groups: Member[][] = []
            if (partitionByNewLine) {
              let current: Member[] = []
              for (let bi = 0; bi < bodyLines.length; bi++) {
                const ln = bodyLines[bi]
                const mem = members.find(m => m.line === lineOf(braceIdx + 1) + bi)
                if (mem)
                  current.push(mem)
                const nextEmpty = bi + 1 < bodyLines.length ? /^\s*$/.test(bodyLines[bi + 1]) : true
                if (!/^\s*$/.test(ln) && nextEmpty) {
                  if (current.length)
                    groups.push(current); current = []
                }
              }
              if (current.length)
                groups.push(current)
            }
            else {
              groups.push(members)
            }

            for (const g of groups) {
              if (g.length <= 1)
                continue
              const keys = g.map(m => sortBy === 'value' && m.value ? normalizeKey(m.value) : normalizeKey(m.name))
              const sorted = [...keys].sort((a, b) => cmpKey(a, b))
              const same = keys.every((kk, idx2) => kk === sorted[idx2])
              if (!same) {
                const reportLine = g[0].line
                issues.push({ filePath: ctx.filePath, line: reportLine, column: 1, ruleId: 'sort-object-types', message: 'Object type members are not sorted', severity: 'warning' })
              }
            }
            i = k
          }
          return issues
        },
      },
      'sort-maps': {
        meta: { docs: 'Enforce sorted elements within JavaScript Map([...]) literals (heuristic)' },
        check: (text, ctx) => {
          const issues: PluginLintIssue[] = []
          const opts: any = ctx.options || {}
          const type: 'alphabetical' | 'natural' | 'line-length' | 'custom' | 'unsorted' = opts.type || 'alphabetical'
          const order: 'asc' | 'desc' = opts.order || 'asc'
          const ignoreCase: boolean = opts.ignoreCase !== false
          const specialCharacters: 'keep' | 'trim' | 'remove' = opts.specialCharacters || 'keep'
          const alphabet: string = typeof opts.alphabet === 'string' ? opts.alphabet : ''
          const partitionByNewLine: boolean = Boolean(opts.partitionByNewLine)

          const dir = (n: number) => (order === 'asc' ? n : -n)
          const normalizeKey = (s: string): string => {
            let k = s
            if (specialCharacters === 'trim')
              k = k.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '')
            else if (specialCharacters === 'remove')
              k = k.replace(/[^\p{L}\p{N}]+/gu, '')
            return ignoreCase ? k.toLowerCase() : k
          }
          const cmpAlpha = (a: string, b: string) => a.localeCompare(b)
          const cmpNat = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true })
          const cmpCustom = (a: string, b: string) => {
            if (!alphabet)
              return cmpAlpha(a, b)
            const ai = (c: string) => {
              const i = alphabet.indexOf(c)
              return i === -1 ? alphabet.length + c.codePointAt(0)! : i
            }
            const len = Math.min(a.length, b.length)
            for (let i = 0; i < len; i++) {
              const da = ai(a[i])
              const db = ai(b[i])
              if (da !== db)
                return da - db
            }
            return a.length - b.length
          }
          const cmpKey = (ka: string, kb: string): number => {
            if (type === 'unsorted')
              return 0
            if (type === 'line-length')
              return dir(ka.length - kb.length)
            if (type === 'natural')
              return dir(cmpNat(ka, kb))
            if (type === 'custom')
              return dir(cmpCustom(ka, kb))
            return dir(cmpAlpha(ka, kb))
          }

          const content = text
          const lineOf = (idx: number) => (content.slice(0, idx).match(/\n/g) || []).length + 1
          let i = 0
          while (i < content.length) {
            const pos = content.indexOf('new Map', i)
            if (pos === -1)
              break
            // find opening '(' and then '[' for array literal
            let p = content.indexOf('(', pos)
            if (p === -1) { i = pos + 7; continue }
            while (p < content.length && /\s/.test(content[p + 1] || '')) p++
            const arrStart = content.indexOf('[', p)
            if (arrStart === -1) { i = p + 1; continue }
            // find matching ']' for array literal with simple bracket/string awareness
            let depth = 0
            let j = arrStart
            let mode: 'none' | 'single' | 'double' | 'backtick' = 'none'
            let escape = false
            for (; j < content.length; j++) {
              const ch = content[j]
              if (escape) { escape = false; continue }
              if (ch === '\\') { escape = true; continue }
              if (mode === 'none') {
                if (ch === '\'') {
                  mode = 'single'
                }
                else if (ch === '"') {
                  mode = 'double'
                }
                else if (ch === '`') {
                  mode = 'backtick'
                }
                else if (ch === '[') {
                  depth++
                }
                else if (ch === ']') { depth--; if (depth === 0) { j++; break } }
              }
              else {
                if ((mode === 'single' && ch === '\'') || (mode === 'double' && ch === '"') || (mode === 'backtick' && ch === '`'))
                  mode = 'none'
              }
            }
            if (depth !== 0) { i = pos + 7; continue }
            const arrayText = content.slice(arrStart + 1, j - 1)
            const arrLines = arrayText.split(/\r?\n/)
            // find entries of the form ['key', ...] or ["key", ...] or [number, ...]
            const entries: Array<{ key: string, idx: number, line: number }> = []
            const entryRe = /\[\s*(?:'([^']*)'|"([^"]*)"|(-?\d+(?:_\d+)*))\s*,/g
            let m: RegExpExecArray | null
            while ((m = entryRe.exec(arrayText))) {
              const rawKey = (m[1] ?? m[2] ?? m[3] ?? '').toString()
              const key = normalizeKey(rawKey)
              const idxInArray = m.index
              const line = (arrayText.slice(0, idxInArray).match(/\n/g) || []).length
              entries.push({ key, idx: idxInArray, line })
            }
            if (entries.length > 1) {
              if (partitionByNewLine) {
                // group by blank-line separated blocks
                const groups: Array<typeof entries> = []
                let current: typeof entries = []
                const isBlank = (ln: number) => /^\s*$/.test(arrLines[ln] || '')
                for (let ei = 0; ei < entries.length; ei++) {
                  current.push(entries[ei])
                  const ln = entries[ei].line
                  // if next line is blank, end group
                  if (ln + 1 < arrLines.length && isBlank(ln + 1)) { groups.push(current); current = [] }
                }
                if (current.length)
                  groups.push(current)
                for (const g of groups) {
                  const keys = g.map(e => e.key)
                  const sorted = [...keys].sort((a, b) => cmpKey(a, b))
                  const same = keys.every((kk, idx2) => kk === sorted[idx2])
                  if (!same) {
                    issues.push({ filePath: ctx.filePath, line: lineOf(arrStart), column: 1, ruleId: 'sort-maps', message: 'Map entries are not sorted', severity: 'warning' })
                    break
                  }
                }
              }
              else {
                const keys = entries.map(e => e.key)
                const sorted = [...keys].sort((a, b) => cmpKey(a, b))
                const same = keys.every((kk, idx2) => kk === sorted[idx2])
                if (!same) {
                  issues.push({ filePath: ctx.filePath, line: lineOf(arrStart), column: 1, ruleId: 'sort-maps', message: 'Map entries are not sorted', severity: 'warning' })
                }
              }
            }
            i = j + 1
          }
          return issues
        },
      },
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
                const tokens = inner.split(/[^$\w]+/).filter(Boolean)
                for (const t of tokens) names.push(t)
              }
              for (const name of names) {
                if (varIgnoreRe.test(name))
                  continue
                const restStartIdx = full.indexOf(line)
                const rest = full.slice(restStartIdx + line.length)
                const refRe = new RegExp(`\\b${name}\\b`, 'g')
                if (!refRe.test(rest)) {
                  issues.push({
                    filePath: ctx.filePath,
                    line: i + 1,
                    column: Math.max(1, line.indexOf(name) + 1),
                    ruleId: 'no-unused-vars',
                    message: `'${name}' is assigned a value but never used. Allowed unused vars must match /${varsIgnorePattern}/u`,
                    severity: 'error',
                  })
                }
              }
            }
          }

          // function decl params
          const funcDeclRe = /function\s+[A-Za-z_$][\w$]*\s*\(([^)]*)\)\s*\{/g
          let m: RegExpExecArray | null
          while ((m = funcDeclRe.exec(full))) {
            const paramsSrc = m[1]
            const paramNames = paramsSrc.split(',').map(s => s.trim()).filter(Boolean).map((p) => {
              const simple = p.match(/^([$A-Z_][\w$]*)/i)
              if (simple)
                return simple[1]
              const id = p.match(/\b([$A-Z_][\w$]*)\b/i)
              return id ? id[1] : ''
            }).filter(Boolean)
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
                const startText = full.slice(0, m.index)
                const baseLine = (startText.match(/\n/g) || []).length + 1
                const lineOffset = (m[0].slice(0, m[0].indexOf('(')).match(/\n/g) || []).length
                issues.push({
                  filePath: ctx.filePath,
                  line: baseLine + lineOffset,
                  column: 1,
                  ruleId: 'no-unused-vars',
                  message: `'${name}' is assigned a value but never used. Allowed unused vars must match /${argsIgnorePattern}/u`,
                  severity: 'error',
                })
              }
            }
          }

          // arrow/function expressions params
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
              const rest = full.slice(m.index + m[0].length)
              const endIdx = rest.search(/[\n;]/)
              body = endIdx === -1 ? rest : rest.slice(0, endIdx)
            }
            for (const name of paramNames) {
              if (!name || argIgnoreRe.test(name))
                continue
              const refRe = new RegExp(`\\b${name}\\b`, 'g')
              if (!refRe.test(body)) {
                const before = full.slice(0, m.index)
                const baseLine = (before.match(/\n/g) || []).length + 1
                issues.push({
                  filePath: ctx.filePath,
                  line: baseLine,
                  column: 1,
                  ruleId: 'no-unused-vars',
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
                ruleId: 'max-statements-per-line',
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
  // moved no-unused-vars into pickier plugin above (legacy 'unused-imports' prefix still accepted in config)
  // Built-in regexp plugin subset
  const regexpPlugin: PickierPlugin = {
    name: 'regexp',
    rules: {
      'no-super-linear-backtracking': {
        meta: { docs: 'Detects potentially super-linear backtracking patterns in regex literals (heuristic)' },
        check: (text, ctx) => {
          const issues: PluginLintIssue[] = []
          const regexLiteral = /\/[^/\\]*(?:\\.[^/\\]*)*\//g
          const mark = (idx: number, len: number, msg: string) => {
            const before = text.slice(0, idx)
            const line = (before.match(/\n/g) || []).length + 1
            const col = idx - before.lastIndexOf('\n')
            issues.push({ filePath: ctx.filePath, line, column: col, ruleId: 'no-super-linear-backtracking', message: msg, severity: 'error' })
          }
          let m: RegExpExecArray | null
          while ((m = regexLiteral.exec(text))) {
            const literal = m[0]
            const idx = m.index
            const patt = literal.slice(1, literal.lastIndexOf('/'))
            const flat = patt.replace(/\[.*?\]/g, '') // strip char classes heuristically
            // Heuristics:
            // 1) Overlapping adjacent unlimited quantifiers that can exchange characters (e.g., .+?\s*, \s*.+?, .*\s*, \s*.*)
            const exch = flat.includes('.+?\\s*') || flat.includes('\\s*.+?') || flat.includes('.*\\s*') || flat.includes('\\s*.*')
            if (exch) { mark(idx, literal.length, 'The combination of \' .*\' or \' .+?\' with \'\\s*\' can cause super-linear backtracking due to exchangeable characters'); continue }
            // 2) Repeated wildcards next to each other: ".*.*" or variations
            const collapsed = flat.replace(/\s+/g, '')
            if (/(?:\.\*\??){2,}/.test(collapsed) || /(?:\.\+\??){2,}/.test(collapsed) || /\.\*\??\.\+\??|\.\+\??\.\*\??/.test(collapsed)) {
              mark(idx, literal.length, 'Multiple adjacent unlimited wildcard quantifiers can cause super-linear backtracking')
              continue
            }
            // 3) Nested unlimited quantifiers like (.+)+, (.*)+, (?:...+)+
            if (/\((?:\?:)?[^)]*?[+*][^)]*\)\s*[+*]/.test(flat)) {
              mark(idx, literal.length, 'Nested unlimited quantifiers detected (e.g., (.+)+) which can cause catastrophic backtracking')
              continue
            }
          }
          return issues
        },
      },
    },
  }
  pluginDefs.push(regexpPlugin)
  // Built-in TypeScript plugin subset
  const tsPlugin: PickierPlugin = {
    name: 'ts',
    rules: {
      'no-require-imports': {
        meta: { docs: 'Disallow require() in TypeScript files; prefer ESM imports' },
        check: (text, ctx) => {
          const issues: PluginLintIssue[] = []
          if (!/\.ts$/.test(ctx.filePath))
            return issues
          const lines = text.split(/\r?\n/)
          let inBlockComment = false
          for (let i = 0; i < lines.length; i++) {
            const raw = lines[i]
            let line = raw
            // handle simple block comments spanning lines
            if (inBlockComment) {
              const endIdx = line.indexOf('*/')
              if (endIdx >= 0) {
                line = line.slice(endIdx + 2)
                inBlockComment = false
              }
              else {
                continue
              }
            }
            // strip inline comments after code for detection purposes
            const blockStart = line.indexOf('/*')
            const lineComment = line.indexOf('//')
            if (blockStart >= 0 && (lineComment === -1 || blockStart < lineComment)) {
              const endIdx = line.indexOf('*/', blockStart + 2)
              if (endIdx >= 0) {
                line = line.slice(0, blockStart) + line.slice(endIdx + 2)
              }
              else {
                inBlockComment = true
                line = line.slice(0, blockStart)
              }
            }
            if (lineComment >= 0)
              line = line.slice(0, lineComment)
            const trimmed = line.trim()
            if (!trimmed)
              continue
            // ignore dynamic import(...)
            if (/\bimport\s*\(/.test(trimmed))
              continue
            // flag require(...)
            const idx = trimmed.indexOf('require(')
            if (idx >= 0) {
              issues.push({
                filePath: ctx.filePath,
                line: i + 1,
                column: raw.indexOf('require(') + 1 || idx + 1,
                ruleId: 'ts/no-require-imports',
                message: 'Do not use require() in TypeScript files. Use ESM import syntax instead.',
                severity: 'error',
              })
              continue
            }
            // also flag import = require('...') pattern
            if (/^import\s+(?:\S.*|[\t\v\f \xA0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF])=\s*require\s*\(/.test(trimmed)) {
              const col = raw.indexOf('require(')
              issues.push({
                filePath: ctx.filePath,
                line: i + 1,
                column: col > -1 ? col + 1 : 1,
                ruleId: 'ts/no-require-imports',
                message: 'Do not use require() in TypeScript files. Use ESM import syntax instead.',
                severity: 'error',
              })
            }
          }
          return issues
        },
      },
    },
  }
  pluginDefs.push(tsPlugin)
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
      const conf = (configured as any)[ruleName] ?? (configured as any)[fullName]
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

  // Support inline suppression for next line via both ESLint and Pickier prefixes
  // Examples:
  // // eslint-disable-next-line no-console, quotes
  // // pickier-disable-next-line sort-objects
  // /* eslint-disable-next-line no-console */
  const disabledNextLine: Map<number, { all: boolean, rules: Set<string> }> = new Map()
  const registerDisable = (targetLine: number, rulesPart: string | undefined) => {
    if (targetLine < 1)
      return
    const entry = { all: false, rules: new Set<string>() }
    const part = (rulesPart || '').trim()
    if (!part) {
      entry.all = true
    }
    else {
      // split by commas or whitespace
      const tokens = part.split(/[\s,]+/).map(s => s.trim()).filter(Boolean)
      for (const t of tokens)
        entry.rules.add(t)
    }
    disabledNextLine.set(targetLine, entry)
  }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    // line comments
    const m1 = line.match(/^\s*\/\/\s*(?:eslint|pickier)-disable-next-line(?:\s+(.+))?\s*$/)
    if (m1)
      registerDisable(i + 2, m1[1])
    // block comments in one line
    const m2 = line.match(/^\s*\/\*\s*(?:eslint|pickier)-disable-next-line(?:\s+(.+?))?\s*\*\/\s*$/)
    if (m2)
      registerDisable(i + 2, m2[1])
  }
  const isSuppressed = (ruleId: string, lineNo: number): boolean => {
    const ent = disabledNextLine.get(lineNo)
    if (!ent)
      return false
    if (ent.all)
      return true
    // match exact, plugin-prefixed, or suffix form
    for (const t of ent.rules) {
      if (t === ruleId)
        return true
      if (t.endsWith(`/${ruleId}`))
        return true
      if (ruleId.endsWith(`/${t}`))
        return true
    }
    return false
  }

  const debuggerStmt = /^\s*debugger\b/ // statement-only, not inside strings

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNo = i + 1

    if (cfg.rules.noDebugger !== 'off' && debuggerStmt.test(line)) {
      const col = line.search(/\S|$/) + 1
      if (!isSuppressed('no-debugger', lineNo)) {
        issues.push({
          filePath,
          line: lineNo,
          column: col,
          ruleId: 'no-debugger',
          message: 'Unexpected debugger statement.',
          severity: cfg.rules.noDebugger === 'error' ? 'error' : 'warning',
        })
      }
    }

    if (cfg.rules.noConsole !== 'off') {
      const conCol = line.indexOf('console.')
      if (conCol !== -1) {
        if (!isSuppressed('no-console', lineNo)) {
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
    }

    // quote preference diagnostics (only for code files)
    if (/\.(?:ts|tsx|js|jsx)$/.test(filePath)) {
      const quoteIdx = detectQuoteIssues(line, cfg.format.quotes)
      for (const idx of quoteIdx) {
        if (!isSuppressed('quotes', lineNo)) {
          issues.push({
            filePath,
            line: lineNo,
            column: idx + 1,
            ruleId: 'quotes',
            message: `Strings must use ${cfg.format.quotes} quotes.`,
            severity: 'warning',
          })
        }
      }

      // indentation diagnostics
      const leadingMatch = line.match(/^[ \t]*/)
      const leading = leadingMatch ? leadingMatch[0] : ''
      if (hasIndentIssue(leading, cfg.format.indent, cfg.format.indentStyle || 'spaces')) {
        const firstNonWs = line.search(/\S|$/)
        if (!isSuppressed('indent', lineNo)) {
          issues.push({
            filePath,
            line: lineNo,
            column: Math.max(1, firstNonWs),
            ruleId: 'indent',
            message: cfg.format.indentStyle === 'tabs'
              ? 'Indentation must use tabs.'
              : `Indentation must be a multiple of ${cfg.format.indent} spaces.`,
            severity: 'warning',
          })
        }
      }
    }
  }

  // RegExp: no-unused-capturing-group (heuristic across entire file)
  if (cfg.rules.noUnusedCapturingGroup && cfg.rules.noUnusedCapturingGroup !== 'off') {
    const addIssue = (line: number, col: number) => {
      if (isSuppressed('regexp/no-unused-capturing-group', line))
        return
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
    const addIssue = (l: number, c: number) => {
      if (isSuppressed('no-cond-assign', l))
        return
      issues.push({ filePath, line: l, column: c, ruleId: 'no-cond-assign', message: 'Unexpected assignment within a \'while\' statement', severity: cfg.rules.noCondAssign === 'error' ? 'error' : 'warning' })
    }
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

  // no-template-curly-in-string: flag template literal syntax in regular strings
  if (cfg.rules.noTemplateCurlyInString && cfg.rules.noTemplateCurlyInString !== 'off') {
    const addIssue = (l: number, c: number) => {
      if (isSuppressed('no-template-curly-in-string', l))
        return
      issues.push({
        filePath,
        line: l,
        column: c,
        ruleId: 'no-template-curly-in-string',
        message: 'Unexpected template string expression.',
        severity: cfg.rules.noTemplateCurlyInString === 'error' ? 'error' : 'warning',
      })
    }

    // Check for ${...} patterns in single and double quoted strings
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineNo = i + 1

      // Match quoted strings and check for template patterns inside them
      const stringPattern = /(['"])((?:\\.|(?!\1)[^\\])*)\1/g
      let stringMatch: RegExpExecArray | null

      while ((stringMatch = stringPattern.exec(line))) {
        const [, , rawStringContent] = stringMatch
        
        // Process escape sequences to get the actual string content
        const stringContent = rawStringContent.replace(/\\(.)/g, (match, char) => {
          switch (char) {
            case 'n': return '\n'
            case 't': return '\t'
            case 'r': return '\r'
            case '\\': return '\\'
            case '"': return '"'
            case "'": return "'"
            default: return match // Keep the original escape sequence for unknown escapes
          }
        })

        // Check for ${...} patterns, excluding escaped ones
        const templatePattern = /\$\{[^}]*\}/g
        let templateMatch: RegExpExecArray | null

        while ((templateMatch = templatePattern.exec(stringContent))) {
          const templatePos = templateMatch.index || 0
          // Check if the $ is escaped by looking at the character before it
          if (templatePos > 0 && stringContent[templatePos - 1] === '\\') {
            // Count consecutive backslashes to determine if it's actually escaped
            let backslashCount = 0
            for (let j = templatePos - 1; j >= 0 && stringContent[j] === '\\'; j--) {
              backslashCount++
            }
            // If odd number of backslashes, the $ is escaped
            if (backslashCount % 2 === 1) {
              continue
            }
          }

          // Calculate the position in the original line
          // We need to map from processed string position back to raw string position
          let rawPos = 0
          let processedPos = 0
          while (processedPos < templatePos && rawPos < rawStringContent.length) {
            if (rawStringContent[rawPos] === '\\' && rawPos + 1 < rawStringContent.length) {
              rawPos += 2 // Skip escape sequence
            } else {
              rawPos++
            }
            processedPos++
          }
          
          const startPos = stringMatch.index || 0
          addIssue(lineNo, startPos + rawPos + 1) // +1 to account for quote
        }
      }
    }
  }

  // plugin-based rules
  const pluginIssues = applyPlugins(filePath, content, cfg)
  const filteredPluginIssues = pluginIssues.filter(i => !isSuppressed(i.ruleId, i.line))
  return issues.concat(filteredPluginIssues)
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

  const entries: string[] = await tinyGlob(patterns, {
    dot: false,
    ignore: cfg.ignores,
    onlyFiles: true,
    absolute: true,
  })

  const files = entries.filter((f: string) => isCodeFile(f, extSet))

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
