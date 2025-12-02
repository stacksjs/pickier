import type { LintIssue, RuleContext, RuleModule } from '../../types'

/**
 * Enforce using the global `Buffer` instead of `require("buffer").Buffer`.
 * In Node.js, `Buffer` is a global, so requiring it explicitly is unnecessary.
 *
 * Violations:
 * - Using `Buffer` without importing (should use require("buffer").Buffer)
 */
export const preferGlobalBuffer: RuleModule = {
  meta: {
    docs: 'Prefer using global Buffer instead of requiring it',
    recommended: true,
  },
  check(content: string, context: RuleContext): LintIssue[] {
    const issues: LintIssue[] = []
    const lines = content.split(/\r?\n/)

    // Check if Buffer is imported from "buffer" module
    const hasBufferImport = content.match(/(?:import|require)\s*\(?.*?['"]buffer['"]/)

    // If no import, check for Buffer usage
    if (!hasBufferImport) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]

        // Skip comments
        const trimmed = line.trim()
        if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*'))
          continue

        // Pattern: Using Buffer as a global
        const bufferUsagePattern = /\bBuffer\./
        if (bufferUsagePattern.test(line)) {
          // Check if it's not in a string
          const match = line.match(bufferUsagePattern)
          if (match) {
            const beforeMatch = line.slice(0, match.index)
            const singleQuotes = (beforeMatch.match(/'/g) || []).length
            const doubleQuotes = (beforeMatch.match(/"/g) || []).length
            const backticks = (beforeMatch.match(/`/g) || []).length

            // If odd number of quotes, we're inside a string
            if (singleQuotes % 2 === 1 || doubleQuotes % 2 === 1 || backticks % 2 === 1)
              continue

            const column = (match.index || 0) + 1

            issues.push({
              filePath: context.filePath,
              line: i + 1,
              column,
              ruleId: 'node/prefer-global/buffer',
              message: 'Unexpected use of the global variable \'Buffer\'. Use \'require("buffer").Buffer\' instead',
              severity: 'error',
              help: 'Import Buffer explicitly: const { Buffer } = require("buffer")',
            })
          }
        }
      }
    }

    return issues
  },
}
