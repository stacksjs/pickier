import type { RuleModule } from '../../types'

export const noUselessCatchRule: RuleModule = {
  meta: {
    docs: 'Disallow unnecessary catch clauses',
    recommended: true,
  },
  check: (text, ctx) => {
    const issues: ReturnType<RuleModule['check']> = []
    const lines = text.split(/\r?\n/)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Look for catch blocks
      const catchMatch = line.match(/catch\s*\(\s*(\w+)\s*\)/)
      if (!catchMatch)
        continue

      const errorVar = catchMatch[1]

      // Check if the catch block only rethrows the same error
      // Look ahead a few lines for: throw errorVar
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const catchLine = lines[j].trim()

        if (catchLine === `throw ${errorVar}` || catchLine === `throw ${errorVar};`) {
          // Check if there's nothing else in the catch block
          let hasOtherStatements = false
          for (let k = i + 1; k < j; k++) {
            const checkLine = lines[k].trim()
            if (checkLine !== '' && checkLine !== '{' && !checkLine.startsWith('//')) {
              hasOtherStatements = true
              break
            }
          }

          if (!hasOtherStatements) {
            issues.push({
              filePath: ctx.filePath,
              line: i + 1,
              column: Math.max(1, line.indexOf('catch') + 1),
              ruleId: 'eslint/no-useless-catch',
              message: 'Unnecessary catch clause',
              severity: 'error',
            })
          }
          break
        }

        // If we hit a closing brace, stop looking
        if (catchLine === '}')
          break
      }
    }

    return issues
  },
}
