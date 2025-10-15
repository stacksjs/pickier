import type { LintIssue, RuleModule } from '../../types'

/**
 * MD059 - Link text should be descriptive
 */
export const descriptiveLinkTextRule: RuleModule = {
  meta: {
    docs: 'Link text should be meaningful and descriptive',
  },
  check: (text, ctx) => {
    const issues: LintIssue[] = []
    const lines = text.split(/\r?\n/)

    // Common non-descriptive link texts
    const nonDescriptive = ['click here', 'here', 'link', 'read more', 'more', 'this']

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Find links [text](url)
      const matches = line.matchAll(/\[([^\]]+)\]\([^)]+\)/g)

      for (const match of matches) {
        const linkText = match[1].toLowerCase().trim()

        if (nonDescriptive.includes(linkText)) {
          const column = match.index! + 1
          issues.push({
            filePath: ctx.filePath,
            line: i + 1,
            column,
            ruleId: 'markdown/descriptive-link-text',
            message: `Link text '${match[1]}' is not descriptive`,
            severity: 'warning',
          })
        }
      }
    }

    return issues
  },
}
