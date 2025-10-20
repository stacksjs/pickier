import type { RuleModule } from '../../types'

export const noNewRule: RuleModule = {
  meta: {
    docs: 'Disallow new operators outside of assignments or comparisons',
    recommended: false,
  },
  check: (text, ctx) => {
    const issues: ReturnType<RuleModule['check']> = []
    const lines = text.split(/\r?\n/)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Match 'new' statements that are not assigned
      // Looking for: new Constructor() as a statement (not assigned)
      if (/^\s*new\s+\w+\s*\(/. test(line)) {
        // Check if it's on a line by itself (not assigned or passed)
        if (!/[=:]/.test(line.substring(0, line.indexOf('new')))) {
          issues.push({
            filePath: ctx.filePath,
            line: i + 1,
            column: Math.max(1, line.indexOf('new') + 1),
            ruleId: 'eslint/no-new',
            message: 'Do not use \'new\' for side effects',
            severity: 'warning',
          })
        }
      }
    }

    return issues
  },
}
