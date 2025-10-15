import type { LintIssue, RuleModule } from '../../types'

/**
 * MD058 - Tables should be surrounded by blank lines
 */
export const blanksAroundTablesRule: RuleModule = {
  meta: {
    docs: 'Tables should be surrounded by blank lines',
  },
  check: (text, ctx) => {
    const issues: LintIssue[] = []
    const lines = text.split(/\r?\n/)

    let inTable = false
    let tableStartLine = -1

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const prevLine = i > 0 ? lines[i - 1] : ''
      const nextLine = i + 1 < lines.length ? lines[i + 1] : ''

      // Check if line is part of a table (contains |)
      const isTableLine = /\|/.test(line) && line.trim().length > 0

      if (isTableLine && !inTable) {
        // Start of table
        inTable = true
        tableStartLine = i

        // Check previous line
        if (i > 0 && prevLine.trim().length > 0) {
          issues.push({
            filePath: ctx.filePath,
            line: i + 1,
            column: 1,
            ruleId: 'markdown/blanks-around-tables',
            message: 'Tables should be surrounded by blank lines',
            severity: 'error',
          })
        }
      } else if (!isTableLine && inTable) {
        // End of table
        inTable = false

        // Check if current line is not blank
        if (line.trim().length > 0) {
          issues.push({
            filePath: ctx.filePath,
            line: i,
            column: 1,
            ruleId: 'markdown/blanks-around-tables',
            message: 'Tables should be surrounded by blank lines',
            severity: 'error',
          })
        }
      }
    }

    return issues
  },
}
