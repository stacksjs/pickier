import type { LintIssue, RuleModule } from '../../types'

/**
 * MD052 - Reference links and images should use a label that is defined
 */
export const referenceLinksImagesRule: RuleModule = {
  meta: {
    docs: 'Reference links and images should use defined labels',
  },
  check: (text, ctx) => {
    const issues: LintIssue[] = []
    const lines = text.split(/\r?\n/)

    // Collect all reference definitions [label]: url
    const definitions = new Set<string>()

    for (const line of lines) {
      const defMatch = line.match(/^\[([^\]]+)\]:\s*\S+/)
      if (defMatch) {
        definitions.add(defMatch[1].toLowerCase())
      }
    }

    // Check for reference links and images
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Find reference links [text][label] or [label]
      const linkMatches = line.matchAll(/\[([^\]]+)\](?:\[([^\]]+)\])?(?!\()/g)

      for (const match of linkMatches) {
        const label = (match[2] || match[1]).toLowerCase()

        // Skip if this is a definition line
        if (line.match(/^\[([^\]]+)\]:\s*\S+/)) {
          continue
        }

        if (!definitions.has(label)) {
          const column = match.index! + 1
          issues.push({
            filePath: ctx.filePath,
            line: i + 1,
            column,
            ruleId: 'markdown/reference-links-images',
            message: `Reference link '[${label}]' is not defined`,
            severity: 'error',
          })
        }
      }
    }

    return issues
  },
}
