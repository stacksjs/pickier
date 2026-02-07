import type { LintIssue, RuleContext, RuleModule } from '../../types'

const KEYWORDS = ['if', 'else', 'for', 'while', 'do', 'switch', 'case', 'return', 'throw', 'try', 'catch', 'finally', 'const', 'let', 'var', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void', 'yield', 'await', 'async', 'from', 'import', 'export', 'default', 'class', 'extends', 'as', 'break', 'continue']

// Match keyword not preceded by space (but preceded by non-word char or start of line)
// and keyword not followed by space (but followed by non-word char like ( or end of line)
const KEYWORD_PATTERN = new RegExp(
  `(?:^|[^\\w$.])(${KEYWORDS.join('|')})(?=[^\\w$]|$)`,
  'g',
)

function isInStringOrComment(line: string, index: number): boolean {
  const before = line.slice(0, index)
  if (before.includes('//'))
    return true
  const singles = (before.match(/'/g) || []).length
  const doubles = (before.match(/"/g) || []).length
  const backticks = (before.match(/`/g) || []).length
  return singles % 2 === 1 || doubles % 2 === 1 || backticks % 2 === 1
}

export const keywordSpacingRule: RuleModule = {
  meta: {
    docs: 'Require space before and after keywords',
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
      KEYWORD_PATTERN.lastIndex = 0

      while ((match = KEYWORD_PATTERN.exec(line)) !== null) {
        const prefix = match[0].charAt(0) === match[1].charAt(0) ? '' : match[0].charAt(0)
        const kwStart = match.index + prefix.length
        const kwEnd = kwStart + match[1].length

        if (isInStringOrComment(line, kwStart))
          continue

        // Check space before keyword (unless at start of line or after indent)
        if (kwStart > 0) {
          const charBefore = line[kwStart - 1]
          // Need a space before keyword if preceded by ) or } or a word char
          if (charBefore === ')' || charBefore === '}') {
            issues.push({
              filePath: context.filePath,
              line: i + 1,
              column: kwStart + 1,
              ruleId: 'style/keyword-spacing',
              message: `Missing space before keyword '${match[1]}'`,
              severity: 'warning',
            })
          }
        }

        // Check space after keyword
        if (kwEnd < line.length) {
          const charAfter = line[kwEnd]
          // Keywords should be followed by space (except before ; or , or : or . or end of line)
          if (charAfter !== ' ' && charAfter !== '\t' && charAfter !== ';' && charAfter !== ',' && charAfter !== ':' && charAfter !== '.') {
            // Special case: 'return;' and 'break;' and 'continue;' are okay without space
            if (charAfter === '(' && (match[1] === 'if' || match[1] === 'for' || match[1] === 'while' || match[1] === 'switch' || match[1] === 'catch')) {
              issues.push({
                filePath: context.filePath,
                line: i + 1,
                column: kwEnd + 1,
                ruleId: 'style/keyword-spacing',
                message: `Missing space after keyword '${match[1]}'`,
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

      // Add space after keywords before (
      for (const kw of ['if', 'for', 'while', 'switch', 'catch']) {
        const re = new RegExp(`(\\b${kw})\\(`, 'g')
        fixed = fixed.replace(re, `$1 (`)
      }

      // Add space before keywords after ) or }
      for (const kw of ['else', 'catch', 'finally']) {
        fixed = fixed.replace(new RegExp(`\\)${kw}\\b`, 'g'), `) ${kw}`)
        fixed = fixed.replace(new RegExp(`\\}${kw}\\b`, 'g'), `} ${kw}`)
      }

      result.push(fixed)
    }

    return result.join('\n')
  },
}
