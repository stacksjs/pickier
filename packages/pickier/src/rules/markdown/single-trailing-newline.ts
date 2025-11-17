import type { LintIssue, RuleModule } from '../../types'

/**
 * MD047 - Files should end with a single newline character
 */
export const singleTrailingNewlineRule: RuleModule = {
  meta: {
    docs: 'Files should end with a single newline character',
  },
  check: (text, ctx) => {
    const issues: LintIssue[] = []

    // Check if file ends with newline
    if (!text.endsWith('\n') && !text.endsWith('\r\n')) {
      const lines = text.split(/\r?\n/)
      issues.push({
        filePath: ctx.filePath,
        line: lines.length,
        column: lines[lines.length - 1].length + 1,
        ruleId: 'markdown/single-trailing-newline',
        message: 'File should end with a single newline character',
        severity: 'error',
      })
    }

    // Check for multiple trailing newlines
    if (text.endsWith('\n\n') || text.endsWith('\r\n\r\n')) {
      const lines = text.split(/\r?\n/)
      issues.push({
        filePath: ctx.filePath,
        line: lines.length,
        column: 1,
        ruleId: 'markdown/single-trailing-newline',
        message: 'File should end with a single newline character (not multiple)',
        severity: 'error',
      })
    }

    return issues
  },
  fix: (text) => {
    // Remove all trailing newlines, then add exactly one
    let fixed = text.replace(/[\r\n]+$/, '')
    return `${fixed}\n`
  },
}
