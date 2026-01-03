import type { LintIssue, RuleContext, RuleModule } from '../../types'
import { extractScheme, isLockfileContent, parseLockfile } from './parser'

/**
 * Validate that all packages use HTTPS protocol.
 * Prevents man-in-the-middle attacks where packages could be intercepted
 * and replaced when downloaded over unencrypted HTTP.
 *
 * Example config:
 * ```ts
 * pluginRules: {
 *   'lockfile/validate-https': 'error'
 * }
 * ```
 */
export const validateHttps: RuleModule = {
  meta: {
    docs: 'Ensure all packages use HTTPS protocol',
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

      if (scheme !== 'https:') {
        const lineNumber = findLineNumber(lines, key)

        issues.push({
          filePath: context.filePath,
          line: lineNumber,
          column: 1,
          ruleId: 'lockfile/validate-https',
          message: `Package "${pkg.name}" uses insecure protocol: "${scheme}" instead of "https:"`,
          severity: 'error',
          help: 'All packages should be downloaded over HTTPS to prevent man-in-the-middle attacks.',
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
