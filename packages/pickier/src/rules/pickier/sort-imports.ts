import type { RuleModule } from '../../types'
import { formatImports } from '../../format'

export const sortImportsRule: RuleModule = {
  meta: { docs: 'Enforce sorted imports (delegates to formatter check only)' },
  check: (text, ctx) => {
    const lines = text.split(/\r?\n/)
    let idx = 0
    while (idx < lines.length && (/^\s*$/.test(lines[idx]) || /^\s*\/.\/.*/.test(lines[idx]) || /^\s*\/.\*/.test(lines[idx]))) idx++
    const start = idx
    const imports: string[] = []
    while (idx < lines.length && /^\s*import\b/.test(lines[idx])) { imports.push(lines[idx].trim()); idx++ }
    if (imports.length === 0)
      return []
    const block = imports.join('\n')
    const rest = lines.slice(idx).join('\n')
    const reconstructed = `${block}\n${rest}`
    const formatted = formatImports(reconstructed)
    if (formatted !== reconstructed) {
      return [{ filePath: ctx.filePath, line: start + 1, column: 1, ruleId: 'sort-imports', message: 'Imports are not sorted/grouped consistently', severity: 'warning' }]
    }
    return []
  },
  fix: (text) => formatImports(text),
}
