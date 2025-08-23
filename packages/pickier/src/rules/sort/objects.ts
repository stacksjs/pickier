import type { RuleModule } from '../../types'

export const sortObjectsRule: RuleModule = {
  meta: { docs: 'Enforce sorted object keys' },
  check: (text, ctx) => {
    const opts: any = ctx.options || {}
    const type: 'alphabetical' | 'line-length' = opts.type || 'alphabetical'
    const order: 'asc' | 'desc' = opts.order || 'asc'
    const ignoreCase: boolean = opts.ignoreCase !== false
    const partitionByNewLine: boolean = Boolean(opts.partitionByNewLine)
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
    let i = 0
    while (i < lines.length) {
      const line = lines[i]
      const openIdx = line.indexOf('{')
      if (openIdx !== -1) {
        const before = line.slice(0, openIdx)
        if (/=\s*$|\(\s*$|\breturn\s*$/.test(before)) {
          let depth = 0
          const start = i
          let j = i
          for (; j < lines.length; j++) {
            for (const ch of lines[j]) {
              if (ch === '{')
                depth++
              else if (ch === '}')
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
                groups.push(current)
              current = { startLine: 0, props: [] }
            }
            for (let k = 0; k < inner.length; k++) {
              const ln = inner[k]
              if (partitionByNewLine && /^\s*$/.test(ln)) {
                flush()
                continue
              }
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
}
