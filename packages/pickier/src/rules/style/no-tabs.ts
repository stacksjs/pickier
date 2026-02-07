import type { LintIssue, RuleContext, RuleModule } from '../../types'

export const noTabsRule: RuleModule = {
  meta: {
    docs: 'Disallow tab characters (when using spaces for indentation)',
    recommended: false,
  },
  check(content: string, context: RuleContext): LintIssue[] {
    const issues: LintIssue[] = []

    // Only flag tabs when indent style is spaces
    if (context.config.format?.indentStyle === 'tabs')
      return issues

    const lines = content.split(/\r?\n/)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const tabIdx = line.indexOf('\t')

      if (tabIdx !== -1) {
        issues.push({
          filePath: context.filePath,
          line: i + 1,
          column: tabIdx + 1,
          ruleId: 'style/no-tabs',
          message: 'Unexpected tab character',
          severity: 'warning',
          help: 'Use spaces for indentation instead of tabs.',
        })
      }
    }

    return issues
  },
  fix(content: string, context: RuleContext): string {
    const indent = context.config.format?.indent ?? 2
    return content.replace(/\t/g, ' '.repeat(indent))
  },
}
