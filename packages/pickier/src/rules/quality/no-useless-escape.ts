import type { RuleModule } from '../../types'

// Characters that don't need escaping in regular strings
const unnecessaryEscapes = ['/', '(', ')', '[', ']', '{', '}', '<', '>', ':', '@', '#', '$', '%', '&', '=', '+', '-', '*', '?', '!', ';', ',', '|', '~', '`', '^']

export const noUselessEscapeRule: RuleModule = {
  meta: {
    docs: 'Disallow unnecessary escape characters',
    recommended: true,
  },
  check: (text, ctx) => {
    const issues: ReturnType<RuleModule['check']> = []
    const lines = text.split(/\r?\n/)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Check for unnecessary escapes in strings
      for (const char of unnecessaryEscapes) {
        const escaped = `\\${char}`
        const pattern = new RegExp(`(['"\`])[^'"\`]*${escaped.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g')
        let match

        while ((match = pattern.exec(line)) !== null) {
          // Make sure we're in a string and not a regex
          const quotePos = match.index
          const escapePos = line.indexOf(escaped, quotePos)

          if (escapePos > quotePos) {
            issues.push({
              filePath: ctx.filePath,
              line: i + 1,
              column: Math.max(1, escapePos + 1),
              ruleId: 'eslint/no-useless-escape',
              message: `Unnecessary escape character: \\${char}`,
              severity: 'warning',
            })
          }
        }
      }
    }

    return issues
  },
  fix: (text) => {
    let fixed = text

    // Remove unnecessary escapes
    for (const char of unnecessaryEscapes) {
      const escaped = `\\${char}`
      fixed = fixed.replace(new RegExp(escaped.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), char)
    }

    return fixed
  },
}
