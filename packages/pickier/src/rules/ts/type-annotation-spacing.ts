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

// Match type annotation patterns: identifier: Type or identifier?: Type
// But not object keys in { key: value } or case: or http:// etc.
const TYPE_ANNOTATION_RE = /([a-zA-Z_$][a-zA-Z0-9_$]*\??)\s*:\s*([A-Z][a-zA-Z0-9_$<>[\]|&]*|string|number|boolean|null|undefined|void|never|any|unknown|object|symbol|bigint)/g

export const typeAnnotationSpacingRule: RuleModule = {
  meta: {
    docs: 'Require consistent spacing around type annotation colons',
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

      // Look for type annotation patterns
      let match
      TYPE_ANNOTATION_RE.lastIndex = 0

      while ((match = TYPE_ANNOTATION_RE.exec(line)) !== null) {
        if (isInStringOrComment(line, match.index))
          continue

        const fullMatch = match[0]
        const colonIdx = fullMatch.indexOf(':')
        const absColonIdx = match.index + colonIdx

        // Check: no space before colon (default)
        if (colonIdx > 0 && fullMatch[colonIdx - 1] === ' ' && !fullMatch.startsWith('?')) {
          // But allow space before : after ? in optional
          const identifier = match[1]
          if (!identifier.endsWith('?') || fullMatch[colonIdx - 1] === ' ') {
            // Check if the space is really before the colon
            if (line[absColonIdx - 1] === ' ' && !/\?\s*$/.test(match[1])) {
              issues.push({
                filePath: context.filePath,
                line: i + 1,
                column: absColonIdx + 1,
                ruleId: 'ts/type-annotation-spacing',
                message: 'Unexpected space before colon in type annotation',
                severity: 'warning',
              })
            }
          }
        }

        // Check: require space after colon
        if (absColonIdx + 1 < line.length && line[absColonIdx + 1] !== ' ' && line[absColonIdx + 1] !== '\t') {
          issues.push({
            filePath: context.filePath,
            line: i + 1,
            column: absColonIdx + 2,
            ruleId: 'ts/type-annotation-spacing',
            message: 'Missing space after colon in type annotation',
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
      // Fix type annotations: ensure space after colon, no space before
      // Match param: Type, param?:Type, etc.
      fixed = fixed.replace(
        /([a-zA-Z_$][a-zA-Z0-9_$]*\??)\s*:\s*([A-Z][a-zA-Z0-9_$<>[\]|&]*|string|number|boolean|null|undefined|void|never|any|unknown|object|symbol|bigint)/g,
        '$1: $2',
      )
      result.push(fixed)
    }

    return result.join('\n')
  },
}
