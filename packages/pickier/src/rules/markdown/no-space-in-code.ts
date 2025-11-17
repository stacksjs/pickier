import type { LintIssue, RuleModule } from '../../types'

/**
 * MD038 - Spaces inside code span elements
 */
export const noSpaceInCodeRule: RuleModule = {
  meta: {
    docs: 'Code span elements should not have spaces inside the backticks',
  },
  check: (text, ctx) => {
    const issues: LintIssue[] = []
    const lines = text.split(/\r?\n/)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Check for spaces inside code spans: backtick(s) + space(s) + content + space(s) + backtick(s)
      // Must have both leading AND trailing spaces to be an issue
      const matches = line.matchAll(/(`+)\s+([^`]+?)\s+\1/g)

      for (const match of matches) {
        const column = match.index! + 1
        issues.push({
          filePath: ctx.filePath,
          line: i + 1,
          column,
          ruleId: 'markdown/no-space-in-code',
          message: 'Spaces inside code span elements',
          severity: 'error',
        })
      }
    }

    return issues
  },
  fix: (text) => {
    // Remove spaces inside code spans: backtick(s) + space(s) + content + space(s) + backtick(s)
    // This matches the check pattern - requires both leading and trailing spaces
    return text.replace(/(`+)\s+([^`]+?)\s+\1/g, (match, backticks, content) => {
      // Trim the content and rebuild
      return `${backticks}${content.trim()}${backticks}`
    })
  },
}
