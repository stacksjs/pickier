import type { LintIssue, RuleContext, RuleModule } from '../../types'

// Operators that need spacing - careful not to match inside strings/comments/regex
// We check for operators without space on either side
const INFIX_OPS = ['&&', '||', '??', '+=', '-=', '*=', '/=', '%=', '**=', '<<=', '>>=', '>>>=', '&=', '|=', '^=', '??=', '||=', '&&=']

function isInStringOrComment(line: string, index: number): boolean {
  const before = line.slice(0, index)
  if (before.includes('//'))
    return true
  const singles = (before.match(/'/g) || []).length
  const doubles = (before.match(/"/g) || []).length
  const backticks = (before.match(/`/g) || []).length
  return singles % 2 === 1 || doubles % 2 === 1 || backticks % 2 === 1
}

export const spaceInfixOpsRule: RuleModule = {
  meta: {
    docs: 'Require spacing around infix operators (&&, ||, ??, assignment operators)',
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

      for (const op of INFIX_OPS) {
        let searchFrom = 0
        let idx

        while ((idx = line.indexOf(op, searchFrom)) !== -1) {
          searchFrom = idx + op.length

          if (isInStringOrComment(line, idx))
            continue

          // Skip if this is part of a longer operator (e.g., &&= contains &&)
          if (op === '&&' && line[idx + 2] === '=')
            continue
          if (op === '||' && line[idx + 2] === '=')
            continue
          if (op === '??' && line[idx + 2] === '=')
            continue

          const charBefore = idx > 0 ? line[idx - 1] : ' '
          const charAfter = idx + op.length < line.length ? line[idx + op.length] : ' '

          if (charBefore !== ' ' && charBefore !== '\t') {
            issues.push({
              filePath: context.filePath,
              line: i + 1,
              column: idx + 1,
              ruleId: 'style/space-infix-ops',
              message: `Missing space before '${op}'`,
              severity: 'warning',
            })
          }

          if (charAfter !== ' ' && charAfter !== '\t' && charAfter !== '\n' && charAfter !== '\r') {
            issues.push({
              filePath: context.filePath,
              line: i + 1,
              column: idx + op.length + 1,
              ruleId: 'style/space-infix-ops',
              message: `Missing space after '${op}'`,
              severity: 'warning',
            })
          }
        }
      }
    }

    return issues
  },
  fix(content: string): string {
    let result = content
    // Sort operators by length (longest first) to avoid partial replacements
    const sorted = [...INFIX_OPS].sort((a, b) => b.length - a.length)
    for (const op of sorted) {
      const escaped = op.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      // Add space before operator if missing
      result = result.replace(new RegExp(`(\\S)${escaped}`, 'g'), `$1 ${op}`)
      // Add space after operator if missing
      result = result.replace(new RegExp(`${escaped}(\\S)`, 'g'), `${op} $1`)
    }
    return result
  },
}
