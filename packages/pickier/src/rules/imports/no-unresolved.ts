import { existsSync } from 'node:fs'
import { dirname, extname, join, resolve } from 'node:path'
import type { RuleModule } from '../../types'

export const noUnresolvedRule: RuleModule = {
  meta: {
    docs: 'Ensure imports point to a file/module that can be resolved',
    recommended: true,
  },
  check: (text, ctx) => {
    const issues: ReturnType<RuleModule['check']> = []
    const lines = text.split(/\r?\n/)

    const currentDir = dirname(ctx.filePath)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Match import statements
      const importMatches = [
        ...line.matchAll(/\bimport\s+.*?\s+from\s+['"]([^'"]+)['"]/g),
        ...line.matchAll(/\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g),
        ...line.matchAll(/\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g),
      ]

      for (const match of importMatches) {
        const importPath = match[1]

        // Skip node built-ins and npm packages (don't start with . or /)
        if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
          continue
        }

        // Try to resolve the path
        const possiblePaths = []
        const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '']

        for (const ext of extensions) {
          const fullPath = resolve(currentDir, importPath + ext)
          possiblePaths.push(fullPath)

          // Also check for index files
          possiblePaths.push(join(fullPath, `index${ext}`))
        }

        // Check if any of the possible paths exist
        const resolved = possiblePaths.some(p => existsSync(p))

        if (!resolved) {
          issues.push({
            filePath: ctx.filePath,
            line: i + 1,
            column: 1,
            ruleId: 'import/no-unresolved',
            message: `Unable to resolve path to module '${importPath}'`,
            severity: 'error',
          })
        }
      }
    }

    return issues
  },
}
