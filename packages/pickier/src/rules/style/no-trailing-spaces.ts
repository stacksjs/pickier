import type { LintIssue, RuleContext, RuleModule } from '../../types'

/**
 * Disallow trailing whitespace at the end of lines.
 * Helps keep code clean and avoid unnecessary diffs.
 *
 * Violations:
 * - Lines ending with spaces or tabs
 */
export const noTrailingSpaces: RuleModule = {
  meta: {
    docs: 'Disallow trailing whitespace at the end of lines',
    recommended: true,
  },
  check(content: string, context: RuleContext): LintIssue[] {
    const issues: LintIssue[] = []
    const lines = content.split(/\r?\n/)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Check if line has trailing whitespace
      const trailingWhitespace = line.match(/(\s+)$/)
      if (trailingWhitespace) {
        const column = line.length - trailingWhitespace[1].length + 1

        issues.push({
          filePath: context.filePath,
          line: i + 1,
          column,
          ruleId: 'style/no-trailing-spaces',
          message: 'Trailing spaces not allowed',
          severity: 'error',
          help: 'Remove trailing whitespace from the end of this line.',
        })
      }
    }

    return issues
  },
}
