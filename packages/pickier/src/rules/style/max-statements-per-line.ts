import type { RuleModule } from '../../types'

export const maxStatementsPerLineRule: RuleModule = {
  meta: { docs: 'Limit the number of statements allowed on a single line' },
  check: (text, ctx) => {
    const max: number = (ctx.options && typeof (ctx.options as any).max === 'number') ? (ctx.options as any).max : 1
    const issues: ReturnType<RuleModule['check']> = []
    const lines = text.split(/\r?\n/)

    const countStatementsOnLine = (line: string): number => {
      const commentIdx = line.indexOf('//')
      const effective = commentIdx >= 0 ? line.slice(0, commentIdx) : line
      let countSemis = 0
      let inSingle = false
      let inDouble = false
      let inBacktick = false
      let escape = false
      let inForHeader = false
      let parenDepth = 0
      for (let i = 0; i < effective.length; i++) {
        const ch = effective[i]
        if (escape) {
          escape = false
          continue
        }
        if (ch === '\\') {
          escape = true
          continue
        }
        if (!inDouble && !inBacktick && ch === '\'') {
          inSingle = !inSingle
          continue
        }
        if (!inSingle && !inBacktick && ch === '"') {
          inDouble = !inDouble
          continue
        }
        if (!inSingle && !inDouble && ch === '`') {
          inBacktick = !inBacktick
          continue
        }
        if (inSingle || inDouble || inBacktick)
          continue
        if (!inForHeader) {
          if (ch === 'f' && effective.slice(i, i + 4).match(/^for\b/)) {
            const rest = effective.slice(i + 3).trimStart()
            const offset = effective.length - rest.length
            if (effective[offset] === '(') {
              inForHeader = true
              parenDepth = 1
              i = offset
              continue
            }
          }
        }
        else {
          if (ch === '(') {
            parenDepth++
          }
          else if (ch === ')') {
            parenDepth--
            if (parenDepth <= 0)
              inForHeader = false
          }
          else if (ch === ';') {
            continue
          }
        }
        if (ch === ';')
          countSemis++
      }
      if (countSemis === 0)
        return 1
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
        issues.push({ filePath: ctx.filePath, line: i + 1, column: 1, ruleId: 'max-statements-per-line', message: `This line has ${num} statements. Maximum allowed is ${max}`, severity: 'warning' })
      }
    }
    return issues
  },
}
