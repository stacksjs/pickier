import type { LintIssue, RuleContext, RuleModule } from '../../types'
import { extractIntegrityType, isLockfileContent, parseLockfile } from './parser'

/**
 * Validate that all packages use strong integrity hashes (SHA512).
 * Weak hash algorithms like SHA1 and SHA256 are more susceptible to
 * collision attacks, potentially allowing attackers to substitute
 * malicious packages that match the same hash.
 *
 * Options:
 * - requiredAlgorithm: The minimum required hash algorithm (default: 'sha512')
 * - exclude: Array of package names to exclude from validation
 *
 * Example config:
 * ```ts
 * pluginRules: {
 *   'lockfile/validate-integrity': ['error', { requiredAlgorithm: 'sha512', exclude: [] }]
 * }
 * ```
 */
export const validateIntegrity: RuleModule = {
  meta: {
    docs: 'Ensure all packages use strong integrity hashes (SHA512)',
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
      requiredAlgorithm?: string
      exclude?: string[]
    }
    const requiredAlgorithm = options.requiredAlgorithm || 'sha512'
    const excludePackages = new Set(options.exclude || [])

    // Hash strength hierarchy (higher index = stronger)
    const hashStrength: Record<string, number> = {
      sha1: 1,
      sha256: 2,
      sha384: 3,
      sha512: 4,
    }

    const requiredStrength = hashStrength[requiredAlgorithm] || 4

    // Track line numbers for error reporting
    const lines = content.split('\n')

    for (const [key, pkg] of lockfile.packages) {
      // Skip excluded packages
      if (excludePackages.has(pkg.name)) {
        continue
      }

      if (!pkg.integrity) {
        // Missing integrity is handled by validate-https (packages should have integrity)
        continue
      }

      const hashType = extractIntegrityType(pkg.integrity)
      if (!hashType) {
        continue
      }

      const currentStrength = hashStrength[hashType.toLowerCase()] || 0

      if (currentStrength < requiredStrength) {
        const lineNumber = findLineNumber(lines, key)

        issues.push({
          filePath: context.filePath,
          line: lineNumber,
          column: 1,
          ruleId: 'lockfile/validate-integrity',
          message: `Package "${pkg.name}" uses weak hash algorithm: "${hashType}" (required: ${requiredAlgorithm})`,
          severity: 'error',
          help: `Weak hash algorithms are susceptible to collision attacks. Upgrade to ${requiredAlgorithm} by regenerating your lockfile with a recent package manager.`,
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
