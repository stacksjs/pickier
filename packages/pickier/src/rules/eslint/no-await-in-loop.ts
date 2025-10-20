import type { RuleModule } from '../../types'

export const noAwaitInLoopRule: RuleModule = {
  meta: {
    docs: 'Disallow await inside of loops',
    recommended: true,
  },
  check: (text, ctx) => {
    const issues: ReturnType<RuleModule['check']> = []
    const lines = text.split(/\r?\n/)

    let inLoop = false
    let loopBraceCount = 0
    let loopStartLine = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Check for loop declarations
      if (line.match(/\b(for|while|do)\s*\(/)) {
        inLoop = true
        loopBraceCount = 0
        loopStartLine = i
      }

      if (inLoop) {
        // Count braces
        for (const char of line) {
          if (char === '{') loopBraceCount++
          if (char === '}') {
            loopBraceCount--
            if (loopBraceCount === 0) {
              inLoop = false
            }
          }
        }

        // Check for await
        if (line.match(/\bawait\s+/)) {
          issues.push({
            filePath: ctx.filePath,
            line: i + 1,
            column: 1,
            ruleId: 'eslint/no-await-in-loop',
            message: 'Unexpected await inside a loop. Consider using Promise.all() instead',
            severity: 'error',
          })
        }
      }
    }

    return issues
  },
}
