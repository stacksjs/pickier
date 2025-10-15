import type { LintIssue, RuleModule } from '../../types'

/**
 * MD037 - Spaces inside emphasis markers
 */
export const noSpaceInEmphasisRule: RuleModule = {
  meta: {
    docs: 'Emphasis markers should not have spaces inside them',
  },
  check: (text, ctx) => {
    const issues: LintIssue[] = []
    const lines = text.split(/\r?\n/)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Check for spaces inside emphasis markers
      // **_ text_** or ** text ** or *_ text_*
      const patterns = [
        /(\*\*|\*|__?)\s+/g, // Space after opening marker
        /\s+(\*\*|\*|__?)/g, // Space before closing marker
      ]

      for (const pattern of patterns) {
        const matches = line.matchAll(pattern)
        for (const match of matches) {
          const column = match.index! + 1
          issues.push({
            filePath: ctx.filePath,
            line: i + 1,
            column,
            ruleId: 'markdown/no-space-in-emphasis',
            message: 'Spaces inside emphasis markers',
            severity: 'error',
          })
        }
      }
    }

    return issues
  },
}
