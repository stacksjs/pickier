import type { LintIssue, RuleModule } from '../../types'

/**
 * MD018 - No space after hash on atx style heading
 */
export const noMissingSpaceAtxRule: RuleModule = {
  meta: {
    docs: 'ATX style headings must have a space after the hash',
  },
  check: (text, ctx) => {
    const issues: LintIssue[] = []
    const lines = text.split(/\r?\n/)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Check for ATX heading without space after hash
      const match = line.match(/^(#{1,6})([^\s#])/)

      if (match) {
        issues.push({
          filePath: ctx.filePath,
          line: i + 1,
          column: match[1].length + 1,
          ruleId: 'markdown/no-missing-space-atx',
          message: 'No space after hash on atx style heading',
          severity: 'error',
        })
      }
    }

    return issues
  },
  fix: (text) => {
    const lines = text.split(/\r?\n/)
    const fixedLines = lines.map((line) => {
      // Add space after hash if missing
      return line.replace(/^(#{1,6})([^\s#])/, '$1 $2')
    })
    return fixedLines.join('\n')
  },
}
