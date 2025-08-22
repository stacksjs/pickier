import type { RuleModule } from '../../types'

export const preferConstRule: RuleModule = {
  meta: { docs: 'Suggest \'const\' for variables that are never reassigned (heuristic)' },
  check: (text, ctx) => {
    const issues: ReturnType<RuleModule['check']> = []
    const lines = text.split(/\r?\n/)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const decl = line.match(/^\s*(?:let|var)\s+(.+?);?\s*$/)
      if (!decl)
        continue
      const after = decl[1]
      const parts = after.split(',')
      for (const partRaw of parts) {
        const part = partRaw.trim()
        if (!part)
          continue
        const simple = part.match(/^([$A-Z_][\w$]*)/i)
        const destruct = part.match(/^[{[]/)
        if (destruct)
          continue
        if (!simple)
          continue
        const name = simple[1]
        const hasInitializer = /=/.test(part)
        if (!hasInitializer)
          continue
        const restStartIdx = text.indexOf(line)
        const rest = text.slice(restStartIdx + line.length)
        const assignOp = new RegExp(`\\b${name}\\s*([+\-*/%&|^]|<<|>>>?|\\*\\*)?=`, 'g')
        const incDec = new RegExp(`(\\+\\+|--) (?=${name}\\b)|(?:\\b${name})(?:\\+\\+|--)`.replace(/\s/g, ''), 'g')
        const directAssign = (() => {
          let m: RegExpExecArray | null
          while ((m = assignOp.exec(rest))) {
            const op = m[1]
            if (op == null || op.length > 0)
              return true
          }
          return false
        })()
        const changed = directAssign || incDec.test(rest)
        if (!changed) {
          issues.push({ filePath: ctx.filePath, line: i + 1, column: Math.max(1, line.indexOf(name) + 1), ruleId: 'prefer-const', message: `'${name}' is never reassigned. Use 'const' instead`, severity: 'error' })
        }
      }
    }
    return issues
  },
}
