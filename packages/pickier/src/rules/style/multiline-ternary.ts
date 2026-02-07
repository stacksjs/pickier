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

export const multilineTernaryRule: RuleModule = {
  meta: {
    docs: 'Enforce consistent multiline ternary expressions',
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

      // Find ternary ? on this line
      const qIdx = line.indexOf('?')
      if (qIdx === -1)
        continue

      // Skip ?. (optional chaining) and ?? (nullish coalescing)
      if (line[qIdx + 1] === '.' || line[qIdx + 1] === '?')
        continue

      if (isInStringOrComment(line, qIdx))
        continue

      // Check if there's a : on the same line (single-line ternary - ok)
      const colonIdx = line.indexOf(':', qIdx + 1)
      if (colonIdx !== -1)
        continue

      // This is a multiline ternary. Check that ? is at end of line or start of line
      // If ? is in the middle with content after it, that's fine (condition ? \n consequent)
      // But if : is at the end of a line, it should be at the start of the next
      // We primarily just check for consistency here

      // Look for the corresponding : on subsequent lines
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        const nextTrimmed = lines[j].trim()
        if (nextTrimmed.startsWith(':')) {
          // Good - colon at start of line in multiline ternary
          break
        }
        // Check if : is somewhere in the line but not at start
        const nextColonIdx = nextTrimmed.indexOf(':')
        if (nextColonIdx > 0 && !isInStringOrComment(lines[j], nextColonIdx)) {
          // Colon found in middle of line - could be an inconsistency
          // But skip if it's a key: value pair or case:
          if (nextTrimmed.match(/^\w+\s*:/) || nextTrimmed.match(/^case\b/))
            continue

          issues.push({
            filePath: context.filePath,
            line: j + 1,
            column: lines[j].indexOf(':') + 1,
            ruleId: 'style/multiline-ternary',
            message: 'In multiline ternary, \':\' should be at the start of the line',
            severity: 'warning',
          })
          break
        }
      }
    }

    return issues
  },
  // No fixer - this rule is informational only
}
