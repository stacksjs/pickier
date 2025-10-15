import type { LintIssue, RuleModule } from '../../types'

/**
 * MD049 - Emphasis style
 */
export const emphasisStyleRule: RuleModule = {
  meta: {
    docs: 'Emphasis style should be consistent (asterisk or underscore)',
  },
  check: (text, ctx) => {
    const issues: LintIssue[] = []
    const lines = text.split(/\r?\n/)

    const options = (ctx.options as { style?: 'asterisk' | 'underscore' | 'consistent' }) || {}
    const style = options.style || 'consistent'

    let detectedStyle: 'asterisk' | 'underscore' | null = null

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Find single asterisk emphasis (not double **)
      const asteriskMatches = line.matchAll(/(?<!\*)\*(?!\*)([^*]+?)\*(?!\*)/g)

      for (const match of asteriskMatches) {
        if (style === 'underscore') {
          issues.push({
            filePath: ctx.filePath,
            line: i + 1,
            column: match.index! + 1,
            ruleId: 'markdown/emphasis-style',
            message: 'Expected underscore (_) for emphasis',
            severity: 'error',
          })
        } else if (style === 'consistent') {
          if (detectedStyle === null) {
            detectedStyle = 'asterisk'
          } else if (detectedStyle === 'underscore') {
            issues.push({
              filePath: ctx.filePath,
              line: i + 1,
              column: match.index! + 1,
              ruleId: 'markdown/emphasis-style',
              message: 'Emphasis style should be consistent throughout document',
              severity: 'error',
            })
          }
        }
      }

      // Find single underscore emphasis (not double __)
      const underscoreMatches = line.matchAll(/(?<!_)_(?!_)([^_]+?)_(?!_)/g)

      for (const match of underscoreMatches) {
        if (style === 'asterisk') {
          issues.push({
            filePath: ctx.filePath,
            line: i + 1,
            column: match.index! + 1,
            ruleId: 'markdown/emphasis-style',
            message: 'Expected asterisk (*) for emphasis',
            severity: 'error',
          })
        } else if (style === 'consistent') {
          if (detectedStyle === null) {
            detectedStyle = 'underscore'
          } else if (detectedStyle === 'asterisk') {
            issues.push({
              filePath: ctx.filePath,
              line: i + 1,
              column: match.index! + 1,
              ruleId: 'markdown/emphasis-style',
              message: 'Emphasis style should be consistent throughout document',
              severity: 'error',
            })
          }
        }
      }
    }

    return issues
  },
}
