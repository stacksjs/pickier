import type { LintIssue, RuleContext, RuleModule } from '../../types'

/**
 * Disallow more than 1 consecutive blank line.
 * Helps maintain consistent vertical spacing in code.
 *
 * Violations:
 * - More than one consecutive empty line
 */
export const noMultipleEmptyLines: RuleModule = {
  meta: {
    docs: 'Disallow multiple consecutive blank lines',
    recommended: true,
  },
  check(content: string, context: RuleContext): LintIssue[] {
    const issues: LintIssue[] = []
    const lines = content.split(/\r?\n/)

    let consecutiveEmptyLines = 0
    let firstEmptyLineIndex = -1

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      if (line.trim() === '') {
        consecutiveEmptyLines++
        if (firstEmptyLineIndex === -1) {
          firstEmptyLineIndex = i
        }

        // If we have more than 1 consecutive empty line, report it
        if (consecutiveEmptyLines > 1 && i === firstEmptyLineIndex + consecutiveEmptyLines - 1) {
          issues.push({
            filePath: context.filePath,
            line: i + 1,
            column: 1,
            ruleId: 'style/no-multiple-empty-lines',
            message: 'More than 1 blank line not allowed',
            severity: 'error',
            help: 'Remove extra blank lines. Maximum 1 consecutive blank line allowed.',
          })
        }
      }
      else {
        consecutiveEmptyLines = 0
        firstEmptyLineIndex = -1
      }
    }

    return issues
  },
}
