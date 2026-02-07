import type { LintIssue, RuleContext, RuleModule } from '../../types'

// Default: no space before ( in named functions, space before ( in anonymous functions
// Match function name( without space - for named functions this is desired
// Match function ( with space - for named functions this should have no space
const NAMED_FN_RE = /\bfunction\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s+\(/g
const ANON_FN_NO_SPACE_RE = /\bfunction\(/g

function isInStringOrComment(line: string, index: number): boolean {
  const before = line.slice(0, index)
  if (before.includes('//'))
    return true
  const singles = (before.match(/'/g) || []).length
  const doubles = (before.match(/"/g) || []).length
  const backticks = (before.match(/`/g) || []).length
  return singles % 2 === 1 || doubles % 2 === 1 || backticks % 2 === 1
}

export const spaceBeforeFunctionParenRule: RuleModule = {
  meta: {
    docs: 'Control spacing before ( in function declarations',
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

      // Check named functions: should NOT have space before (
      NAMED_FN_RE.lastIndex = 0
      while ((match = NAMED_FN_RE.exec(line)) !== null) {
        if (isInStringOrComment(line, match.index))
          continue

        issues.push({
          filePath: context.filePath,
          line: i + 1,
          column: match.index + match[0].length,
          ruleId: 'style/space-before-function-paren',
          message: 'Unexpected space before function parentheses',
          severity: 'warning',
        })
      }

      // Check anonymous functions: should have space before (
      ANON_FN_NO_SPACE_RE.lastIndex = 0
      while ((match = ANON_FN_NO_SPACE_RE.exec(line)) !== null) {
        if (isInStringOrComment(line, match.index))
          continue

        // Make sure it's not a named function (check if preceded by function keyword directly)
        const before = line.slice(0, match.index + 8) // 'function' length
        if (before.match(/function\s+[a-zA-Z_$]/))
          continue

        issues.push({
          filePath: context.filePath,
          line: i + 1,
          column: match.index + 9,
          ruleId: 'style/space-before-function-paren',
          message: 'Missing space before function parentheses',
          severity: 'warning',
        })
      }
    }

    return issues
  },
  fix(content: string): string {
    let result = content
    // Remove space before ( in named functions
    result = result.replace(/\bfunction\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s+\(/g, 'function $1(')
    // Add space before ( in anonymous functions
    result = result.replace(/\bfunction\(/g, 'function (')
    return result
  },
}
