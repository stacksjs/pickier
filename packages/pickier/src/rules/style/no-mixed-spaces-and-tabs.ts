import type { LintIssue, RuleContext, RuleModule } from '../../types'

export const noMixedSpacesAndTabsRule: RuleModule = {
  meta: {
    docs: 'Disallow mixed spaces and tabs for indentation',
    recommended: true,
  },
  check(content: string, context: RuleContext): LintIssue[] {
    const issues: LintIssue[] = []
    const lines = content.split(/\r?\n/)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Only check leading whitespace (indentation)
      const indent = line.match(/^(\s*)/)?.[1] || ''
      if (!indent)
        continue

      const hasTabs = indent.includes('\t')
      const hasSpaces = indent.includes(' ')

      if (hasTabs && hasSpaces) {
        issues.push({
          filePath: context.filePath,
          line: i + 1,
          column: 1,
          ruleId: 'style/no-mixed-spaces-and-tabs',
          message: 'Mixed spaces and tabs in indentation',
          severity: 'warning',
          help: 'Use either spaces or tabs for indentation, not both.',
        })
      }
    }

    return issues
  },
  // No fixer - ambiguous which style to convert to
}
