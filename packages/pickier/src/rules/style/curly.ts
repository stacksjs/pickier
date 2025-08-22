import type { RuleModule } from '../../types'

export const curlyRule: RuleModule = {
  meta: { docs: 'Enforce the consistent use of curly braces with "multi" option - removes braces only for single statements' },
  check: (text, ctx) => {
    const issues: ReturnType<RuleModule['check']> = []
    const lines = text.split(/\r?\n/)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      const ifWithBraces = line.match(/^\s*if\s*\([^)]*\)\s*\{/)
      if (ifWithBraces) {
        let braceDepth = 1
        let j = i
        let statementsInBlock = 0
        let closingBraceFound = false
        let charIndex = line.indexOf('{') + 1

        while (j < lines.length && !closingBraceFound) {
          const currentLine = j === i ? line.substring(charIndex) : lines[j]

          for (let k = 0; k < currentLine.length; k++) {
            const char = currentLine[k]
            if (char === '{') braceDepth++
            else if (char === '}') { braceDepth--; if (braceDepth === 0) { closingBraceFound = true; break } }
          }

          if (j > i || charIndex > 0) {
            const contentLine = j === i ? currentLine : lines[j]
            const trimmedContent = contentLine.trim()
            if (trimmedContent && !trimmedContent.startsWith('//') && !trimmedContent.startsWith('/*') && !trimmedContent.startsWith('}') && !trimmedContent.startsWith('{')) {
              statementsInBlock++
            }
          }

          j++
          charIndex = 0
        }

        if (closingBraceFound && statementsInBlock === 1) {
          let hasElse = false
          for (let k = j; k < lines.length; k++) {
            const nextLine = lines[k].trim()
            if (!nextLine || nextLine.startsWith('//') || nextLine.startsWith('/*')) continue
            if (nextLine.startsWith('else')) {
              hasElse = true
              const elseWithBraces = nextLine.match(/^else\s*\{/)
              if (elseWithBraces) {
                let elseStatementsInBlock = 0
                let elseBraceDepth = 1
                let elseJ = k
                let elseClosingBraceFound = false
                let elseCharIndex = nextLine.indexOf('{') + 1

                while (elseJ < lines.length && !elseClosingBraceFound) {
                  const elseCurrentLine = elseJ === k ? nextLine.substring(elseCharIndex) : lines[elseJ]

                  for (let elseK = 0; elseK < elseCurrentLine.length; elseK++) {
                    const elseChar = elseCurrentLine[elseK]
                    if (elseChar === '{') elseBraceDepth++
                    else if (elseChar === '}') { elseBraceDepth--; if (elseBraceDepth === 0) { elseClosingBraceFound = true; break } }
                  }

                  if (elseJ > k || elseCharIndex > 0) {
                    const elseContentLine = elseJ === k ? elseCurrentLine : lines[elseJ]
                    const elseTrimmedContent = elseContentLine.trim()
                    if (elseTrimmedContent && !elseTrimmedContent.startsWith('//') && !elseTrimmedContent.startsWith('/*') && !elseTrimmedContent.startsWith('}') && !elseTrimmedContent.startsWith('{')) {
                      elseStatementsInBlock++
                    }
                  }

                  elseJ++
                  elseCharIndex = 0
                }

                if (elseStatementsInBlock === 1) {
                  issues.push({ filePath: ctx.filePath, line: i + 1, column: 1, ruleId: 'style/curly', message: 'Unnecessary curly braces around single statement', severity: 'warning' })
                }
              }
              else {
                issues.push({ filePath: ctx.filePath, line: i + 1, column: 1, ruleId: 'style/curly', message: 'Unnecessary curly braces around single statement', severity: 'warning' })
              }
              break
            }
            break
          }

          if (!hasElse) {
            issues.push({ filePath: ctx.filePath, line: i + 1, column: 1, ruleId: 'style/curly', message: 'Unnecessary curly braces around single statement', severity: 'warning' })
          }
        }
      }

      const elseWithBraces = line.match(/^\s*else\s*\{/)
      if (elseWithBraces) {
        let braceDepth = 1
        let j = i
        let statementsInBlock = 0
        let closingBraceFound = false

        let charIndex = line.indexOf('{') + 1

        while (j < lines.length && !closingBraceFound) {
          const currentLine = j === i ? line.substring(charIndex) : lines[j]

          for (let k = 0; k < currentLine.length; k++) {
            const char = currentLine[k]
            if (char === '{') { braceDepth++ }
            else if (char === '}') { braceDepth--; if (braceDepth === 0) { closingBraceFound = true; break } }
          }

          if (j > i || charIndex > 0) {
            const contentLine = j === i ? currentLine : lines[j]
            const trimmedContent = contentLine.trim()
            if (trimmedContent && !trimmedContent.startsWith('//') && !trimmedContent.startsWith('/*') && !trimmedContent.startsWith('}') && !trimmedContent.startsWith('{')) {
              statementsInBlock++
            }
          }

          j++
          charIndex = 0
        }

        if (closingBraceFound && statementsInBlock === 1) {
          let correspondingIfHasBraces = false
          for (let k = i - 1; k >= 0; k--) {
            const prevLine = lines[k].trim()
            if (!prevLine || prevLine.startsWith('//') || prevLine.startsWith('/*')) continue
            const ifMatch = prevLine.match(/^\s*if\s*\([^)]*\)/)
            if (ifMatch) { correspondingIfHasBraces = prevLine.includes('{'); break }
            break
          }

          if (!correspondingIfHasBraces) {
            issues.push({ filePath: ctx.filePath, line: i + 1, column: 1, ruleId: 'style/curly', message: 'Unnecessary curly braces around single statement', severity: 'warning' })
          }
        }
      }
    }

    return issues
  },
}
