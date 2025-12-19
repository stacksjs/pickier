import type { LintIssue, RuleContext, RuleModule } from '../../types'
import { extractPackageNameFromUrl, isLockfileContent, parseLockfile, REGISTRY_ALIASES } from './parser'

/**
 * Validate that package names in lockfile match the resolved URL.
 * Detects package substitution attacks where an attacker replaces a legitimate
 * package with a malicious one by pointing to a different package in the URL.
 *
 * Example attack:
 * Package key: meow@1.0.0
 * Resolved URL: https://registry.npmjs.org/meowlicious/-/meow-4.0.1.tgz
 * The URL points to a different package (meowlicious) than expected (meow).
 *
 * Options:
 * - aliases: Object mapping package names to allowed URL names
 *   Example: { 'foo': 'foo-package' } allows 'foo' to resolve to 'foo-package'
 *
 * Example config:
 * ```ts
 * pluginRules: {
 *   'lockfile/validate-package-names': ['error', { aliases: {} }]
 * }
 * ```
 */
export const validatePackageNames: RuleModule = {
  meta: {
    docs: 'Ensure package names match their resolved URLs',
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
      aliases?: Record<string, string>
    }
    const aliases = options.aliases || {}

    // Official registries where we validate package names
    const officialRegistries = Object.values(REGISTRY_ALIASES)

    // Track line numbers for error reporting
    const lines = content.split('\n')

    for (const [key, pkg] of lockfile.packages) {
      if (!pkg.resolved) {
        continue
      }

      // Only validate for official registries
      let isOfficialRegistry = false
      try {
        const url = new URL(pkg.resolved)
        isOfficialRegistry = officialRegistries.includes(url.hostname)
      }
      catch {
        continue
      }

      if (!isOfficialRegistry) {
        continue
      }

      const urlPackageName = extractPackageNameFromUrl(pkg.resolved)
      if (!urlPackageName) {
        continue
      }

      // Get the expected package name (from lockfile key or package entry)
      const expectedName = pkg.name

      // Check if there's an alias for this package
      const allowedName = aliases[expectedName] || expectedName

      // Compare names (handle scoped packages)
      if (urlPackageName !== allowedName) {
        const lineNumber = findLineNumber(lines, key)

        issues.push({
          filePath: context.filePath,
          line: lineNumber,
          column: 1,
          ruleId: 'lockfile/validate-package-names',
          message: `Package name mismatch: "${expectedName}" resolves to "${urlPackageName}"`,
          severity: 'error',
          help: `This could indicate a package substitution attack. The lockfile entry is for "${expectedName}" but the resolved URL points to "${urlPackageName}".`,
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
