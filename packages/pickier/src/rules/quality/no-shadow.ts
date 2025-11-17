import type { RuleModule } from '../../types'

export const noShadowRule: RuleModule = {
  meta: {
    docs: 'Disallow variable declarations from shadowing variables declared in the outer scope',
    recommended: false,
  },
  check: (text, ctx) => {
    const issues: ReturnType<RuleModule['check']> = []
    const lines = text.split(/\r?\n/)

    // Track declared variables per scope (simplified - just tracks top-level and function scopes)
    const topLevelVars = new Set<string>()
    const scopeStack: Set<string>[] = [topLevelVars]

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Detect function/block scope entry
      if (line.match(/\bfunction\s+\w+\s*\(|=>\s*\{|\{\s*$/)) {
        scopeStack.push(new Set())
      }

      // Detect variable declarations
      const declarations = [
        ...line.matchAll(/\b(const|let|var)\s+(\w+)/g),
        ...line.matchAll(/function\s+(\w+)\s*\(/g),
      ]

      for (const match of declarations) {
        const varName = match[2] || match[1]

        // Check if this variable shadows one from an outer scope
        for (let j = 0; j < scopeStack.length - 1; j++) {
          if (scopeStack[j].has(varName)) {
            issues.push({
              filePath: ctx.filePath,
              line: i + 1,
              column: 1,
              ruleId: 'eslint/no-shadow',
              message: `'${varName}' is already declared in the upper scope`,
              severity: 'error',
            })
            break
          }
        }

        // Add to current scope
        scopeStack[scopeStack.length - 1].add(varName)
      }

      // Detect scope exit (simplified)
      if (line.match(/^\s*\}\s*$/)) {
        if (scopeStack.length > 1) {
          scopeStack.pop()
        }
      }
    }

    return issues
  },
}
