import type { LintIssue, RuleModule } from '../../types'

/**
 * MD043 - Required heading structure
 */
export const requiredHeadingsRule: RuleModule = {
  meta: {
    docs: 'Document should have required heading structure',
  },
  check: (text, ctx) => {
    const issues: LintIssue[] = []
    const lines = text.split(/\r?\n/)

    const options = (ctx.options as { headings?: string[] }) || {}
    const requiredHeadings = options.headings || []

    if (requiredHeadings.length === 0) {
      return issues // No required headings configured
    }

    // Collect all headings
    const actualHeadings: string[] = []

    for (const line of lines) {
      // Check for ATX headings
      const atxMatch = line.match(/^#{1,6}\s+(.+?)(?:\s*#+\s*)?$/)
      if (atxMatch) {
        actualHeadings.push(atxMatch[1].trim())
      }
    }

    // Check if required headings are present in order
    let requiredIndex = 0

    for (let i = 0; i < actualHeadings.length && requiredIndex < requiredHeadings.length; i++) {
      if (actualHeadings[i] === requiredHeadings[requiredIndex]) {
        requiredIndex++
      }
    }

    if (requiredIndex < requiredHeadings.length) {
      issues.push({
        filePath: ctx.filePath,
        line: 1,
        column: 1,
        ruleId: 'markdown/required-headings',
        message: `Missing required heading: '${requiredHeadings[requiredIndex]}'`,
        severity: 'error',
      })
    }

    return issues
  },
}
