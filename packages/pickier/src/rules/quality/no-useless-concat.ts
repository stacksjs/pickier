import type { RuleModule } from '../../types'

export const noUselessConcatRule: RuleModule = {
  meta: {
    docs: 'Disallow unnecessary concatenation of literals or template literals',
    recommended: false,
  },
  check: (text, ctx) => {
    const issues: ReturnType<RuleModule['check']> = []
    const lines = text.split(/\r?\n/)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Match string literal concatenation
      const patterns = [
        /(['"`])([^'"`]*)\1\s*\+\s*\1([^'"`]*)\1/g, // 'a' + 'b'
      ]

      for (const pattern of patterns) {
        let match
        while ((match = pattern.exec(line)) !== null) {
          // Skip if in comment
          if (line.substring(0, match.index).includes('//'))
            continue

          issues.push({
            filePath: ctx.filePath,
            line: i + 1,
            column: Math.max(1, match.index + 1),
            ruleId: 'eslint/no-useless-concat',
            message: 'Unexpected string concatenation of literals',
            severity: 'warning',
          })
        }
      }
    }

    return issues
  },
  fix: (text) => {
    let fixed = text

    // Combine adjacent string literals
    fixed = fixed.replace(/(['"`])([^'"`]*)\1\s*\+\s*\1([^'"`]*)\1/g, '$1$2$3$1')

    return fixed
  },
}
