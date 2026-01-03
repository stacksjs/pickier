import type { LintIssue, RuleContext, RuleModule } from '../../types'
import { extractScheme, isLockfileContent, parseLockfile } from './parser'

/**
 * Validate that all packages use allowed URL schemes/protocols.
 * Prevents attacks using unexpected schemes like file://, data://,
 * git+http://, or other protocols that might bypass security policies.
 *
 * Options:
 * - allowedSchemes: Array of allowed URL schemes (default: ['https:', 'git+https:', 'git+ssh:'])
 *
 * Example config:
 * ```ts
 * pluginRules: {
 *   'lockfile/validate-scheme': ['error', { allowedSchemes: ['https:', 'git+ssh:'] }]
 * }
 * ```
 */
export const validateScheme: RuleModule = {
  meta: {
    docs: 'Ensure all packages use allowed URL schemes',
    recommended: true,
  },

  check(content: string, context: RuleContext): LintIssue[] {
    const issues: LintIssue[] = []

    // Only process lockfiles
    if (!isLockfileContent(content, context.filePath)) {
      return issues
    }

    const lockfile = parseLockfile(content, context.filePath)
    if (!lockfile) {
      return issues
    }

    // Get options
    const options = (context.options || {}) as {
      allowedSchemes?: string[]
    }

    // Default allowed schemes
    const allowedSchemes = options.allowedSchemes || ['https:', 'git+https:', 'git+ssh:']

    // Normalize schemes (ensure they end with colon)
    const normalizedSchemes = allowedSchemes.map(s => s.endsWith(':') ? s : `${s}:`)

    // Track line numbers for error reporting
    const lines = content.split('\n')

    for (const [key, pkg] of lockfile.packages) {
      if (!pkg.resolved) {
        continue
      }

      const scheme = extractScheme(pkg.resolved)
      if (!scheme) {
        continue // Skip malformed URLs silently
      }

      if (!normalizedSchemes.includes(scheme)) {
        const lineNumber = findLineNumber(lines, key)

        issues.push({
          filePath: context.filePath,
          line: lineNumber,
          column: 1,
          ruleId: 'lockfile/validate-scheme',
          message: `Package "${pkg.name}" uses disallowed URL scheme: "${scheme}"`,
          severity: 'error',
          help: `Only the following URL schemes are allowed: ${normalizedSchemes.join(', ')}. Using "${scheme}" could be a security risk.`,
        })
      }
    }

    return issues
  },
}

/**
 * Find the line number where a package key appears in the lockfile
 */
function findLineNumber(lines: string[], key: string): number {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(key) || lines[i].includes(`"${key}"`)) {
      return i + 1
    }
  }
  return 1
}
