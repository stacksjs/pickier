import type { LintIssue, RuleContext, RuleModule } from '../../types'

function isInStringOrComment(line: string, index: number): boolean {
  const before = line.slice(0, index)
  if (before.includes('//'))
    return true
  const singles = (before.match(/'/g) || []).length
  const doubles = (before.match(/"/g) || []).length
  const backticks = (before.match(/`/g) || []).length
  return singles % 2 === 1 || doubles % 2 === 1 || backticks % 2 === 1
}

// Match ... followed by a space then identifier
const SPREAD_WITH_SPACE_RE = /\.\.\.\s+([a-zA-Z_$])/g

export const restSpreadSpacingRule: RuleModule = {
  meta: {
    docs: 'Disallow space after spread/rest operator (...)',
    recommended: true,
  },
  check(content: string, context: RuleContext): LintIssue[] {
    const issues: LintIssue[] = []
    const lines = content.split(/\r?\n/)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()

      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*'))
        continue

      let match
      SPREAD_WITH_SPACE_RE.lastIndex = 0

      while ((match = SPREAD_WITH_SPACE_RE.exec(line)) !== null) {
        if (isInStringOrComment(line, match.index))
          continue

        issues.push({
          filePath: context.filePath,
          line: i + 1,
          column: match.index + 4,
          ruleId: 'style/rest-spread-spacing',
          message: 'Unexpected space after spread operator',
          severity: 'warning',
        })
      }
    }

    return issues
  },
  fix(content: string): string {
    return content.replace(/\.\.\.\s+([a-zA-Z_$\[{])/g, '...$1')
  },
}
