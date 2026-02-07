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

export const computedPropertySpacingRule: RuleModule = {
  meta: {
    docs: 'Disallow spaces inside computed property brackets [expr]',
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

      // Find computed property access: obj[ expr ] or obj[expr ]
      for (let j = 0; j < line.length; j++) {
        if (line[j] !== '[')
          continue
        if (isInStringOrComment(line, j))
          continue

        // Must be preceded by identifier or ] or ) (property access)
        if (j === 0)
          continue
        const prev = line[j - 1]
        if (!/[a-zA-Z0-9_$)\]]/.test(prev))
          continue

        // Check space after [
        if (j + 1 < line.length && (line[j + 1] === ' ' || line[j + 1] === '\t')) {
          issues.push({
            filePath: context.filePath,
            line: i + 1,
            column: j + 2,
            ruleId: 'style/computed-property-spacing',
            message: 'Unexpected space after \'[\'',
            severity: 'warning',
          })
        }

        // Find matching ]
        let depth = 1
        let closeIdx = j + 1
        while (closeIdx < line.length && depth > 0) {
          if (line[closeIdx] === '[')
            depth++
          if (line[closeIdx] === ']')
            depth--
          if (depth > 0)
            closeIdx++
        }

        if (depth === 0 && closeIdx > 0) {
          if (line[closeIdx - 1] === ' ' || line[closeIdx - 1] === '\t') {
            issues.push({
              filePath: context.filePath,
              line: i + 1,
              column: closeIdx,
              ruleId: 'style/computed-property-spacing',
              message: 'Unexpected space before \']\'',
              severity: 'warning',
            })
          }
        }
      }
    }

    return issues
  },
  fix(content: string): string {
    // Remove spaces inside computed property brackets
    // Match identifier[ space...content space...] patterns
    return content.replace(
      /([a-zA-Z0-9_$)\]])\[\s+([\s\S]*?)\s+\]/g,
      '$1[$2]',
    )
  },
}
