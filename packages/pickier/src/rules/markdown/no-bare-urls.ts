import type { LintIssue, RuleModule } from '../../types'

/**
 * MD034 - Bare URL used
 */
export const noBareUrlsRule: RuleModule = {
  meta: {
    docs: 'Bare URLs should be wrapped in angle brackets',
  },
  check: (text, ctx) => {
    const issues: LintIssue[] = []
    const lines = text.split(/\r?\n/)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Skip code blocks and inline code
      if (line.trim().startsWith('```') || line.trim().startsWith('~~~')) {
        continue
      }

      // Simple URL pattern (not inside <> or [](url) or `code`)
      const urlPattern = /(?<![<`(])https?:\/\/[^\s<>`)\]]+(?![>\])`])/g
      const matches = line.matchAll(urlPattern)

      for (const match of matches) {
        const column = match.index! + 1
        issues.push({
          filePath: ctx.filePath,
          line: i + 1,
          column,
          ruleId: 'markdown/no-bare-urls',
          message: 'Bare URL used. Wrap in angle brackets: <url>',
          severity: 'error',
        })
      }
    }

    return issues
  },
  fix: (text) => {
    const lines = text.split(/\r?\n/)
    const fixedLines = lines.map((line) => {
      // Skip code blocks
      if (line.trim().startsWith('```') || line.trim().startsWith('~~~')) {
        return line
      }

      // Wrap bare URLs in angle brackets
      return line.replace(/(?<![<`(])https?:\/\/[^\s<>`)\]]+(?![>\])`])/g, '<$&>')
    })
    return fixedLines.join('\n')
  },
}
