import type { LintIssue, RuleContext, RuleModule } from '../../types'

// Match arrow functions with single unparenthesized parameter: x => or x=>
// But not (x) => or (x, y) => or ({x}) => etc.
const SINGLE_PARAM_ARROW_RE = /(?<![(\[{,=:?&|+\-*/])\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=>/g

function isInStringOrComment(line: string, index: number): boolean {
  const before = line.slice(0, index)
  if (before.includes('//'))
    return true
  const singles = (before.match(/'/g) || []).length
  const doubles = (before.match(/"/g) || []).length
  const backticks = (before.match(/`/g) || []).length
  return singles % 2 === 1 || doubles % 2 === 1 || backticks % 2 === 1
}

export const arrowParensRule: RuleModule = {
  meta: {
    docs: 'Require parentheses around arrow function parameters',
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
      SINGLE_PARAM_ARROW_RE.lastIndex = 0

      while ((match = SINGLE_PARAM_ARROW_RE.exec(line)) !== null) {
        const paramStart = match.index
        if (isInStringOrComment(line, paramStart))
          continue

        // Verify it's not already inside parens by checking backwards for (
        const paramName = match[1]
        const beforeParam = line.slice(0, paramStart).trimEnd()

        // Skip if preceded by ( - means it's already parenthesized from a different context
        if (beforeParam.endsWith('('))
          continue

        // Skip keywords that might look like params: async =>
        if (paramName === 'async')
          continue

        issues.push({
          filePath: context.filePath,
          line: i + 1,
          column: paramStart + 1,
          ruleId: 'style/arrow-parens',
          message: `Arrow function parameter '${paramName}' should be wrapped in parentheses`,
          severity: 'warning',
        })
      }
    }

    return issues
  },
  fix(content: string): string {
    // Wrap single param in parens: `x =>` -> `(x) =>`
    return content.replace(
      /(?<![(\[{,=:?&|+\-*/])\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=>/g,
      (match, param) => {
        if (param === 'async')
          return match
        return match.replace(param, `(${param})`)
      },
    )
  },
}
