import type { RuleModule } from '../../types'

export const complexityRule: RuleModule = {
  meta: {
    docs: 'Enforce a maximum cyclomatic complexity allowed in a program',
    recommended: false,
  },
  check: (text, ctx) => {
    const issues: ReturnType<RuleModule['check']> = []
    const lines = text.split(/\r?\n/)

    const maxComplexity = 10 // Default threshold

    let inFunction = false
    let functionLine = 0
    let functionName = ''
    let complexity = 0
    let braceCount = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Detect function start
      const funcMatch = line.match(/\bfunction\s+(\w+)\s*\(|(\w+)\s*=\s*(?:\([^)]*\)|(\w+))\s*=>/)
      if (funcMatch) {
        inFunction = true
        functionLine = i + 1
        functionName = funcMatch[1] || funcMatch[2] || funcMatch[3] || 'anonymous'
        complexity = 1 // Base complexity
        braceCount = 0
      }

      if (inFunction) {
        // Count braces
        for (const char of line) {
          if (char === '{') braceCount++
          if (char === '}') {
            braceCount--
            if (braceCount === 0) {
              // End of function
              if (complexity > maxComplexity) {
                issues.push({
                  filePath: ctx.filePath,
                  line: functionLine,
                  column: 1,
                  ruleId: 'eslint/complexity',
                  message: `Function '${functionName}' has complexity ${complexity}, exceeds maximum of ${maxComplexity}`,
                  severity: 'error',
                })
              }
              inFunction = false
            }
          }
        }

        // Count complexity-increasing statements
        const complexityIncreases = [
          /\bif\s*\(/,
          /\belse\s+if\s*\(/,
          /\bfor\s*\(/,
          /\bwhile\s*\(/,
          /\bcase\s+/,
          /\bcatch\s*\(/,
          /\b&&\b/,
          /\b\|\|\b/,
          /\?\s*.*\s*:/,
        ]

        for (const pattern of complexityIncreases) {
          const matches = line.match(new RegExp(pattern, 'g'))
          if (matches) {
            complexity += matches.length
          }
        }
      }
    }

    return issues
  },
}
