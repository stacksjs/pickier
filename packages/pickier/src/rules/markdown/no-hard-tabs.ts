import type { LintIssue, RuleModule } from '../../types'

/**
 * MD010 - Hard tabs
 */
export const noHardTabsRule: RuleModule = {
  meta: {
    docs: 'Spaces should be used instead of hard tabs',
  },
  check: (text, ctx) => {
    const issues: LintIssue[] = []
    const lines = text.split(/\r?\n/)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Check for hard tabs
      const tabIndex = line.indexOf('\t')

      if (tabIndex !== -1) {
        issues.push({
          filePath: ctx.filePath,
          line: i + 1,
          column: tabIndex + 1,
          ruleId: 'markdown/no-hard-tabs',
          message: 'Hard tabs should not be used',
          severity: 'error',
        })
      }
    }

    return issues
  },
  fix: (text) => {
    // Replace tabs with 4 spaces (standard tab width)
    return text.replace(/\t/g, '    ')
  },
}
