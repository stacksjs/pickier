import type { RuleModule } from '../../types'

export const noDuplicateCaseRule: RuleModule = {
  meta: {
    docs: 'Disallow duplicate case labels in switch statements',
    recommended: true,
  },
  check: (text, ctx) => {
    const issues: ReturnType<RuleModule['check']> = []
    const lines = text.split(/\r?\n/)

    let inSwitch = false
    let seenCases = new Set<string>()
    let switchStartLine = -1

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()

      // Detect switch statement start
      if (/\bswitch\s*\(/.test(trimmed)) {
        inSwitch = true
        seenCases = new Set()
        switchStartLine = i
        continue
      }

      // Detect switch end (closing brace at similar indentation)
      if (inSwitch && trimmed === '}' && i > switchStartLine) {
        // Simple heuristic: if we see a closing brace, might be end of switch
        const switchIndent = lines[switchStartLine].match(/^\s*/)?.[0].length || 0
        const currentIndent = line.match(/^\s*/)?.[0].length || 0
        if (currentIndent <= switchIndent + 2) { // Allow for some indent variation
          inSwitch = false
          seenCases = new Set()
        }
      }

      if (inSwitch) {
        // Match case statements
        const caseMatch = trimmed.match(/^case\s+(.+?)\s*:/)
        if (caseMatch) {
          const caseValue = caseMatch[1].trim()
          if (seenCases.has(caseValue)) {
            issues.push({
              filePath: ctx.filePath,
              line: i + 1,
              column: Math.max(1, line.indexOf('case') + 1),
              ruleId: 'eslint/no-duplicate-case',
              message: `Duplicate case label '${caseValue}'`,
              severity: 'error',
            })
          }
          else {
            seenCases.add(caseValue)
          }
        }
      }
    }

    return issues
  },
}
