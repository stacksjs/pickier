import type { RuleModule } from '../../types'

// Heuristic version of `indent-unindent` targeting tagged template literals used as unindent helpers.
// Detects tags: $, unindent, unIndent. If found, ensure the template content is on its own lines and
// each inner line is indented one level beyond the tag line's indentation.

const DEFAULT_TAGS = ['$', 'unindent', 'unIndent']

export const indentUnindentRule: RuleModule = {
  meta: { docs: 'Enforce consistent indentation inside unindent-style tagged templates' },
  check: (text, ctx) => {
    const issues: ReturnType<RuleModule['check']> = []

    const lines = text.split(/\r?\n/)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineIndent = (line.match(/^\s*/)?.[0]) ?? ''
      // Find any occurrence of <tag>` starting anywhere in the line
      const re = /([$A-Z_][\w$]*)\s*`/gi
      let m: RegExpExecArray | null
      while ((m = re.exec(line))) {
        const tag = m[1]
        if (!DEFAULT_TAGS.includes(tag))
          continue
        // If closing backtick is on same line after this position, treat as single-line and skip
        const after = line.slice(m.index + m[0].length)
        if (after.includes('`'))
          continue

        // Find closing backtick line
        let endLine = -1
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].includes('`')) { endLine = j; break }
        }
        if (endLine < 0)
          continue

        const targetIndent = `${lineIndent}  ` // 2 spaces beyond line indent
        for (let j = i + 1; j < endLine; j++) {
          const inner = lines[j]
          if (inner.trim() === '')
            continue
          const actualIndent = inner.match(/^\s*/)?.[0] ?? ''
          if (!actualIndent.startsWith(targetIndent)) {
            issues.push({ filePath: ctx.filePath, line: j + 1, column: (actualIndent.length || 0) + 1, ruleId: 'style/indent-unindent', message: 'Consistent indentation in unindent tag', severity: 'warning' })
            break
          }
        }
        // continue scanning current line for other tags if any
      }
    }

    return issues
  },
}
