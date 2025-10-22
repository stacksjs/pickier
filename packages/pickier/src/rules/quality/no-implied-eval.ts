import type { RuleModule } from '../../types'

export const noImpliedEvalRule: RuleModule = {
  meta: {
    docs: 'Disallow implied eval() via setTimeout/setInterval with strings',
    recommended: true,
  },
  check: (text, ctx) => {
    const issues: ReturnType<RuleModule['check']> = []
    const lines = text.split(/\r?\n/)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Match setTimeout/setInterval with string argument
      const impliedEvalPattern = /\b(setTimeout|setInterval)\s*\(\s*(['"`])/g
      let match

      while ((match = impliedEvalPattern.exec(line)) !== null) {
        // Skip if in comment
        const beforeMatch = line.substring(0, match.index)
        if (beforeMatch.includes('//'))
          continue

        issues.push({
          filePath: ctx.filePath,
          line: i + 1,
          column: Math.max(1, match.index + 1),
          ruleId: 'eslint/no-implied-eval',
          message: `Implied eval. Consider passing a function instead of a string`,
          severity: 'error',
        })
      }
    }

    return issues
  },
}
