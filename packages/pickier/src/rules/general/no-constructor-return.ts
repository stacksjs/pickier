import type { RuleModule } from '../../types'

export const noConstructorReturnRule: RuleModule = {
  meta: {
    docs: 'Disallow return statements in constructors - constructors automatically return the instance',
  },
  check: (text, ctx) => {
    const issues: ReturnType<RuleModule['check']> = []
    const lines = text.split(/\r?\n/)

    // Find constructor methods
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Skip comments
      const commentIdx = line.indexOf('//')
      const codeOnly = commentIdx >= 0 ? line.slice(0, commentIdx) : line

      // Match constructor declarations
      // Handles: constructor(...) {
      //          constructor() {
      const constructorMatch = codeOnly.match(/\bconstructor\s*\(/)

      if (!constructorMatch)
        continue

      // Find the constructor body
      let braceDepth = 0
      let foundOpenBrace = false
      let constructorEndLine = -1

      // Search for opening brace on current and subsequent lines
      for (let j = i; j < lines.length; j++) {
        const searchLine = lines[j]
        let inString: 'single' | 'double' | 'template' | null = null
        let escaped = false

        for (let k = 0; k < searchLine.length; k++) {
          const ch = searchLine[k]

          if (escaped) {
            escaped = false
            continue
          }

          if (ch === '\\' && inString) {
            escaped = true
            continue
          }

          if (!inString) {
            if (ch === '\'') {
              inString = 'single'
            }
            else if (ch === '"') {
              inString = 'double'
            }
            else if (ch === '`') {
              inString = 'template'
            }
            else if (ch === '{') {
              braceDepth++
              foundOpenBrace = true
            }
            else if (ch === '}') {
              braceDepth--
              if (foundOpenBrace && braceDepth === 0) {
                constructorEndLine = j
                break
              }
            }
          }
          else {
            if ((inString === 'single' && ch === '\'')
              || (inString === 'double' && ch === '"')
              || (inString === 'template' && ch === '`')) {
              inString = null
            }
          }
        }

        if (constructorEndLine !== -1)
          break
      }

      if (constructorEndLine === -1)
        continue

      // Now search for return statements within the constructor body
      for (let j = i; j <= constructorEndLine; j++) {
        const bodyLine = lines[j]

        // Skip the line with the constructor declaration itself
        if (j === i)
          continue

        // Skip comment-only lines
        if (/^\s*\/\//.test(bodyLine))
          continue

        // Strip inline comments
        const commentIdx = bodyLine.indexOf('//')
        let bodyCodeOnly = commentIdx >= 0 ? bodyLine.slice(0, commentIdx) : bodyLine

        // Strip strings to avoid false matches inside strings
        bodyCodeOnly = bodyCodeOnly.replace(/(['"`])(?:(?!\1)[^\\]|\\.)*?\1/g, '""')

        // Check for return statements
        // Match: return; or return <value>;
        // But NOT: // return or inside strings
        const returnMatch = bodyCodeOnly.match(/\breturn\b/)

        if (returnMatch) {
          // Make sure it's actually a return statement, not part of another word
          const returnIdx = bodyCodeOnly.indexOf('return')
          const before = returnIdx > 0 ? bodyCodeOnly[returnIdx - 1] : ' '
          const after = returnIdx + 6 < bodyCodeOnly.length ? bodyCodeOnly[returnIdx + 6] : ' '

          // Check that it's word-bounded
          if (/\w/.test(before) || /\w/.test(after)) {
            continue
          }

          // Check what comes after 'return'
          const afterReturn = bodyCodeOnly.slice(returnIdx + 6).trim()

          // Allow 'return this' as it's redundant but harmless
          if (afterReturn.startsWith('this;') || afterReturn === 'this') {
            continue
          }

          // Allow empty return (return;) as it just exits early
          if (afterReturn === ';' || afterReturn === '') {
            continue
          }

          // Found a return with a value
          const actualLineIdx = bodyLine.indexOf('return')
          issues.push({
            filePath: ctx.filePath,
            line: j + 1,
            column: actualLineIdx + 1 || 1,
            ruleId: 'no-constructor-return',
            message: 'Unexpected return statement in constructor. Constructors should not return values.',
            severity: 'error',
            help: 'Remove the return statement or move the logic outside of the constructor',
          })
        }
      }
    }

    return issues
  },
}
