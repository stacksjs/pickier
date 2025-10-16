import type { LintIssue, RuleModule } from '../../types'

/**
 * MD029 - Ordered list item prefix
 */
export const olPrefixRule: RuleModule = {
  meta: {
    docs: 'Ordered list item prefix should follow specified style',
  },
  check: (text, ctx) => {
    const issues: LintIssue[] = []
    const lines = text.split(/\r?\n/)

    const options = (ctx.options as { style?: 'one' | 'ordered' | 'one_or_ordered' }) || {}
    const style = options.style || 'one_or_ordered'

    let expectedNumber = 1

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Check for ordered list item
      const match = line.match(/^(\s*)(\d+)\.\s+/)

      if (match) {
        const number = Number.parseInt(match[2], 10)

        if (style === 'one' && number !== 1) {
          issues.push({
            filePath: ctx.filePath,
            line: i + 1,
            column: match[1].length + 1,
            ruleId: 'markdown/ol-prefix',
            message: `Ordered list item prefix should be '1.', found '${number}.'`,
            severity: 'error',
          })
        } else if (style === 'ordered' && number !== expectedNumber) {
          issues.push({
            filePath: ctx.filePath,
            line: i + 1,
            column: match[1].length + 1,
            ruleId: 'markdown/ol-prefix',
            message: `Ordered list item prefix should be '${expectedNumber}.', found '${number}.'`,
            severity: 'error',
          })
        }

        expectedNumber++
      } else if (line.trim().length === 0) {
        // Blank line resets the counter
        expectedNumber = 1
      }
    }

    return issues
  },
  fix: (text, ctx) => {
    const options = (ctx.options as { style?: 'one' | 'ordered' | 'one_or_ordered' }) || {}
    const style = options.style || 'one_or_ordered'

    const lines = text.split(/\r?\n/)
    const fixedLines: string[] = []
    let expectedNumber = 1

    for (const line of lines) {
      const match = line.match(/^(\s*)(\d+)(\.\s+)/)

      if (match) {
        const indent = match[1]
        const suffix = match[3]

        if (style === 'one') {
          fixedLines.push(line.replace(/^(\s*)\d+(\.\s+)/, `${indent}1${suffix}`))
        } else if (style === 'ordered') {
          fixedLines.push(line.replace(/^(\s*)\d+(\.\s+)/, `${indent}${expectedNumber}${suffix}`))
          expectedNumber++
        } else {
          // one_or_ordered - keep as is
          fixedLines.push(line)
          expectedNumber++
        }
      } else {
        fixedLines.push(line)
        if (line.trim().length === 0) {
          expectedNumber = 1
        }
      }
    }

    return fixedLines.join('\n')
  },
}
