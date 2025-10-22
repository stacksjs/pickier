import type { RuleModule } from '../../types'

export const noDupeClassMembersRule: RuleModule = {
  meta: {
    docs: 'Disallow duplicate class members',
    recommended: true,
  },
  check: (text, ctx) => {
    const issues: ReturnType<RuleModule['check']> = []
    const lines = text.split(/\r?\n/)

    let inClass = false
    let classMembers = new Set<string>()
    let braceCount = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Check for class declaration
      if (line.match(/\bclass\s+\w+/)) {
        inClass = true
        classMembers = new Set()
        braceCount = 0
      }

      if (inClass) {
        // Count braces
        for (const char of line) {
          if (char === '{') braceCount++
          if (char === '}') {
            braceCount--
            if (braceCount === 0) {
              inClass = false
            }
          }
        }

        // Match method or property names (including getters, setters, and constructors)
        const memberMatches = [
          ...line.matchAll(/^\s*(?:public|private|protected|static|readonly|async)?\s*(?:get|set)?\s*(\w+)\s*\(/g),
          ...line.matchAll(/^\s*(?:public|private|protected|static|readonly)?\s*(\w+)\s*[:=]/g),
        ]

        for (const match of memberMatches) {
          const memberName = match[1]

          if (classMembers.has(memberName)) {
            issues.push({
              filePath: ctx.filePath,
              line: i + 1,
              column: 1,
              ruleId: 'eslint/no-dupe-class-members',
              message: `Duplicate class member '${memberName}'`,
              severity: 'error',
            })
          }
          else {
            classMembers.add(memberName)
          }
        }
      }
    }

    return issues
  },
}
