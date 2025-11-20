import type { RuleModule } from '../../types'

export const noDuplicateImportsRule: RuleModule = {
  meta: {
    docs: 'Disallow duplicate module imports - all imports from the same module should be combined',
  },
  check: (text, ctx) => {
    const issues: ReturnType<RuleModule['check']> = []
    const lines = text.split(/\r?\n/)

    // Track imports: Map<modulePath, lineNumbers[]>
    const importMap = new Map<string, number[]>()
    let inBlockComment = false

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i]

      // Handle block comments
      if (inBlockComment) {
        const endIdx = line.indexOf('*/')
        if (endIdx >= 0) {
          line = line.slice(endIdx + 2)
          inBlockComment = false
        }
        else {
          continue
        }
      }

      const blockStart = line.indexOf('/*')
      const lineComment = line.indexOf('//')

      if (blockStart >= 0 && (lineComment === -1 || blockStart < lineComment)) {
        const endIdx = line.indexOf('*/', blockStart + 2)
        if (endIdx >= 0) {
          line = line.slice(0, blockStart) + line.slice(endIdx + 2)
        }
        else {
          inBlockComment = true
          line = line.slice(0, blockStart)
        }
      }

      if (lineComment >= 0) {
        line = line.slice(0, lineComment)
      }

      const trimmed = line.trim()
      if (!trimmed)
        continue

      // Match import statements: import ... from 'module'
      // Handles: import foo from 'bar'
      //          import { a, b } from 'bar'
      //          import * as foo from 'bar'
      //          import type { Foo } from 'bar'
      const importMatch = trimmed.match(/^import\s+(?:type\s+)?(?:\{[^}]*\}|[\w$]+(?:\s*,\s*\{[^}]*\})?|\*\s+as\s+[\w$]+)\s+from\s+(['"`])(.+?)\1/)

      if (importMatch) {
        const modulePath = importMatch[2]

        if (importMap.has(modulePath)) {
          // Found a duplicate import
          const previousLines = importMap.get(modulePath)!
          issues.push({
            filePath: ctx.filePath,
            line: i + 1,
            column: 1,
            ruleId: 'no-duplicate-imports',
            message: `'${modulePath}' imported multiple times (also imported on line${previousLines.length > 1 ? 's' : ''} ${previousLines.join(', ')})`,
            severity: 'error',
            help: `Combine all imports from '${modulePath}' into a single import statement`,
          })
          previousLines.push(i + 1)
        }
        else {
          importMap.set(modulePath, [i + 1])
        }
      }

      // Also check for export ... from statements
      const exportMatch = trimmed.match(/^export\s+(?:type\s+)?(?:\{[^}]*\}|\*(?:\s+as\s+[\w$]+)?)\s+from\s+(['"`])(.+?)\1/)

      if (exportMatch) {
        const modulePath = exportMatch[2]
        const key = `export:${modulePath}`

        if (importMap.has(key)) {
          const previousLines = importMap.get(key)!
          issues.push({
            filePath: ctx.filePath,
            line: i + 1,
            column: 1,
            ruleId: 'no-duplicate-imports',
            message: `'${modulePath}' re-exported multiple times (also exported on line${previousLines.length > 1 ? 's' : ''} ${previousLines.join(', ')})`,
            severity: 'error',
            help: `Combine all re-exports from '${modulePath}' into a single export statement`,
          })
          previousLines.push(i + 1)
        }
        else {
          importMap.set(key, [i + 1])
        }
      }
    }

    return issues
  },
}
