import type { RuleModule } from '../../types'

export const noTsExportEqualRule: RuleModule = {
  meta: { docs: 'Disallow `exports =` in TypeScript; prefer ESM export default' },
  check: (text, ctx) => {
    const issues: ReturnType<RuleModule['check']> = []
    const ext = ctx.filePath.split('.').pop() || ''
    if (!['ts', 'tsx', 'mts', 'cts', 'd.ts'].includes(ext))
      return issues

    const lines = text.split(/\r?\n/)
    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i]
      const line = raw.replace(/\/\*.*?\*\//g, '').replace(/\/\/.*$/, '')
      const m = line.match(/\bexports\s*=\s*/)
      if (m) {
        issues.push({ filePath: ctx.filePath, line: i + 1, column: (m.index || 0) + 1, ruleId: 'ts/no-ts-export-equal', message: 'Use ESM `export default` instead of `exports =`', severity: 'error' })
      }
    }

    return issues
  },
}
