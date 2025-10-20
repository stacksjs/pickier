import type { RuleModule } from '../../types'

export const noElseReturnRule: RuleModule = {
  meta: {
    docs: 'Disallow else blocks after return statements in if statements',
    recommended: false,
  },
  check: (text, ctx) => {
    const issues: ReturnType<RuleModule['check']> = []
    const lines = text.split(/\r?\n/)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Look for 'else' keywords
      if (!/^\s*else\b/.test(line))
        continue

      // Check if the previous block ends with a return
      // This is a simplified heuristic
      let hasReturn = false
      for (let j = i - 1; j >= 0 && j >= i - 10; j--) {
        const prevLine = lines[j].trim()
        if (prevLine.startsWith('return'))
          hasReturn = true
        if (prevLine === '}' && hasReturn)
          break
        if (prevLine.includes('{'))
          break
      }

      if (hasReturn) {
        issues.push({
          filePath: ctx.filePath,
          line: i + 1,
          column: Math.max(1, line.indexOf('else') + 1),
          ruleId: 'eslint/no-else-return',
          message: 'Unnecessary else after return',
          severity: 'warning',
        })
      }
    }

    return issues
  },
}
