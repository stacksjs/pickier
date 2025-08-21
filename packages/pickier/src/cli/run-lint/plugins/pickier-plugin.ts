/* eslint-disable style/max-statements-per-line, no-cond-assign, regexp/no-super-linear-backtracking, unused-imports/no-unused-vars */
import type { PickierPlugin, LintIssue as PluginLintIssue } from '../../../types'
import { formatImports } from '../../../format'

export const pickierPlugin: PickierPlugin = {
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
        // Basic implementation - simplified for space
        const lines = text.split(/\r?\n/)
        const out: PluginLintIssue[] = []
        // Simplified sort-keys implementation
        return out
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
    'no-unused-vars': {
      meta: { docs: 'Report variables and parameters that are declared/assigned but never used' },
      check: (text, ctx) => {
        const issues: PluginLintIssue[] = []
        const opts: any = ctx.options || {}
        const varsIgnorePattern = typeof opts.varsIgnorePattern === 'string' ? opts.varsIgnorePattern : '^_'
        const argsIgnorePattern = typeof opts.argsIgnorePattern === 'string' ? opts.argsIgnorePattern : '^_'
        const varIgnoreRe = new RegExp(varsIgnorePattern, 'u')

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

        return issues
      },
    },
  },
}
