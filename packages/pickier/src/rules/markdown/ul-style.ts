import type { LintIssue, RuleModule } from '../../types'

/**
 * MD004 - Unordered list style
 */
export const ulStyleRule: RuleModule = {
  meta: {
    docs: 'Unordered list style should be consistent',
  },
  check: (text, ctx) => {
    const issues: LintIssue[] = []
    const lines = text.split(/\r?\n/)

    const options = (ctx.options as { style?: 'asterisk' | 'dash' | 'plus' | 'consistent' }) || {}
    const style = options.style || 'consistent'

    let detectedStyle: '*' | '-' | '+' | null = null

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Check for unordered list item
      const match = line.match(/^(\s*)([*\-+])\s+/)

      if (match) {
        const marker = match[2] as '*' | '-' | '+'

        if (style === 'asterisk' && marker !== '*') {
          issues.push({
            filePath: ctx.filePath,
            line: i + 1,
            column: match[1].length + 1,
            ruleId: 'markdown/ul-style',
            message: `Expected asterisk (*) for unordered list, found '${marker}'`,
            severity: 'error',
          })
        } else if (style === 'dash' && marker !== '-') {
          issues.push({
            filePath: ctx.filePath,
            line: i + 1,
            column: match[1].length + 1,
            ruleId: 'markdown/ul-style',
            message: `Expected dash (-) for unordered list, found '${marker}'`,
            severity: 'error',
          })
        } else if (style === 'plus' && marker !== '+') {
          issues.push({
            filePath: ctx.filePath,
            line: i + 1,
            column: match[1].length + 1,
            ruleId: 'markdown/ul-style',
            message: `Expected plus (+) for unordered list, found '${marker}'`,
            severity: 'error',
          })
        } else if (style === 'consistent') {
          if (detectedStyle === null) {
            detectedStyle = marker
          } else if (detectedStyle !== marker) {
            issues.push({
              filePath: ctx.filePath,
              line: i + 1,
              column: match[1].length + 1,
              ruleId: 'markdown/ul-style',
              message: `Unordered list style should be consistent throughout document. Expected '${detectedStyle}', found '${marker}'`,
              severity: 'error',
            })
          }
        }
      }
    }

    return issues
  },
}
