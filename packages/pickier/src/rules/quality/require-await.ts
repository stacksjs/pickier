import type { RuleModule } from '../../types'

export const requireAwaitRule: RuleModule = {
  meta: {
    docs: 'Disallow async functions which have no await expression',
    recommended: true,
  },
  check: (text, ctx) => {
    const issues: ReturnType<RuleModule['check']> = []
    const lines = text.split(/\r?\n/)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Match async function declarations
      const asyncMatch = line.match(/\basync\s+(?:function\s+\w+|(?:\(|\w+)\s*(?:\(|=>))/)

      if (asyncMatch) {
        let hasAwait = false
        let braceCount = 0
        let inFunction = false
        let currentLineIndex = i

        // Search through the async function
        while (currentLineIndex < lines.length) {
          const searchLine = lines[currentLineIndex]

          for (const char of searchLine) {
            if (char === '{') {
              braceCount++
              inFunction = true
            }
            if (char === '}') {
              braceCount--
              if (braceCount === 0 && inFunction) {
                break
              }
            }
          }

          // Check for await
          if (searchLine.match(/\bawait\s+/)) {
            hasAwait = true
          }

          if (braceCount === 0 && inFunction) {
            if (!hasAwait) {
              issues.push({
                filePath: ctx.filePath,
                line: i + 1,
                column: 1,
                ruleId: 'eslint/require-await',
                message: 'Async function has no await expression',
                severity: 'error',
              })
            }
            break
          }

          currentLineIndex++
        }
      }
    }

    return issues
  },
}
