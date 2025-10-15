import type { LintIssue, RuleModule } from '../../types'

/**
 * MD045 - Images should have alternate text (alt text)
 */
export const noAltTextRule: RuleModule = {
  meta: {
    docs: 'Images should have alternate text',
  },
  check: (text, ctx) => {
    const issues: LintIssue[] = []
    const lines = text.split(/\r?\n/)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Check for images with empty alt text ![](url)
      const emptyAltMatches = line.matchAll(/!\[\s*\]\([^)]+\)/g)

      for (const match of emptyAltMatches) {
        const column = match.index! + 1
        issues.push({
          filePath: ctx.filePath,
          line: i + 1,
          column,
          ruleId: 'markdown/no-alt-text',
          message: 'Images should have alternate text (alt text)',
          severity: 'error',
        })
      }
    }

    return issues
  },
}
