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

export const spaceInParensRule: RuleModule = {
  meta: {
    docs: 'Disallow spaces inside parentheses',
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
        if (line[j] === '(' && !isInStringOrComment(line, j)) {
          const next = line[j + 1]
          if (next === ')' || next === undefined || next === '\n')
            continue

          if (next === ' ') {
            // Allow space if followed by another paren or brace for readability
            issues.push({
              filePath: context.filePath,
              line: i + 1,
              column: j + 2,
              ruleId: 'style/space-in-parens',
              message: 'Unexpected space after \'(\'',
              severity: 'warning',
            })
          }
        }

        if (line[j] === ')' && !isInStringOrComment(line, j)) {
          if (j === 0)
            continue
          const prev = line[j - 1]
          if (prev === '(')
            continue

          if (prev === ' ') {
            // Find matching (
            const beforeParen = line.slice(0, j)
            if (beforeParen.includes('(')) {
              issues.push({
                filePath: context.filePath,
                line: i + 1,
                column: j,
                ruleId: 'style/space-in-parens',
                message: 'Unexpected space before \')\'',
                severity: 'warning',
              })
            }
          }
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
      // Remove space after (
      fixed = fixed.replace(/\(\s+(\S)/g, '($1')
      // Remove space before )
      fixed = fixed.replace(/(\S)\s+\)/g, '$1)')
      result.push(fixed)
    }

    return result.join('\n')
  },
}
