import type { LintIssue, RuleModule } from '../../types'

/**
 * MD033 - Inline HTML
 */
export const noInlineHtmlRule: RuleModule = {
  meta: {
    docs: 'Inline HTML should not be used',
  },
  check: (text, ctx) => {
    const issues: LintIssue[] = []
    const lines = text.split(/\r?\n/)

    const options = (ctx.options as { allowed_elements?: string[] }) || {}
    const allowedElements = options.allowed_elements || []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Simple HTML tag detection
      const matches = line.matchAll(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi)

      for (const match of matches) {
        const tagName = match[1].toLowerCase()

        if (!allowedElements.includes(tagName)) {
          const column = match.index! + 1
          issues.push({
            filePath: ctx.filePath,
            line: i + 1,
            column,
            ruleId: 'markdown/no-inline-html',
            message: `Inline HTML element '<${tagName}>' should not be used`,
            severity: 'warning',
          })
        }
      }
    }

    return issues
  },
}
