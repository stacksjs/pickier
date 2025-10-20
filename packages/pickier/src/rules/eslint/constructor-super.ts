import type { RuleModule } from '../../types'

export const constructorSuperRule: RuleModule = {
  meta: {
    docs: 'Require super() calls in constructors of derived classes',
    recommended: true,
  },
  check: (text, ctx) => {
    const issues: ReturnType<RuleModule['check']> = []
    const lines = text.split(/\r?\n/)

    // Track if we're in a class that extends another class
    let inExtendedClass = false
    let inConstructor = false
    let constructorLine = 0
    let braceCount = 0
    let hasSuperCall = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Check for class declaration with extends
      if (line.match(/\bclass\s+\w+\s+extends\s+\w+/)) {
        inExtendedClass = true
      }

      // Check for constructor
      if (inExtendedClass && line.match(/\bconstructor\s*\(/)) {
        inConstructor = true
        constructorLine = i + 1
        braceCount = 0
        hasSuperCall = false
      }

      if (inConstructor) {
        // Count braces
        for (const char of line) {
          if (char === '{') braceCount++
          if (char === '}') braceCount--
        }

        // Check for super() call
        if (line.match(/\bsuper\s*\(/)) {
          hasSuperCall = true
        }

        // End of constructor
        if (braceCount === 0 && line.includes('}')) {
          if (!hasSuperCall) {
            issues.push({
              filePath: ctx.filePath,
              line: constructorLine,
              column: 1,
              ruleId: 'eslint/constructor-super',
              message: 'Constructors of derived classes must call super()',
              severity: 'error',
            })
          }
          inConstructor = false
          inExtendedClass = false
        }
      }
    }

    return issues
  },
}
