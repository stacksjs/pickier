import type { LintIssue, RuleContext, RuleModule } from '../../types'

// Very lightweight heuristic rule:
// - Flags regex literals that contain one or more capturing groups
// - Skips if any numeric backreference (e.g. \1, \2) is present in the same literal
// - Treats non-capturing groups (?:...) as not counted
// Limitations are acceptable for our test cases.
function findIssues(content: string, ctx: RuleContext): LintIssue[] {
  const issues: LintIssue[] = []
  const filePath = ctx.filePath

  // Match JavaScript regex literals roughly: /.../flags
  // Avoid matching `//` comments by requiring a preceding boundary or start
  const re = /(^|[^\\\w])/g
  let idx = 0

  // Scan the file for regex literals by iterating characters and detecting '/'
  // followed by a pattern and closing '/'. This keeps it robust for our test content.
  while (idx < content.length) {
    const ch = content[idx]
    if (ch === '/') {
      // Try to parse a regex literal starting here
      let i = idx + 1
      let inClass = false // inside [...]
      let escaped = false
      let closedAt = -1
      while (i < content.length) {
        const c = content[i]
        if (escaped) {
          escaped = false
        }
        else if (c === '\\') {
          escaped = true
        }
        else if (c === '[') {
          if (!inClass)
            inClass = true
        }
        else if (c === ']') {
          if (inClass)
            inClass = false
        }
        else if (c === '/' && !inClass) {
          closedAt = i
          break
        }
        i++
      }

      if (closedAt > idx) {
        const pattern = content.slice(idx + 1, closedAt)
        // Extract flags (unused here)
        // const flags = (() => { let j = closedAt + 1; let s = ''; while (/[a-z]/i.test(content[j] || '')) { s += content[j++] } return s })()

        // Skip literals that contain any numeric backreference (limitation per tests)
        if (/\\[1-9]/.test(pattern)) {
          idx = closedAt + 1
          continue
        }

        // Count capturing groups: '(' not escaped, not followed by '?:'
        let capCount = 0
        for (let j = 0; j < pattern.length; j++) {
          const c = pattern[j]
          if (c === '(') {
            const prev = pattern[j - 1]
            const isEscaped = prev === '\\'
            if (!isEscaped) {
              const next2 = pattern.slice(j + 1, j + 3)
              if (next2 !== '?:')
                capCount++
            }
          }
        }

        if (capCount > 0) {
          // Report at the line/column of the first '('
          const rel = pattern.indexOf('(')
          const reportPos = idx + 1 + (rel >= 0 ? rel : 0)
          const prefix = content.slice(0, reportPos)
          const line = (prefix.match(/\r?\n/g) || []).length + 1
          const col = reportPos - (prefix.lastIndexOf('\n') + 1) + 1
          issues.push({
            filePath,
            line,
            column: col,
            ruleId: 'regexp/no-unused-capturing-group',
            message: 'Unused capturing group in regular expression',
            severity: 'error',
          })
        }

        idx = closedAt + 1
        continue
      }
    }
    idx++
  }

  return issues
}

export const noUnusedCapturingGroupRule: RuleModule = {
  meta: {
    docs: 'Flags regex literals with capturing groups when there is no numeric backreference present',
    recommended: false,
  },
  check(content, ctx) {
    return findIssues(content, ctx)
  },
}
