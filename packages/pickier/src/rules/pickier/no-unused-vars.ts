import type { RuleModule } from '../../types'

export const noUnusedVarsRule: RuleModule = {
  meta: { docs: 'Report variables and parameters that are declared/assigned but never used' },
  check: (text, ctx) => {
    const issues: ReturnType<RuleModule['check']> = []
    const opts: any = ctx.options || {}
    const varsIgnorePattern = typeof opts.varsIgnorePattern === 'string' ? opts.varsIgnorePattern : '^_'
    const argsIgnorePattern = typeof opts.argsIgnorePattern === 'string' ? opts.argsIgnorePattern : '^_'
    const varIgnoreRe = new RegExp(varsIgnorePattern, 'u')

    const lines = text.split(/\r?\n/)
    const full = text

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const decl = line.match(/^\s*(?:const|let|var)\s+(.+?);?\s*$/)
      if (!decl) continue
      const after = decl[1]
      const parts = after.split(',')
      for (const partRaw of parts) {
        const part = partRaw.trim()
        if (!part) continue
        const simple = part.match(/^([$A-Z_][\w$]*)/i)
        const destruct = part.match(/^[{[](.+)[}\]]/)
        const names: string[] = []
        if (simple) names.push(simple[1])
        else if (destruct) {
          const inner = destruct[1]
          const tokens = inner.split(/[^$\w]+/).filter(Boolean)
          for (const t of tokens) names.push(t)
        }
        for (const name of names) {
          if (varIgnoreRe.test(name)) continue
          const restStartIdx = full.indexOf(line)
          const rest = full.slice(restStartIdx + line.length)
          const refRe = new RegExp(`\\b${name}\\b`, 'g')
          if (!refRe.test(rest)) {
            issues.push({ filePath: ctx.filePath, line: i + 1, column: Math.max(1, line.indexOf(name) + 1), ruleId: 'no-unused-vars', message: `'${name}' is assigned a value but never used. Allowed unused vars must match /${varsIgnorePattern}/u`, severity: 'error' })
          }
        }
      }
    }

    return issues
  },
}
