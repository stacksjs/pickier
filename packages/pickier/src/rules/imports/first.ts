import type { RuleModule } from '../../types'

export const firstRule: RuleModule = {
  meta: {
    docs: 'Ensure all imports appear before other statements',
    recommended: false,
  },
  check: (text, ctx) => {
    const issues: ReturnType<RuleModule['check']> = []
    const lines = text.split(/\r?\n/)

    let seenNonImport = false
    let nonImportLine = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Skip empty lines and comments
      if (!line || line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) {
        continue
      }

      // Check if this is an import
      const isImport = line.match(/^\s*import\s+/)

      if (!isImport && line.length > 0) {
        seenNonImport = true
        if (nonImportLine === 0) {
          nonImportLine = i + 1
        }
      }

      // If we've seen a non-import and now see an import, that's an error
      if (seenNonImport && isImport) {
        issues.push({
          filePath: ctx.filePath,
          line: i + 1,
          column: 1,
          ruleId: 'import/first',
          message: 'Import statement must appear before other statements',
          severity: 'error',
        })
      }
    }

    return issues
  },
}
