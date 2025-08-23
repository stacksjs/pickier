import type { RuleModule } from '../../types'

export const ifNewlineRule: RuleModule = {
  meta: { docs: 'Enforce newline after if when without braces' },
  check: (text, ctx) => {
    const issues: ReturnType<RuleModule['check']> = []
    const lines = text.split(/\r?\n/)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      // match: if (<cond>) <stmt>  (no opening brace on same line)
      const m = line.match(/^\s*if\s*\([^)]*\)\s*([^\s{/].*)$/)
      if (!m)
        continue
      // If consequent starts on same line and it's not a block, require newline
      issues.push({
        filePath: ctx.filePath,
        line: i + 1,
        column: Math.max(1, line.indexOf('if') + 1),
        ruleId: 'style/if-newline',
        message: 'Expect newline after if',
        severity: 'warning',
      })
    }

    return issues
  },
}
