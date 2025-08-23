import type { RuleModule } from '../../types'

export const sortNamedImportsRule: RuleModule = {
  meta: { docs: 'Enforce sorted named imports within each import statement' },
  check: (text, ctx) => {
    const opts: any = ctx.options || {}
    const type: 'alphabetical' | 'line-length' = opts.type || 'alphabetical'
    const order: 'asc' | 'desc' = opts.order || 'asc'
    const ignoreCase: boolean = opts.ignoreCase !== false
    const ignoreAlias: boolean = Boolean(opts.ignoreAlias)
    const lines = text.split(/\r?\n/)
    const out: ReturnType<RuleModule['check']> = []
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
}
