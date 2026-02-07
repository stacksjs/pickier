import type { LintIssue, RuleContext, RuleModule } from '../../types'

// Match yield with * (yield*, yield *, yield  *, etc.)
const YIELD_STAR_RE = /\byield\s*\*/g

function isInStringOrComment(line: string, index: number): boolean {
  const before = line.slice(0, index)
  if (before.includes('//'))
    return true
  const singles = (before.match(/'/g) || []).length
  const doubles = (before.match(/"/g) || []).length
  const backticks = (before.match(/`/g) || []).length
  return singles % 2 === 1 || doubles % 2 === 1 || backticks % 2 === 1
}

export const yieldStarSpacingRule: RuleModule = {
  meta: {
    docs: 'Enforce spacing around * in yield* expressions (no space before *, space after)',
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
      YIELD_STAR_RE.lastIndex = 0

      while ((match = YIELD_STAR_RE.exec(line)) !== null) {
        const idx = match.index

        if (isInStringOrComment(line, idx))
          continue

        const fullMatch = match[0] // e.g. 'yield*', 'yield *', 'yield  *'
        const starIdx = idx + fullMatch.length - 1
        const afterStarIdx = starIdx + 1

        // Check for space before * (between 'yield' and '*')
        // Correct: 'yield*', Wrong: 'yield *' or 'yield  *'
        if (fullMatch !== 'yield*') {
          issues.push({
            filePath: context.filePath,
            line: i + 1,
            column: starIdx + 1,
            ruleId: 'style/yield-star-spacing',
            message: 'Unexpected space before * in yield expression',
            severity: 'warning',
          })
        }

        // Check for space after * (before the delegated expression)
        // Correct: 'yield* expr', Wrong: 'yield*expr'
        if (afterStarIdx < line.length && line[afterStarIdx] !== ' ' && line[afterStarIdx] !== '\t' && line[afterStarIdx] !== '\n') {
          issues.push({
            filePath: context.filePath,
            line: i + 1,
            column: afterStarIdx + 1,
            ruleId: 'style/yield-star-spacing',
            message: 'Missing space after * in yield expression',
            severity: 'warning',
          })
        }
      }
    }

    return issues
  },
  fix(content: string, _context: RuleContext): string {
    let result = content

    // Remove space before *: 'yield *' -> 'yield*'
    result = result.replace(/\byield\s+\*/g, 'yield*')

    // Ensure space after *: 'yield*expr' -> 'yield* expr'
    // Don't add space if already at end of line or followed by whitespace
    result = result.replace(/\byield\*(\S)/g, 'yield* $1')

    return result
  },
}
