import type { LintIssue, RuleModule } from '../../types'

/**
 * MD042 - No empty links
 */
export const noEmptyLinksRule: RuleModule = {
  meta: {
    docs: 'Links should not be empty',
  },
  check: (text, ctx) => {
    const issues: LintIssue[] = []
    const lines = text.split(/\r?\n/)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Check for empty link URLs [text]()
      const emptyUrlMatches = line.matchAll(/\[[^\]]+\]\(\s*\)/g)

      for (const match of emptyUrlMatches) {
        const column = match.index! + 1
        issues.push({
          filePath: ctx.filePath,
          line: i + 1,
          column,
          ruleId: 'markdown/no-empty-links',
          message: 'Empty link URL',
          severity: 'error',
        })
      }

      // Check for empty link text [](url)
      const emptyTextMatches = line.matchAll(/\[\s*\]\([^)]+\)/g)

      for (const match of emptyTextMatches) {
        const column = match.index! + 1
        issues.push({
          filePath: ctx.filePath,
          line: i + 1,
          column,
          ruleId: 'markdown/no-empty-links',
          message: 'Empty link text',
          severity: 'error',
        })
      }
    }

    return issues
  },
}
