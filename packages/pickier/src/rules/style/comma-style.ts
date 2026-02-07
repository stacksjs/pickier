import type { LintIssue, RuleContext, RuleModule } from '../../types'

export const commaStyleRule: RuleModule = {
  meta: {
    docs: 'Enforce comma-last style (commas at the end of lines, not the beginning)',
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

      // Check if line starts with a comma (comma-first style)
      if (trimmed.startsWith(',')) {
        issues.push({
          filePath: context.filePath,
          line: i + 1,
          column: line.indexOf(',') + 1,
          ruleId: 'style/comma-style',
          message: 'Comma should be placed at the end of the previous line',
          severity: 'warning',
        })
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

      if (trimmed.startsWith(',') && result.length > 0) {
        // Move comma to end of previous line
        const prevIdx = result.length - 1
        result[prevIdx] = result[prevIdx].replace(/\s*$/, ',')
        // Remove leading comma from current line
        const indent = line.match(/^(\s*)/)?.[1] || ''
        result.push(indent + trimmed.slice(1).trim())
      }
      else {
        result.push(line)
      }
    }

    return result.join('\n')
  },
}
