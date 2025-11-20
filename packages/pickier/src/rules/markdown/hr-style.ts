import type { LintIssue, RuleModule } from '../../types'

/**
 * MD035 - Horizontal rule style
 */
export const hrStyleRule: RuleModule = {
  meta: {
    docs: 'Horizontal rule style should be consistent',
  },
  check: (text, ctx) => {
    const issues: LintIssue[] = []
    const lines = text.split(/\r?\n/)

    const options = (ctx.options as { style?: string }) || {}
    const style = options.style || 'consistent'

    let detectedStyle: string | null = null

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Check for horizontal rules (---, ***, ___)
      const hrMatch = line.match(/^([-*_])\1{2,}$/)

      if (hrMatch) {
        const currentStyle = line

        if (style !== 'consistent' && line !== style) {
          issues.push({
            filePath: ctx.filePath,
            line: i + 1,
            column: 1,
            ruleId: 'markdown/hr-style',
            message: `Expected horizontal rule style '${style}'`,
            severity: 'error',
          })
        }
        else if (style === 'consistent') {
          if (detectedStyle === null) {
            detectedStyle = currentStyle
          }
          else if (detectedStyle !== currentStyle) {
            issues.push({
              filePath: ctx.filePath,
              line: i + 1,
              column: 1,
              ruleId: 'markdown/hr-style',
              message: 'Horizontal rule style should be consistent throughout document',
              severity: 'error',
            })
          }
        }
      }
    }

    return issues
  },
}
