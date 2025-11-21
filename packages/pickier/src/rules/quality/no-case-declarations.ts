import type { RuleModule } from '../../types'

export const noCaseDeclarationsRule: RuleModule = {
  meta: {
    docs: 'Disallow lexical declarations in case clauses',
    recommended: true,
  },
  check: (text, ctx) => {
    const issues: ReturnType<RuleModule['check']> = []
    const lines = text.split(/\r?\n/)

    let inCase = false
    let justEnteredCase = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Check for case clause
      if (line.match(/\bcase\s+(?:\S.*)?:|default\s*:/)) {
        inCase = true
        justEnteredCase = true
      }
      else {
        justEnteredCase = false
      }

      // If in case and we see a break or another case (but not the current one), reset
      if (inCase && !justEnteredCase && (line.match(/\bbreak\b/) || line.match(/\bcase\s+(?:\S.*)?:/))) {
        inCase = false
      }

      if (inCase && !justEnteredCase) {
        // Check for lexical declarations (let, const, function, class)
        const declarationMatch = line.match(/\b(let|const|function|class)\s+/)

        if (declarationMatch) {
          issues.push({
            filePath: ctx.filePath,
            line: i + 1,
            column: 1,
            ruleId: 'eslint/no-case-declarations',
            message: 'Unexpected lexical declaration in case block',
            severity: 'error',
          })
        }
      }
    }

    return issues
  },
}
