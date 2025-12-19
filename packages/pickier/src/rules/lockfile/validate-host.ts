import type { LintIssue, RuleContext, RuleModule } from '../../types'
import {
  expandHostAliases,
  extractHost,
  isLockfileContent,
  parseLockfile,
  REGISTRY_ALIASES,
} from './parser'

/**
 * Validate that all packages in a lockfile are from allowed hosts.
 * Prevents supply chain attacks where an attacker modifies the lockfile
 * to point packages to malicious registries.
 *
 * Options:
 * - allowedHosts: Array of allowed hostnames or aliases ('npm', 'yarn', 'verdaccio')
 * - emptyHostname: Whether to allow packages with empty/missing resolved URLs (default: true)
 *
 * Example config:
 * ```ts
 * pluginRules: {
 *   'lockfile/validate-host': ['error', { allowedHosts: ['npm', 'yarn'] }]
 * }
 * ```
 */
export const validateHost: RuleModule = {
  meta: {
    docs: 'Ensure all packages are from allowed registry hosts',
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
      allowedHosts?: string[]
      emptyHostname?: boolean
    }

    // Default allowed hosts if not specified
    const allowedHostsRaw = options.allowedHosts || ['npm', 'yarn']
    const allowEmptyHostname = options.emptyHostname !== false

    // Expand aliases to actual hostnames
    const allowedHosts = expandHostAliases(allowedHostsRaw)

    // Track line numbers for error reporting
    const lines = content.split('\n')

    for (const [key, pkg] of lockfile.packages) {
      if (!pkg.resolved) {
        if (!allowEmptyHostname) {
          const lineNumber = findLineNumber(lines, key)
          issues.push({
            filePath: context.filePath,
            line: lineNumber,
            column: 1,
            ruleId: 'lockfile/validate-host',
            message: `Package "${pkg.name}" has no resolved URL`,
            severity: 'error',
            help: 'All packages should have a resolved URL from an allowed registry.',
          })
        }
        continue
      }

      const host = extractHost(pkg.resolved)
      if (!host) {
        continue // Skip malformed URLs silently
      }

      if (!allowedHosts.includes(host)) {
        const lineNumber = findLineNumber(lines, key)
        const expectedHosts = allowedHostsRaw.map(h => REGISTRY_ALIASES[h.toLowerCase()] || h).join(', ')

        issues.push({
          filePath: context.filePath,
          line: lineNumber,
          column: 1,
          ruleId: 'lockfile/validate-host',
          message: `Invalid host for package "${pkg.name}": expected one of [${expectedHosts}], got "${host}"`,
          severity: 'error',
          help: `Package is resolving from an unauthorized registry. This could indicate a supply chain attack. Allowed hosts: ${expectedHosts}`,
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
