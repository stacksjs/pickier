import type { LintIssue, RuleContext, RuleModule } from '../../types'

// Match .5 (leading dot without 0) - must not be preceded by a digit or dot
const LEADING_DOT_RE = /(?<![0-9.])\.\d/g
// Match 2. (trailing dot without digit after) - must not be followed by a digit or dot or identifier
const TRAILING_DOT_RE = /\d\.(?!\d|\.|\w)/g

function isInStringOrComment(line: string, index: number): boolean {
  const before = line.slice(0, index)
  if (before.includes('//'))
    return true
  const singles = (before.match(/'/g) || []).length
  const doubles = (before.match(/"/g) || []).length
  const backticks = (before.match(/`/g) || []).length
  return singles % 2 === 1 || doubles % 2 === 1 || backticks % 2 === 1
}

export const noFloatingDecimalRule: RuleModule = {
  meta: {
    docs: 'Disallow floating decimals like .5 or 2.',
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

      // Check leading dot: .5, .123
      LEADING_DOT_RE.lastIndex = 0
      while ((match = LEADING_DOT_RE.exec(line)) !== null) {
        if (isInStringOrComment(line, match.index))
          continue

        // Make sure it's not a property access (preceded by identifier or ])
        if (match.index > 0) {
          const prev = line[match.index - 1]
          if (/[a-zA-Z_$)\]]/.test(prev))
            continue
        }

        issues.push({
          filePath: context.filePath,
          line: i + 1,
          column: match.index + 1,
          ruleId: 'style/no-floating-decimal',
          message: 'Unexpected leading decimal point',
          severity: 'warning',
          help: 'Add a leading 0 before the decimal point: 0.5 instead of .5',
        })
      }

      // Check trailing dot: 2., 10.
      TRAILING_DOT_RE.lastIndex = 0
      while ((match = TRAILING_DOT_RE.exec(line)) !== null) {
        if (isInStringOrComment(line, match.index))
          continue

        issues.push({
          filePath: context.filePath,
          line: i + 1,
          column: match.index + 1,
          ruleId: 'style/no-floating-decimal',
          message: 'Unexpected trailing decimal point',
          severity: 'warning',
          help: 'Add a trailing 0 after the decimal point: 2.0 instead of 2.',
        })
      }
    }

    return issues
  },
  fix(content: string): string {
    let result = content
    // Fix leading dot: .5 -> 0.5 (but not property access)
    result = result.replace(/(?<![a-zA-Z_$0-9.)\]])\.\d/g, (m) => `0${m}`)
    // Fix trailing dot: 2. -> 2.0 (but not before identifiers/digits)
    result = result.replace(/(\d)\.(?!\d|\.|\w)/g, (_m, d) => `${d}.0`)
    return result
  },
}
