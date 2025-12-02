import type { LintIssue, RuleModule } from '../../types'

/**
 * MD032 - Lists should be surrounded by blank lines
 */
export const blanksAroundListsRule: RuleModule = {
  meta: {
    docs: 'Lists should be surrounded by blank lines',
  },
  check: (text, ctx) => {
    const issues: LintIssue[] = []
    const lines = text.split(/\r?\n/)

    let inList = false
    let listStartLine = -1

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const prevLine = i > 0 ? lines[i - 1] : ''

      // Check if this is a list item
      const isListItem = /^(\s*)([*\-+]|\d+\.)\s+/.test(line)

      if (isListItem && !inList) {
        // Start of a new list
        inList = true
        listStartLine = i

        // Check if previous line exists and is not blank
        if (i > 0 && prevLine.trim().length > 0) {
          issues.push({
            filePath: ctx.filePath,
            line: i + 1,
            column: 1,
            ruleId: 'markdown/blanks-around-lists',
            message: 'Lists should be surrounded by blank lines',
            severity: 'error',
          })
        }
      }
      else if (!isListItem && inList && line.trim().length > 0) {
        // End of list (non-blank, non-list line)
        inList = false

        // Check if previous line was a list item
        const prevLineIsListItem = /^(\s*)([*\-+]|\d+\.)\s+/.test(prevLine)
        if (prevLineIsListItem) {
          issues.push({
            filePath: ctx.filePath,
            line: i,
            column: 1,
            ruleId: 'markdown/blanks-around-lists',
            message: 'Lists should be surrounded by blank lines',
            severity: 'error',
          })
        }
      }
    }

    return issues
  },
  fix: (text) => {
    const lines = text.split(/\r?\n/)
    const result: string[] = []
    let inList = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const prevLine = i > 0 ? lines[i - 1] : ''
      const isListItem = /^(\s*)([*\-+]|\d+\.)\s+/.test(line)

      if (isListItem && !inList) {
        // Start of list - add blank line before if needed
        if (i > 0 && prevLine.trim().length > 0 && result.length > 0) {
          result.push('')
        }
        inList = true
      }
      else if (!isListItem && line.trim().length > 0 && inList) {
        // End of list - add blank line before next content
        inList = false
        if (result.length > 0) {
          result.push('')
        }
      }
      else if (!isListItem && line.trim().length === 0) {
        // Blank line might end list
        const nextLine = i + 1 < lines.length ? lines[i + 1] : ''
        const nextIsListItem = /^(\s*)([*\-+]|\d+\.)\s+/.test(nextLine)
        if (!nextIsListItem && inList) {
          inList = false
        }
      }

      result.push(line)
    }

    return result.join('\n')
  },
}
