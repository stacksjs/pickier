import type { RuleModule } from '../../types'

export const noRequireImportsRule: RuleModule = {
  meta: { docs: 'Disallow require() in TypeScript files; prefer ESM imports' },
  check: (text, ctx) => {
    const issues: ReturnType<RuleModule['check']> = []
    if (!/\.ts$/.test(ctx.filePath)) return issues
    const lines = text.split(/\r?\n/)
    let inBlockComment = false
    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i]
      let line = raw
      if (inBlockComment) {
        const endIdx = line.indexOf('*/')
        if (endIdx >= 0) { line = line.slice(endIdx + 2); inBlockComment = false }
        else { continue }
      }
      const blockStart = line.indexOf('/*')
      const lineComment = line.indexOf('//')
      if (blockStart >= 0 && (lineComment === -1 || blockStart < lineComment)) {
        const endIdx = line.indexOf('*/', blockStart + 2)
        if (endIdx >= 0) { line = line.slice(0, blockStart) + line.slice(endIdx + 2) }
        else { inBlockComment = true; line = line.slice(0, blockStart) }
      }
      if (lineComment >= 0) line = line.slice(0, lineComment)
      const trimmed = line.trim()
      if (!trimmed) continue
      if (/\bimport\s*\(/.test(trimmed)) continue
      const idx = trimmed.indexOf('require(')
      if (idx >= 0) {
        issues.push({ filePath: ctx.filePath, line: i + 1, column: raw.indexOf('require(') + 1 || idx + 1, ruleId: 'ts/no-require-imports', message: 'Do not use require() in TypeScript files. Use ESM import syntax instead.', severity: 'error' })
        continue
      }
      if (/^import\s+(?:\S.*|[\t\v\f \xA0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF])=\s*require\s*\(/.test(trimmed)) {
        const col = raw.indexOf('require(')
        issues.push({ filePath: ctx.filePath, line: i + 1, column: col > -1 ? col + 1 : 1, ruleId: 'ts/no-require-imports', message: 'Do not use require() in TypeScript files. Use ESM import syntax instead.', severity: 'error' })
      }
    }
    return issues
  },
}
