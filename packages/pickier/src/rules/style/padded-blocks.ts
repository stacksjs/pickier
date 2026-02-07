import type { LintIssue, RuleContext, RuleModule } from '../../types'

export const paddedBlocksRule: RuleModule = {
  meta: {
    docs: 'Disallow empty lines at the beginning and end of blocks',
    recommended: true,
  },
  check(content: string, context: RuleContext): LintIssue[] {
    const issues: LintIssue[] = []
    const lines = content.split(/\r?\n/)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()

      // Check for empty line after opening brace
      if (trimmed.endsWith('{') && i + 1 < lines.length) {
        if (lines[i + 1].trim() === '') {
          issues.push({
            filePath: context.filePath,
            line: i + 2,
            column: 1,
            ruleId: 'style/padded-blocks',
            message: 'Unexpected empty line after opening brace',
            severity: 'warning',
          })
        }
      }

      // Check for empty line before closing brace
      if (trimmed === '}' && i > 0) {
        if (lines[i - 1].trim() === '') {
          issues.push({
            filePath: context.filePath,
            line: i,
            column: 1,
            ruleId: 'style/padded-blocks',
            message: 'Unexpected empty line before closing brace',
            severity: 'warning',
          })
        }
      }
    }

    return issues
  },
  fix(content: string): string {
    const lines = content.split(/\r?\n/)
    const toRemove = new Set<number>()

    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim()

      // Remove empty lines after {
      if (trimmed.endsWith('{') && i + 1 < lines.length && lines[i + 1].trim() === '') {
        toRemove.add(i + 1)
      }

      // Remove empty lines before }
      if (trimmed === '}' && i > 0 && lines[i - 1].trim() === '') {
        toRemove.add(i - 1)
      }
    }

    return lines.filter((_, i) => !toRemove.has(i)).join('\n')
  },
}
