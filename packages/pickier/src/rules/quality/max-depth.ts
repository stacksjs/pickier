import type { RuleModule } from '../../types'

export const maxDepthRule: RuleModule = {
  meta: {
    docs: 'Enforce a maximum depth that blocks can be nested',
    recommended: false,
  },
  check: (text, ctx) => {
    const issues: ReturnType<RuleModule['check']> = []
    const lines = text.split(/\r?\n/)

    const maxDepth = 4 // Default threshold
    let currentDepth = 0
    let maxReachedDepth = 0
    let maxReachedLine = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Count nesting depth by counting braces
      // Increase depth when we see control flow keywords followed by braces
      if (line.match(/\b(if|for|while|switch|try|catch|else)\b.*\{/)) {
        currentDepth++
        if (currentDepth > maxReachedDepth) {
          maxReachedDepth = currentDepth
          maxReachedLine = i + 1
        }
      }
      else if (line.match(/\{/) && !line.match(/^.*\}/)) {
        // Opening brace on its own
        const hasControlFlow = lines[i - 1]?.match(/\b(if|for|while|switch|try|catch|else)\b/)
        if (hasControlFlow) {
          currentDepth++
          if (currentDepth > maxReachedDepth) {
            maxReachedDepth = currentDepth
            maxReachedLine = i + 1
          }
        }
      }

      // Decrease depth on closing brace
      if (line.match(/^\s*\}/)) {
        currentDepth--
      }

      if (currentDepth > maxDepth) {
        issues.push({
          filePath: ctx.filePath,
          line: i + 1,
          column: 1,
          ruleId: 'eslint/max-depth',
          message: `Blocks are nested too deeply (${currentDepth}), maximum allowed is ${maxDepth}`,
          severity: 'error',
        })
      }
    }

    return issues
  },
}
