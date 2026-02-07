import type { LintIssue, RuleContext, RuleModule } from '../../types'

// Match case/default with colon spacing issues
const CASE_RE = /^\s*(case\b.+?|default)\s*:/

export const switchColonSpacingRule: RuleModule = {
  meta: {
    docs: 'Enforce spacing around colon in switch case/default clauses',
    recommended: true,
  },
  check(content: string, context: RuleContext): LintIssue[] {
    const issues: LintIssue[] = []
    const lines = content.split(/\r?\n/)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()

      if (!trimmed)
        continue

      const match = trimmed.match(CASE_RE)
      if (!match)
        continue

      // Find the colon position
      const caseMatch = match[1]
      const colonIdx = line.indexOf(':', line.indexOf(caseMatch) + caseMatch.length)
      if (colonIdx === -1)
        continue

      // No space before colon (should not have space)
      if (colonIdx > 0 && line[colonIdx - 1] === ' ') {
        issues.push({
          filePath: context.filePath,
          line: i + 1,
          column: colonIdx + 1,
          ruleId: 'style/switch-colon-spacing',
          message: 'Unexpected space before colon in switch case',
          severity: 'warning',
        })
      }

      // Space after colon if there's content on same line
      if (colonIdx + 1 < line.length && line[colonIdx + 1] !== ' ' && line[colonIdx + 1] !== '\t' && line[colonIdx + 1] !== '\n') {
        issues.push({
          filePath: context.filePath,
          line: i + 1,
          column: colonIdx + 2,
          ruleId: 'style/switch-colon-spacing',
          message: 'Missing space after colon in switch case',
          severity: 'warning',
        })
      }
    }

    return issues
  },
  fix(content: string): string {
    const lines = content.split(/\r?\n/)
    const result: string[] = []

    for (const line of lines) {
      let fixed = line
      const trimmed = line.trim()

      if (CASE_RE.test(trimmed)) {
        // Remove space before colon in case/default
        fixed = fixed.replace(/(case\b.+?|default)\s+:/, '$1:')
        // Add space after colon if content follows
        fixed = fixed.replace(/(case\b.+?:|default:)(\S)/, '$1 $2')
      }

      result.push(fixed)
    }

    return result.join('\n')
  },
}
