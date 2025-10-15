import type { LintIssue, RuleModule } from '../../types'

/**
 * MD051 - Link fragments should be valid
 */
export const linkFragmentsRule: RuleModule = {
  meta: {
    docs: 'Link fragments should reference valid headings',
  },
  check: (text, ctx) => {
    const issues: LintIssue[] = []
    const lines = text.split(/\r?\n/)

    // Collect all heading IDs
    const headingIds = new Set<string>()

    for (const line of lines) {
      // Check for ATX headings
      const atxMatch = line.match(/^#{1,6}\s+(.+?)(?:\s*#+\s*)?$/)
      if (atxMatch) {
        const headingText = atxMatch[1].trim()
        const id = headingText.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
        headingIds.add(id)
      }
    }

    // Check for fragment links
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Find fragment links [text](#fragment)
      const matches = line.matchAll(/\[[^\]]+\]\(#([^)]+)\)/g)

      for (const match of matches) {
        const fragment = match[1]

        if (!headingIds.has(fragment)) {
          const column = match.index! + 1
          issues.push({
            filePath: ctx.filePath,
            line: i + 1,
            column,
            ruleId: 'markdown/link-fragments',
            message: `Link fragment '#${fragment}' does not match any heading`,
            severity: 'error',
          })
        }
      }
    }

    return issues
  },
}
