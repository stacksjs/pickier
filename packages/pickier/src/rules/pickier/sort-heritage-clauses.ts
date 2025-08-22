/* eslint-disable regexp/no-super-linear-backtracking */
import type { RuleModule } from '../../types'

export const sortHeritageClausesRule: RuleModule = {
  meta: { docs: 'Enforce sorted TypeScript heritage clauses (extends/implements lists)' },
  check: (text, ctx) => {
    const opts: any = ctx.options || {}
    const type: 'alphabetical' | 'natural' | 'line-length' | 'unsorted' = opts.type || 'alphabetical'
    const order: 'asc' | 'desc' = opts.order || 'asc'
    const ignoreCase: boolean = opts.ignoreCase !== false
    const groupsOpt: Array<string | string[]> = Array.isArray(opts.groups) ? opts.groups : []
    const customGroups: Record<string, string | string[]> = opts.customGroups || {}
    const lines = text.split(/\r?\n/)
    const issues: ReturnType<RuleModule['check']> = []

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
        flatGroups.push(...g)
      else
        flatGroups.push(g)
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
        if (ch === ',' && depth === 0) {
          out.push(token.trim())
          token = ''
          continue
        }
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
      const intf = line.match(/^\s*interface\s+[A-Za-z_$][^{]*\bextends\s+(.+?)\s*\{/)
      if (intf)
        checkList(i + 1, intf[1])
      const impl = line.match(/^\s*class\s+[A-Za-z_$][^{]*\bimplements\s+(.+?)\s*\{/)
      if (impl)
        checkList(i + 1, impl[1])
    }
    return issues
  },
}
