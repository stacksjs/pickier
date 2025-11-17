import type { RuleModule } from '../../types'

export const noThrowLiteralRule: RuleModule = {
  meta: {
    docs: 'Disallow throwing literals as exceptions',
    recommended: true,
  },
  check: (text, ctx) => {
    const issues: ReturnType<RuleModule['check']> = []
    const lines = text.split(/\r?\n/)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Match throw with literals (string, number, boolean)
      const patterns = [
        { pattern: /\bthrow\s+(['"`][^'"`]*['"`])/g, type: 'string' },
        { pattern: /\bthrow\s+(\d+)/g, type: 'number' },
        { pattern: /\bthrow\s+(true|false|null|undefined)/g, type: 'literal' },
      ]

      for (const { pattern, type } of patterns) {
        let match
        while ((match = pattern.exec(line)) !== null) {
          // Skip if in comment
          if (line.substring(0, match.index).includes('//'))
            continue

          issues.push({
            filePath: ctx.filePath,
            line: i + 1,
            column: Math.max(1, match.index + 1),
            ruleId: 'eslint/no-throw-literal',
            message: `Expected an error object to be thrown, got ${type} literal`,
            severity: 'error',
          })
        }
      }
    }

    return issues
  },
}
