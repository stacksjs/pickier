import type { LintIssue, RuleModule } from '../../types'

/**
 * MD009 - Trailing spaces
 */
export const noTrailingSpacesRule: RuleModule = {
  meta: {
    docs: 'Lines should not end with trailing spaces',
  },
  check: (text, ctx) => {
    const issues: LintIssue[] = []
    const lines = text.split(/\r?\n/)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Check for trailing spaces (excluding line breaks which use 2+ trailing spaces)
      const match = line.match(/\s+$/)

      if (match) {
        // Allow exactly 2 trailing spaces for hard line breaks
        const options = (ctx.options as { br_spaces?: number }) || {}
        const brSpaces = options.br_spaces !== undefined ? options.br_spaces : 2

        if (brSpaces === 0 || match[0].length !== brSpaces) {
          issues.push({
            filePath: ctx.filePath,
            line: i + 1,
            column: line.length - match[0].length + 1,
            ruleId: 'markdown/no-trailing-spaces',
            message: `Trailing spaces found (${match[0].length} space${match[0].length !== 1 ? 's' : ''})`,
            severity: 'error',
          })
        }
      }
    }

    return issues
  },
  fix: (text, ctx) => {
    const lines = text.split(/\r?\n/)
    const options = (ctx.options as { br_spaces?: number }) || {}
    const brSpaces = options.br_spaces !== undefined ? options.br_spaces : 2

    const fixedLines = lines.map((line) => {
      const match = line.match(/\s+$/)
      if (match) {
        // Keep exactly brSpaces if configured, otherwise remove all
        if (brSpaces > 0 && match[0].length === brSpaces) {
          return line
        }
        return line.replace(/\s+$/, '')
      }
      return line
    })

    return fixedLines.join('\n')
  },
}
