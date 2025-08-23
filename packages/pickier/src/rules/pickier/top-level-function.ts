import type { RuleModule } from '../../types'

// Heuristic version of `top-level-function`:
// Top-level functions should be declared with `function` keyword instead of
// `const foo = () => {}` or `const foo = function() {}` at top level.
// We detect zero-indentation `const <id> = <fn>` patterns and report.

export const topLevelFunctionRule: RuleModule = {
  meta: { docs: 'Enforce top-level functions to use function declarations' },
  check: (text, ctx) => {
    const issues: ReturnType<RuleModule['check']> = []

    const lines = text.split(/\r?\n/)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      // Skip indented lines and comments
      if (/^\s+/.test(line)) continue
      if (/^\s*(\/\/|\/\*)/.test(line)) continue

      // Match: const name = (...)
      const m = line.match(/^const\s+([A-Za-z_$][\w$]*)\s*=\s*(.*)$/)
      if (!m) continue
      const rhs = m[2]
      // detect arrow fn or function expression on same line
      if (/^\(?[A-Za-z_$,\s\n]*\)?\s*=>/.test(rhs) || /^function\b/.test(rhs)) {
        const col = line.indexOf('const') + 1
        issues.push({
          filePath: ctx.filePath,
          line: i + 1,
          column: col,
          ruleId: 'pickier/top-level-function',
          message: 'Top-level functions should be declared with function keyword',
          severity: 'warning',
        })
        continue
      }

      // If initializer spills to next lines, peek ahead a couple lines
      if (rhs.trim().length === 0 || /[,({]$/.test(rhs.trim())) {
        const next = lines[i + 1] || ''
        if (/^\s*(\(?[A-Za-z_$,\s]*\)?\s*=>|function\b)/.test(next)) {
          const col = line.indexOf('const') + 1
          issues.push({
            filePath: ctx.filePath,
            line: i + 1,
            column: col,
            ruleId: 'pickier/top-level-function',
            message: 'Top-level functions should be declared with function keyword',
            severity: 'warning',
          })
        }
      }
    }

    return issues
  },
}
