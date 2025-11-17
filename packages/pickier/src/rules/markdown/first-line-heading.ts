import type { LintIssue, RuleModule } from '../../types'

/**
 * MD041 - First line in a file should be a top-level heading
 */
export const firstLineHeadingRule: RuleModule = {
  meta: {
    docs: 'First line in a file should be a top-level heading',
  },
  check: (text, ctx) => {
    const issues: LintIssue[] = []
    const lines = text.split(/\r?\n/)

    // Find first non-blank line
    let firstNonBlankLine = -1
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().length > 0) {
        firstNonBlankLine = i
        break
      }
    }

    if (firstNonBlankLine === -1) {
      return issues // Empty file
    }

    const firstLine = lines[firstNonBlankLine]

    // Check if it's a top-level heading (h1)
    const isH1 = /^#\s/.test(firstLine)

    // Check for setext h1 (next line is ===)
    const isSetextH1 = firstNonBlankLine + 1 < lines.length && /^=+\s*$/.test(lines[firstNonBlankLine + 1])

    if (!isH1 && !isSetextH1) {
      issues.push({
        filePath: ctx.filePath,
        line: firstNonBlankLine + 1,
        column: 1,
        ruleId: 'markdown/first-line-heading',
        message: 'First line in a file should be a top-level heading',
        severity: 'warning',
      })
    }

    return issues
  },
}
