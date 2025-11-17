import type { LintIssue, RuleModule } from '../../types'

/**
 * MD031 - Fenced code blocks should be surrounded by blank lines
 */
export const blanksAroundFencesRule: RuleModule = {
  meta: {
    docs: 'Fenced code blocks should be surrounded by blank lines',
  },
  check: (text, ctx) => {
    const issues: LintIssue[] = []
    const lines = text.split(/\r?\n/)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const prevLine = i > 0 ? lines[i - 1] : ''
      const nextLine = i + 1 < lines.length ? lines[i + 1] : ''

      // Check for code fence (``` or ~~~)
      const isFence = /^(`{3,}|~{3,})/.test(line)

      if (isFence) {
        // Check if this is an opening fence
        let isOpening = true
        for (let j = i - 1; j >= 0; j--) {
          if (/^(`{3,}|~{3,})/.test(lines[j])) {
            isOpening = false
            break
          }
        }

        // For opening fence, check previous line
        if (isOpening && i > 0 && prevLine.trim().length > 0) {
          issues.push({
            filePath: ctx.filePath,
            line: i + 1,
            column: 1,
            ruleId: 'markdown/blanks-around-fences',
            message: 'Fenced code blocks should be surrounded by blank lines',
            severity: 'error',
          })
        }

        // For closing fence, check next line
        if (!isOpening && i + 1 < lines.length && nextLine.trim().length > 0) {
          issues.push({
            filePath: ctx.filePath,
            line: i + 1,
            column: 1,
            ruleId: 'markdown/blanks-around-fences',
            message: 'Fenced code blocks should be surrounded by blank lines',
            severity: 'error',
          })
        }
      }
    }

    return issues
  },
  fix: (text) => {
    const lines = text.split(/\r?\n/)
    const result: string[] = []
    let inFence = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const prevLine = i > 0 ? lines[i - 1] : ''
      const isFence = /^(`{3,}|~{3,})/.test(line)

      if (isFence) {
        if (!inFence) {
          // Opening fence - add blank line before if needed
          if (i > 0 && prevLine.trim().length > 0 && result.length > 0) {
            result.push('')
          }
          inFence = true
        } else {
          // Closing fence
          inFence = false
        }
      }

      result.push(line)

      // Add blank line after closing fence if next line is not blank
      if (isFence && !inFence && i + 1 < lines.length) {
        const nextLine = lines[i + 1]
        if (nextLine.trim().length > 0) {
          result.push('')
        }
      }
    }

    return result.join('\n')
  },
}
