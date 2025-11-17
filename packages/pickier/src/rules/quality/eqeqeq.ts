import type { RuleModule } from '../../types'

export const eqeqeqRule: RuleModule = {
  meta: {
    docs: 'Require === and !== instead of == and !=',
    recommended: true,
  },
  check: (text, ctx) => {
    const issues: ReturnType<RuleModule['check']> = []
    const lines = text.split(/\r?\n/)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Match == (but not ===) and != (but not !==)
      // Look ahead/behind to avoid matching === or !==
      const eqPattern = /([^=!])(\s*)(==)(\s*)([^=])/g
      const neqPattern = /([^!])(\s*)(!=)(\s*)([^=])/g

      let match
      while ((match = eqPattern.exec(line)) !== null) {
        issues.push({
          filePath: ctx.filePath,
          line: i + 1,
          column: Math.max(1, match.index + 2), // +2 to skip the first character
          ruleId: 'eslint/eqeqeq',
          message: 'Expected \'===\' and instead saw \'==\'',
          severity: 'error',
        })
      }

      while ((match = neqPattern.exec(line)) !== null) {
        issues.push({
          filePath: ctx.filePath,
          line: i + 1,
          column: Math.max(1, match.index + 2), // +2 to skip the first character
          ruleId: 'eslint/eqeqeq',
          message: 'Expected \'!==\' and instead saw \'!=\'',
          severity: 'error',
        })
      }
    }

    return issues
  },
  fix: (text) => {
    let fixed = text

    // Replace != with !== (do this first to avoid conflicts)
    // Use word boundaries and lookahead to avoid replacing !==
    fixed = fixed.replace(/([^!])(\s*)(!=)(\s*)([^=])/g, '$1$2!==$4$5')

    // Replace == with === (avoid replacing ===)
    fixed = fixed.replace(/([^=!])(\s*)(==)(\s*)([^=])/g, '$1$2===$4$5')

    return fixed
  },
}
