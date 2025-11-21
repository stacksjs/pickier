import type { LintIssue, RuleModule } from '../../types'

/**
 * MD050 - Strong style
 */
export const strongStyleRule: RuleModule = {
  meta: {
    docs: 'Strong style should be consistent (asterisk or underscore)',
  },
  check: (text, ctx) => {
    const issues: LintIssue[] = []
    const lines = text.split(/\r?\n/)

    const options = (ctx.options as { style?: 'asterisk' | 'underscore' | 'consistent' }) || {}
    const style = options.style || 'consistent'

    let detectedStyle: 'asterisk' | 'underscore' | null = null

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Find double asterisk strong
      const asteriskMatches = line.matchAll(/\*\*([^*]+)\*\*/g)

      for (const match of asteriskMatches) {
        if (style === 'underscore') {
          issues.push({
            filePath: ctx.filePath,
            line: i + 1,
            column: match.index! + 1,
            ruleId: 'markdown/strong-style',
            message: 'Expected underscore (__) for strong',
            severity: 'error',
          })
        }
        else if (style === 'consistent') {
          if (detectedStyle === null) {
            detectedStyle = 'asterisk'
          }
          else if (detectedStyle === 'underscore') {
            issues.push({
              filePath: ctx.filePath,
              line: i + 1,
              column: match.index! + 1,
              ruleId: 'markdown/strong-style',
              message: 'Strong style should be consistent throughout document',
              severity: 'error',
            })
          }
        }
      }

      // Find double underscore strong
      const underscoreMatches = line.matchAll(/__([^_]+)__/g)

      for (const match of underscoreMatches) {
        if (style === 'asterisk') {
          issues.push({
            filePath: ctx.filePath,
            line: i + 1,
            column: match.index! + 1,
            ruleId: 'markdown/strong-style',
            message: 'Expected asterisk (**) for strong',
            severity: 'error',
          })
        }
        else if (style === 'consistent') {
          if (detectedStyle === null) {
            detectedStyle = 'underscore'
          }
          else if (detectedStyle === 'asterisk') {
            issues.push({
              filePath: ctx.filePath,
              line: i + 1,
              column: match.index! + 1,
              ruleId: 'markdown/strong-style',
              message: 'Strong style should be consistent throughout document',
              severity: 'error',
            })
          }
        }
      }
    }

    return issues
  },
  fix: (text, ctx) => {
    const options = (ctx.options as { style?: 'asterisk' | 'underscore' | 'consistent' }) || {}
    const style = options.style || 'consistent'

    // Determine target style
    let targetStyle: 'asterisk' | 'underscore' = 'asterisk'
    if (style === 'asterisk') {
      targetStyle = 'asterisk'
    }
    else if (style === 'underscore') {
      targetStyle = 'underscore'
    }
    else if (style === 'consistent') {
      // Find first strong marker
      const asteriskMatch = text.match(/\*\*([^*]+)\*\*/)
      const underscoreMatch = text.match(/__([^_]+)__/)

      if (asteriskMatch && (!underscoreMatch || asteriskMatch.index! < underscoreMatch.index!)) {
        targetStyle = 'asterisk'
      }
      else if (underscoreMatch) {
        targetStyle = 'underscore'
      }
    }

    let fixed = text
    if (targetStyle === 'asterisk') {
      // Convert underscores to asterisks
      fixed = fixed.replace(/__([^_]+)__/g, '**$1**')
    }
    else {
      // Convert asterisks to underscores
      fixed = fixed.replace(/\*\*([^*]+)\*\*/g, '__$1__')
    }

    return fixed
  },
}
