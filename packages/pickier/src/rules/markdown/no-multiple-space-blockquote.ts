import type { LintIssue, RuleModule } from '../../types'

/**
 * MD027 - Multiple spaces after blockquote symbol
 */
export const noMultipleSpaceBlockquoteRule: RuleModule = {
  meta: {
    docs: 'Blockquote symbols should be followed by a single space',
  },
  check: (text, ctx) => {
    const issues: LintIssue[] = []
    const lines = text.split(/\r?\n/)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Check for blockquote with multiple spaces after >
      const match = line.match(/^(\s*)(>+)\s{2,}/)

      if (match) {
        const column = match[1].length + match[2].length + 1
        issues.push({
          filePath: ctx.filePath,
          line: i + 1,
          column,
          ruleId: 'markdown/no-multiple-space-blockquote',
          message: 'Multiple spaces after blockquote symbol',
          severity: 'error',
        })
      }
    }

    return issues
  },
}
