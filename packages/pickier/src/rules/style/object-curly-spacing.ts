import type { LintIssue, RuleContext, RuleModule } from '../../types'

function isInStringOrComment(line: string, index: number): boolean {
  const before = line.slice(0, index)
  if (before.includes('//'))
    return true
  const singles = (before.match(/'/g) || []).length
  const doubles = (before.match(/"/g) || []).length
  const backticks = (before.match(/`/g) || []).length
  return singles % 2 === 1 || doubles % 2 === 1 || backticks % 2 === 1
}

export const objectCurlySpacingRule: RuleModule = {
  meta: {
    docs: 'Require spaces inside curly braces in objects and destructuring',
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

      // Find { followed by non-space (but not empty braces {})
      for (let j = 0; j < line.length; j++) {
        if (line[j] === '{' && !isInStringOrComment(line, j)) {
          const next = line[j + 1]
          // Skip empty braces, template literals ${}, and end of line
          if (next === '}' || next === undefined || next === '\n')
            continue
          // Skip template literal interpolation
          if (j > 0 && line[j - 1] === '$')
            continue

          if (next !== ' ' && next !== '\t') {
            issues.push({
              filePath: context.filePath,
              line: i + 1,
              column: j + 2,
              ruleId: 'style/object-curly-spacing',
              message: 'Missing space after \'{\'',
              severity: 'warning',
            })
          }
        }

        if (line[j] === '}' && !isInStringOrComment(line, j)) {
          const prev = j > 0 ? line[j - 1] : undefined
          // Skip empty braces and start of line
          if (prev === '{' || prev === undefined || prev === '\n')
            continue
          // Skip template literal interpolation (already closed)
          if (j + 1 < line.length && line.slice(j + 1).match(/^[^}]*\$\{/))
            continue

          if (prev !== ' ' && prev !== '\t') {
            issues.push({
              filePath: context.filePath,
              line: i + 1,
              column: j + 1,
              ruleId: 'style/object-curly-spacing',
              message: 'Missing space before \'}\'',
              severity: 'warning',
            })
          }
        }
      }
    }

    return issues
  },
  fix(content: string): string {
    const lines = content.split(/\r?\n/)
    const result: string[] = []

    for (const line of lines) {
      let fixed = line
      // Add space after { (not for empty braces, not for template literals ${)
      fixed = fixed.replace(/(?<!\$)\{(\S)/g, (m, after) => {
        if (after === '}')
          return m
        return `{ ${after}`
      })
      // Add space before } (not for empty braces)
      fixed = fixed.replace(/(\S)\}/g, (m, before) => {
        if (before === '{' || before === '$')
          return m
        return `${before} }`
      })
      result.push(fixed)
    }

    return result.join('\n')
  },
}
