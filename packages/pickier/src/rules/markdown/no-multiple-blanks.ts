import type { LintIssue, RuleModule } from '../../types'

/**
 * MD012 - Multiple consecutive blank lines
 */
export const noMultipleBlanksRule: RuleModule = {
  meta: {
    docs: 'Multiple consecutive blank lines should not be used',
  },
  check: (text, ctx) => {
    const issues: LintIssue[] = []
    const lines = text.split(/\r?\n/)

    const options = (ctx.options as { maximum?: number }) || {}
    const maximum = options.maximum !== undefined ? options.maximum : 1

    let consecutiveBlanks = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      if (line.trim().length === 0) {
        consecutiveBlanks++

        if (consecutiveBlanks > maximum) {
          issues.push({
            filePath: ctx.filePath,
            line: i + 1,
            column: 1,
            ruleId: 'markdown/no-multiple-blanks',
            message: `Multiple consecutive blank lines (max ${maximum})`,
            severity: 'error',
          })
        }
      } else {
        consecutiveBlanks = 0
      }
    }

    return issues
  },
}
