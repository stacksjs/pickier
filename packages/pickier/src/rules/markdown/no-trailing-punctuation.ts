import type { LintIssue, RuleModule } from '../../types'

/**
 * MD026 - Trailing punctuation in heading
 */
export const noTrailingPunctuationRule: RuleModule = {
  meta: {
    docs: 'Headings should not end with punctuation',
  },
  check: (text, ctx) => {
    const issues: LintIssue[] = []
    const lines = text.split(/\r?\n/)

    // Default punctuation to check
    const options = (ctx.options as { punctuation?: string }) || {}
    const punctuation = options.punctuation || '.,;:!?'

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Check for ATX style headings
      const atxMatch = line.match(/^#{1,6}\s+(.+?)(?:\s*#+\s*)?$/)
      if (atxMatch) {
        const content = atxMatch[1].trim()
        const lastChar = content[content.length - 1]

        if (lastChar && punctuation.includes(lastChar)) {
          issues.push({
            filePath: ctx.filePath,
            line: i + 1,
            column: line.indexOf(content) + content.length,
            ruleId: 'markdown/no-trailing-punctuation',
            message: `Trailing punctuation in heading: '${lastChar}'`,
            severity: 'error',
          })
        }
      }

      // Check for Setext style headings
      const nextLine = i + 1 < lines.length ? lines[i + 1] : ''
      if (/^(=+|-+)\s*$/.test(nextLine) && line.trim().length > 0) {
        const content = line.trim()
        const lastChar = content[content.length - 1]

        if (lastChar && punctuation.includes(lastChar)) {
          issues.push({
            filePath: ctx.filePath,
            line: i + 1,
            column: line.indexOf(content) + content.length,
            ruleId: 'markdown/no-trailing-punctuation',
            message: `Trailing punctuation in heading: '${lastChar}'`,
            severity: 'error',
          })
        }
      }
    }

    return issues
  },
}
