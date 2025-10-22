import type { RuleModule } from '../../types'

export const noUselessReturnRule: RuleModule = {
  meta: {
    docs: 'Disallow redundant return statements',
    recommended: false,
  },
  check: (text, ctx) => {
    const issues: ReturnType<RuleModule['check']> = []
    const lines = text.split(/\r?\n/)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()

      // Check for return statement without value
      if (trimmed === 'return' || trimmed === 'return;') {
        // Check if this is the last statement before a closing brace
        let isUseless = false

        for (let j = i + 1; j < lines.length; j++) {
          const nextLine = lines[j].trim()

          // Skip empty lines and comments
          if (nextLine === '' || nextLine.startsWith('//') || nextLine.startsWith('/*'))
            continue

          // If next non-empty line is closing brace, return is useless
          if (nextLine === '}' || nextLine.startsWith('}')) {
            isUseless = true
          }

          break // Only check first non-empty line
        }

        if (isUseless) {
          issues.push({
            filePath: ctx.filePath,
            line: i + 1,
            column: Math.max(1, line.indexOf('return') + 1),
            ruleId: 'eslint/no-useless-return',
            message: 'Unnecessary return statement',
            severity: 'warning',
          })
        }
      }
    }

    return issues
  },
  fix: (text, ctx) => {
    const issues = noUselessReturnRule.check!(text, ctx)
    if (issues.length === 0)
      return text

    const lines = text.split(/\r?\n/)
    const linesToRemove = new Set(issues.map(issue => issue.line - 1))

    const fixed = lines.filter((_, i) => !linesToRemove.has(i))
    return fixed.join('\n')
  },
}
