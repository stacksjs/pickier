import type { LintIssue, RuleContext, RuleModule } from '../../types'

export const dotLocationRule: RuleModule = {
  meta: {
    docs: 'Enforce dot on the property line in chained method calls',
    recommended: true,
  },
  check(content: string, context: RuleContext): LintIssue[] {
    const issues: LintIssue[] = []
    const lines = content.split(/\r?\n/)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()

      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*'))
        continue

      // Check if line ends with a dot (dot should be on next line)
      if (trimmed.endsWith('.') && i + 1 < lines.length) {
        const nextTrimmed = lines[i + 1].trim()
        // Only flag if the next line is a continuation (starts with identifier)
        if (nextTrimmed && /^[a-zA-Z_$]/.test(nextTrimmed)) {
          issues.push({
            filePath: context.filePath,
            line: i + 1,
            column: line.length,
            ruleId: 'style/dot-location',
            message: 'Dot should be on the same line as the property',
            severity: 'warning',
          })
        }
      }
    }

    return issues
  },
  fix(content: string): string {
    const lines = content.split(/\r?\n/)
    const result: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()

      if (trimmed.endsWith('.') && i + 1 < lines.length) {
        const nextLine = lines[i + 1]
        const nextTrimmed = nextLine.trim()
        if (nextTrimmed && /^[a-zA-Z_$]/.test(nextTrimmed)) {
          // Remove trailing dot from current line
          result.push(line.replace(/\.\s*$/, ''))
          // Add dot to beginning of next line (preserve indent)
          const indent = nextLine.match(/^(\s*)/)?.[1] || ''
          lines[i + 1] = `${indent}.${nextTrimmed}`
          continue
        }
      }

      result.push(line)
    }

    return result.join('\n')
  },
}
