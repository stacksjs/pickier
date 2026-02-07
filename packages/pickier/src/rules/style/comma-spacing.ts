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

export const commaSpacingRule: RuleModule = {
  meta: {
    docs: 'Require space after commas, disallow space before commas',
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

      for (let j = 0; j < line.length; j++) {
        if (line[j] !== ',')
          continue

        if (isInStringOrComment(line, j))
          continue

        // Check space before comma
        if (j > 0 && line[j - 1] === ' ') {
          // Make sure it's not just indentation
          const beforeComma = line.slice(0, j)
          if (beforeComma.trim().length > 0) {
            issues.push({
              filePath: context.filePath,
              line: i + 1,
              column: j + 1,
              ruleId: 'style/comma-spacing',
              message: 'Unexpected space before comma',
              severity: 'warning',
            })
          }
        }

        // Check space after comma (unless end of line or followed by newline)
        if (j + 1 < line.length && line[j + 1] !== ' ' && line[j + 1] !== '\t' && line[j + 1] !== '\n' && line[j + 1] !== '\r') {
          issues.push({
            filePath: context.filePath,
            line: i + 1,
            column: j + 2,
            ruleId: 'style/comma-spacing',
            message: 'Missing space after comma',
            severity: 'warning',
          })
        }
      }
    }

    return issues
  },
  fix(content: string): string {
    const lines = content.split(/\r?\n/)
    const result: string[] = []

    for (const line of lines) {
      let fixed = line
      // Remove space before comma
      fixed = fixed.replace(/ ,/g, ',')
      // Add space after comma if missing (but not at end of line)
      fixed = fixed.replace(/,(\S)/g, ', $1')
      result.push(fixed)
    }

    return result.join('\n')
  },
}
