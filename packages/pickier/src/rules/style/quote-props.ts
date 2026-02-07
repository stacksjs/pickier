import type { LintIssue, RuleContext, RuleModule } from '../../types'

// Match quoted property keys that don't need quotes
// Valid unquoted identifiers: [a-zA-Z_$][a-zA-Z0-9_$]*
const QUOTED_KEY_RE = /^(\s*)(["'])([a-zA-Z_$][a-zA-Z0-9_$]*)\2\s*:/

function isInStringOrComment(line: string, index: number): boolean {
  const before = line.slice(0, index)
  if (before.includes('//'))
    return true
  return false
}

export const quotePropsRule: RuleModule = {
  meta: {
    docs: 'Remove unnecessary quotes from object property keys',
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

      const match = line.match(QUOTED_KEY_RE)
      if (match) {
        const key = match[3]

        // Don't remove quotes from reserved words that need them
        const reserved = ['class', 'return', 'function', 'var', 'let', 'const', 'delete', 'typeof', 'void', 'in', 'instanceof', 'new', 'this', 'throw', 'try', 'catch', 'finally', 'switch', 'case', 'default', 'break', 'continue', 'do', 'while', 'for', 'if', 'else', 'with', 'import', 'export', 'extends', 'super', 'yield', 'await', 'enum', 'implements', 'interface', 'package', 'private', 'protected', 'public', 'static']
        if (reserved.includes(key))
          continue

        issues.push({
          filePath: context.filePath,
          line: i + 1,
          column: line.indexOf(match[2]) + 1,
          ruleId: 'style/quote-props',
          message: `Unnecessarily quoted property '${key}'`,
          severity: 'warning',
          help: 'Remove quotes from this property key.',
        })
      }
    }

    return issues
  },
  fix(content: string): string {
    const lines = content.split(/\r?\n/)
    const result: string[] = []
    const reserved = new Set(['class', 'return', 'function', 'var', 'let', 'const', 'delete', 'typeof', 'void', 'in', 'instanceof', 'new', 'this', 'throw', 'try', 'catch', 'finally', 'switch', 'case', 'default', 'break', 'continue', 'do', 'while', 'for', 'if', 'else', 'with', 'import', 'export', 'extends', 'super', 'yield', 'await', 'enum', 'implements', 'interface', 'package', 'private', 'protected', 'public', 'static'])

    for (const line of lines) {
      let fixed = line
      const match = line.match(QUOTED_KEY_RE)
      if (match && !reserved.has(match[3])) {
        fixed = line.replace(QUOTED_KEY_RE, `$1$3:`)
      }
      result.push(fixed)
    }

    return result.join('\n')
  },
}
