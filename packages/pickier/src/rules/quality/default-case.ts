import type { RuleModule } from '../../types'

export const defaultCaseRule: RuleModule = {
  meta: {
    docs: 'Require default case in switch statements',
    recommended: false,
  },
  check: (text, ctx) => {
    const issues: ReturnType<RuleModule['check']> = []
    const lines = text.split(/\r?\n/)

    let inSwitch = false
    let switchLine = 0
    let hasDefault = false
    let braceCount = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Check for switch statement
      if (line.match(/\bswitch\s*\(/)) {
        inSwitch = true
        switchLine = i + 1
        hasDefault = false
        braceCount = 0
      }

      if (inSwitch) {
        // Count braces
        for (const char of line) {
          if (char === '{')
            braceCount++
          if (char === '}') {
            braceCount--
            if (braceCount === 0) {
              // End of switch - check if we found default
              if (!hasDefault) {
                issues.push({
                  filePath: ctx.filePath,
                  line: switchLine,
                  column: 1,
                  ruleId: 'eslint/default-case',
                  message: 'Expected a default case',
                  severity: 'error',
                })
              }
              inSwitch = false
            }
          }
        }

        // Check for default case
        if (line.match(/\bdefault\s*:/)) {
          hasDefault = true
        }
      }
    }

    return issues
  },
}
