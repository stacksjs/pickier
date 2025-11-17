import type { LintIssue, RuleContext, RuleModule } from '../../types'

/**
 * Prefer template literals over string concatenation
 *
 * Flags cases like: 'hello ' + name + '!'
 * Suggests: `hello ${name}!`
 */
export const preferTemplate: RuleModule = {
  meta: {
    docs: 'Prefer template literals over string concatenation',
    recommended: true,
  },
  check(content: string, context: RuleContext): LintIssue[] {
    const issues: LintIssue[] = []
    const lines = content.split(/\r?\n/)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()

      // Skip comments and imports
      if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('import'))
        continue

      // Look for string concatenation patterns
      // Pattern 1: 'string' + variable
      // Pattern 2: variable + 'string'
      // Pattern 3: 'string' + 'string'

      // Simple heuristic: look for + operator between strings or identifiers
      // This is a lightweight check that catches common cases
      // Pattern: string + identifier OR identifier + string
      const stringPlusIdentifier = /(['"`][^'"`]*['"`])\s*\+\s*([a-z_$][\w$]*)/i
      const identifierPlusString = /([a-z_$][\w$]*)\s*\+\s*(['"`][^'"`]*['"`])/i
      const match = trimmed.match(stringPlusIdentifier) || trimmed.match(identifierPlusString)

      if (match) {
        // Additional check: make sure we're not in a comment
        const commentIdx = line.indexOf('//')
        const matchIdx = line.indexOf(match[0])
        if (commentIdx >= 0 && matchIdx > commentIdx)
          continue

        issues.push({
          filePath: context.filePath,
          line: i + 1,
          column: matchIdx + 1,
          ruleId: 'general/prefer-template',
          message: 'Unexpected string concatenation. Use template literals instead',
          severity: 'warning',
          help: 'Use template literals (backticks) instead of string concatenation. Example: `hello ${name}!` instead of \'hello \' + name + \'!\'',
        })
      }
    }

    return issues
  },
}
