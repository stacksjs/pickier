/* eslint-disable style/max-statements-per-line, unused-imports/no-unused-vars */
import type { PickierPlugin, LintIssue as PluginLintIssue } from '../../../types'

export const stylePlugin: PickierPlugin = {
  name: 'style',
  rules: {
    'curly': {
      meta: { docs: 'Enforce the consistent use of curly braces with "multi" option - removes braces only for single statements' },
      check: (text, ctx) => {
        const issues: PluginLintIssue[] = []
        const lines = text.split(/\r?\n/)

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]

          // Match if statements with braces
          const ifWithBraces = line.match(/^\s*if\s*\([^)]*\)\s*\{/)
          if (ifWithBraces) {
            // Count statements inside the if block
            let braceDepth = 1
            let j = i
            let statementsInBlock = 0
            let closingBraceFound = false

            // Start from the opening brace position
            let charIndex = line.indexOf('{') + 1

            while (j < lines.length && !closingBraceFound) {
              const currentLine = j === i ? line.substring(charIndex) : lines[j]

              for (let k = 0; k < currentLine.length; k++) {
                const char = currentLine[k]
                if (char === '{') {
                  braceDepth++
                }
                else if (char === '}') {
                  braceDepth--
                  if (braceDepth === 0) {
                    closingBraceFound = true
                    break
                  }
                }
              }

              // Count non-empty, non-comment lines as statements
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
              // Check if there's an else clause
              let hasElse = false
              for (let k = j; k < lines.length; k++) {
                const nextLine = lines[k].trim()
                if (!nextLine || nextLine.startsWith('//') || nextLine.startsWith('/*'))
                  continue
                if (nextLine.startsWith('else')) {
                  hasElse = true
                  // If else also has single statement, we can remove braces from both
                  const elseWithBraces = nextLine.match(/^else\s*\{/)
                  if (elseWithBraces) {
                    // Count statements in else block too
                    let elseStatementsInBlock = 0
                    let elseBraceDepth = 1
                    let elseJ = k
                    let elseClosingBraceFound = false
                    let elseCharIndex = nextLine.indexOf('{') + 1

                    while (elseJ < lines.length && !elseClosingBraceFound) {
                      const elseCurrentLine = elseJ === k ? nextLine.substring(elseCharIndex) : lines[elseJ]

                      for (let elseK = 0; elseK < elseCurrentLine.length; elseK++) {
                        const elseChar = elseCurrentLine[elseK]
                        if (elseChar === '{') {
                          elseBraceDepth++
                        }
                        else if (elseChar === '}') {
                          elseBraceDepth--
                          if (elseBraceDepth === 0) {
                            elseClosingBraceFound = true
                            break
                          }
                        }
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

                    // Only flag if both if and else have single statements
                    if (elseStatementsInBlock === 1) {
                      issues.push({
                        filePath: ctx.filePath,
                        line: i + 1,
                        column: 1,
                        ruleId: 'style/curly',
                        message: 'Unnecessary curly braces around single statement',
                        severity: 'warning',
                      })
                    }
                  }
                  else {
                    // Else without braces - can remove if braces
                    issues.push({
                      filePath: ctx.filePath,
                      line: i + 1,
                      column: 1,
                      ruleId: 'style/curly',
                      message: 'Unnecessary curly braces around single statement',
                      severity: 'warning',
                    })
                  }
                  break
                }
                break
              }

              if (!hasElse) {
                // Single statement if without else - braces can be removed
                issues.push({
                  filePath: ctx.filePath,
                  line: i + 1,
                  column: 1,
                  ruleId: 'style/curly',
                  message: 'Unnecessary curly braces around single statement',
                  severity: 'warning',
                })
              }
            }
          }

          // Match else statements with braces
          const elseWithBraces = line.match(/^\s*else\s*\{/)
          if (elseWithBraces) {
            // Count statements in else block
            let braceDepth = 1
            let j = i
            let statementsInBlock = 0
            let closingBraceFound = false

            let charIndex = line.indexOf('{') + 1

            while (j < lines.length && !closingBraceFound) {
              const currentLine = j === i ? line.substring(charIndex) : lines[j]

              for (let k = 0; k < currentLine.length; k++) {
                const char = currentLine[k]
                if (char === '{') {
                  braceDepth++
                }
                else if (char === '}') {
                  braceDepth--
                  if (braceDepth === 0) {
                    closingBraceFound = true
                    break
                  }
                }
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
              // Find the corresponding if statement
              let correspondingIfHasBraces = false
              let correspondingIfHasSingleStatement = false
              for (let k = i - 1; k >= 0; k--) {
                const prevLine = lines[k].trim()
                if (!prevLine || prevLine.startsWith('//') || prevLine.startsWith('/*'))
                  continue
                const ifMatch = prevLine.match(/^\s*if\s*\([^)]*\)/)
                if (ifMatch) {
                  correspondingIfHasBraces = prevLine.includes('{')
                  // TODO: Check if if has single statement too
                  correspondingIfHasSingleStatement = true // Simplified for now
                  break
                }
                break
              }

              if (!correspondingIfHasBraces) {
                // If doesn't have braces but else does, and else is single statement
                issues.push({
                  filePath: ctx.filePath,
                  line: i + 1,
                  column: 1,
                  ruleId: 'style/curly',
                  message: 'Unnecessary curly braces around single statement',
                  severity: 'warning',
                })
              }
            }
          }
        }

        return issues
      },
    },
    'max-statements-per-line': {
      meta: { docs: 'Limit the number of statements allowed on a single line' },
      check: (text, ctx) => {
        // options: { max?: number }
        const max: number = (ctx.options && typeof (ctx.options as any).max === 'number') ? (ctx.options as any).max : 1
        const issues: PluginLintIssue[] = []
        const lines = text.split(/\r?\n/)

        const countStatementsOnLine = (line: string): number => {
          // Skip trailing inline comments
          const commentIdx = line.indexOf('//')
          const effective = commentIdx >= 0 ? line.slice(0, commentIdx) : line
          let countSemis = 0
          let inSingle = false; let inDouble = false; let inBacktick = false
          let escape = false
          // Detect for-header parentheses to ignore semicolons there
          let inForHeader = false
          let parenDepth = 0
          for (let i = 0; i < effective.length; i++) {
            const ch = effective[i]
            if (escape) {
              escape = false
              continue
            }
            if (ch === '\\') { escape = true; continue }
            if (!inDouble && !inBacktick && ch === '\'') { inSingle = !inSingle; continue }
            if (!inSingle && !inBacktick && ch === '"') { inDouble = !inDouble; continue }
            if (!inSingle && !inDouble && ch === '`') { inBacktick = !inBacktick; continue }
            if (inSingle || inDouble || inBacktick)
              continue
            // crude detection of for header
            if (!inForHeader) {
              if (ch === 'f' && effective.slice(i, i + 4).match(/^for\b/)) {
                // find '(' after for
                const rest = effective.slice(i + 3).trimStart()
                const offset = effective.length - rest.length
                if (effective[offset] === '(') { inForHeader = true; parenDepth = 1; i = offset; continue }
              }
            }
            else {
              if (ch === '(') {
                parenDepth++
              }
              else if (ch === ')') {
                parenDepth--; if (parenDepth <= 0)
                  inForHeader = false
              }
              else if (ch === ';') { /* ignore semicolons inside for(...) */ continue }
            }
            if (ch === ';')
              countSemis++
          }
          if (countSemis === 0)
            return 1
          // If line ends with ';' assume count equals number of statements
          const trimmed = effective.trimEnd()
          const endsWithSemi = trimmed.endsWith(';')
          return endsWithSemi ? countSemis : countSemis + 1
        }

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]
          if (/^\s*$/.test(line))
            continue
          const num = countStatementsOnLine(line)
          if (num > max) {
            issues.push({
              filePath: ctx.filePath,
              line: i + 1,
              column: 1,
              ruleId: 'max-statements-per-line',
              message: `This line has ${num} statements. Maximum allowed is ${max}`,
              severity: 'warning',
            })
          }
        }
        return issues
      },
    },
  },
}
