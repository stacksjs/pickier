import type { LintIssue, RuleContext, RuleModule } from '../../types'

// Match object property patterns: key: value (need space after colon)
// But not inside ternaries, type annotations, etc.
const KEY_VALUE_RE = /^(\s*)(["']?[a-zA-Z_$][a-zA-Z0-9_$]*["']?\s*(?:\?)?):(\S)/

function isInStringOrComment(line: string, index: number): boolean {
  const before = line.slice(0, index)
  if (before.includes('//'))
    return true
  const singles = (before.match(/'/g) || []).length
  const doubles = (before.match(/"/g) || []).length
  const backticks = (before.match(/`/g) || []).length
  return singles % 2 === 1 || doubles % 2 === 1 || backticks % 2 === 1
}

export const keySpacingRule: RuleModule = {
  meta: {
    docs: 'Require space after colon in object properties',
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

      // Look for key:value patterns (no space after colon)
      // This heuristic checks for property-like patterns
      const match = line.match(KEY_VALUE_RE)
      if (match) {
        const colonIdx = line.indexOf(':', match[1].length)
        if (colonIdx !== -1 && !isInStringOrComment(line, colonIdx)) {
          // Verify this isn't a label (no { context), ternary, etc.
          // Simple check: if the key starts at indentation level and looks like a property
          const afterColon = line[colonIdx + 1]
          if (afterColon && afterColon !== ' ' && afterColon !== '\t' && afterColon !== '\n') {
            issues.push({
              filePath: context.filePath,
              line: i + 1,
              column: colonIdx + 2,
              ruleId: 'style/key-spacing',
              message: 'Missing space after colon in property',
              severity: 'warning',
            })
          }
        }
      }

      // Check for space before colon in properties (should not have space)
      const spaceBeforeColon = trimmed.match(/^(["']?[a-zA-Z_$][a-zA-Z0-9_$]*["']?)\s+:/)
      if (spaceBeforeColon && !trimmed.match(/^\s*(case|default)\b/)) {
        const colonIdx = line.indexOf(':', line.indexOf(spaceBeforeColon[1]) + spaceBeforeColon[1].length)
        if (colonIdx !== -1 && !isInStringOrComment(line, colonIdx)) {
          issues.push({
            filePath: context.filePath,
            line: i + 1,
            column: colonIdx + 1,
            ruleId: 'style/key-spacing',
            message: 'Unexpected space before colon in property',
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
      // Add space after colon in object properties
      fixed = fixed.replace(
        /^(\s*)(["']?[a-zA-Z_$][a-zA-Z0-9_$]*["']?\s*(?:\?)?):(\S)/,
        '$1$2: $3',
      )
      result.push(fixed)
    }

    return result.join('\n')
  },
}
