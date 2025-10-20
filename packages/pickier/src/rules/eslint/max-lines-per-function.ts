import type { RuleModule } from '../../types'

export const maxLinesPerFunctionRule: RuleModule = {
  meta: {
    docs: 'Enforce a maximum number of lines of code in a function',
    recommended: false,
  },
  check: (text, ctx) => {
    const issues: ReturnType<RuleModule['check']> = []
    const lines = text.split(/\r?\n/)

    const maxLines = 50 // Default threshold

    let inFunction = false
    let functionStartLine = 0
    let functionName = ''
    let braceCount = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Detect function start
      const funcMatch = line.match(/\bfunction\s+(\w+)\s*\(|(\w+)\s*=\s*(?:\([^)]*\)|(\w+))\s*=>/)
      if (funcMatch) {
        inFunction = true
        functionStartLine = i + 1
        functionName = funcMatch[1] || funcMatch[2] || funcMatch[3] || 'anonymous'
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
              const functionLines = i + 1 - functionStartLine + 1

              if (functionLines > maxLines) {
                issues.push({
                  filePath: ctx.filePath,
                  line: functionStartLine,
                  column: 1,
                  ruleId: 'eslint/max-lines-per-function',
                  message: `Function '${functionName}' has ${functionLines} lines, exceeds maximum of ${maxLines}`,
                  severity: 'error',
                })
              }
              inFunction = false
            }
          }
        }
      }
    }

    return issues
  },
}
