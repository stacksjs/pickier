import type { LintIssue, RuleModule } from '../../types'

/**
 * MD048 - Code fence style
 */
export const codeFenceStyleRule: RuleModule = {
  meta: {
    docs: 'Code fence style should be consistent (backtick or tilde)',
  },
  check: (text, ctx) => {
    const issues: LintIssue[] = []
    const lines = text.split(/\r?\n/)

    const options = (ctx.options as { style?: 'backtick' | 'tilde' | 'consistent' }) || {}
    const style = options.style || 'consistent'

    let detectedStyle: 'backtick' | 'tilde' | null = null

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Check for backtick fence
      const isBacktick = /^`{3,}/.test(line)

      // Check for tilde fence
      const isTilde = /^~{3,}/.test(line)

      if (isBacktick) {
        if (style === 'tilde') {
          issues.push({
            filePath: ctx.filePath,
            line: i + 1,
            column: 1,
            ruleId: 'markdown/code-fence-style',
            message: 'Expected tilde (~~~) code fence',
            severity: 'error',
          })
        } else if (style === 'consistent') {
          if (detectedStyle === null) {
            detectedStyle = 'backtick'
          } else if (detectedStyle === 'tilde') {
            issues.push({
              filePath: ctx.filePath,
              line: i + 1,
              column: 1,
              ruleId: 'markdown/code-fence-style',
              message: 'Code fence style should be consistent throughout document',
              severity: 'error',
            })
          }
        }
      } else if (isTilde) {
        if (style === 'backtick') {
          issues.push({
            filePath: ctx.filePath,
            line: i + 1,
            column: 1,
            ruleId: 'markdown/code-fence-style',
            message: 'Expected backtick (```) code fence',
            severity: 'error',
          })
        } else if (style === 'consistent') {
          if (detectedStyle === null) {
            detectedStyle = 'tilde'
          } else if (detectedStyle === 'backtick') {
            issues.push({
              filePath: ctx.filePath,
              line: i + 1,
              column: 1,
              ruleId: 'markdown/code-fence-style',
              message: 'Code fence style should be consistent throughout document',
              severity: 'error',
            })
          }
        }
      }
    }

    return issues
  },
}
