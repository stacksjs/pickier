import type { PickierPlugin } from '../types'
import { validateHost } from '../rules/lockfile/validate-host'
import { validateHttps } from '../rules/lockfile/validate-https'
import { validateIntegrity } from '../rules/lockfile/validate-integrity'
import { validatePackageNames } from '../rules/lockfile/validate-package-names'
import { validateScheme } from '../rules/lockfile/validate-scheme'

/**
 * Lockfile security plugin for pickier.
 *
 * Validates lockfiles (package-lock.json, yarn.lock, bun.lock) for security issues
 * that could indicate supply chain attacks.
 *
 * Rules:
 * - validate-host: Ensure packages are from allowed registry hosts
 * - validate-https: Ensure packages use HTTPS protocol
 * - validate-integrity: Ensure packages use strong integrity hashes (SHA512)
 * - validate-package-names: Ensure package names match their resolved URLs
 * - validate-scheme: Ensure packages use allowed URL schemes
 *
 * Attack vectors protected against:
 * 1. Malicious Host Injection - Attacker modifies lockfile to point to malicious registries
 * 2. Package Name Substitution - Lockfile references wrong package name in URL
 * 3. Unencrypted Protocol Usage - Using HTTP instead of HTTPS (MITM attacks)
 * 4. Weak Integrity Hashes - Using SHA1/SHA256 instead of SHA512 (collision attacks)
 * 5. Unauthorized URL Schemes - Using file://, data://, git+http://, etc.
 */
export const lockfilePlugin: PickierPlugin = {
  name: 'lockfile',
  rules: {
    'validate-host': validateHost,
    'validate-https': validateHttps,
    'validate-integrity': validateIntegrity,
    'validate-package-names': validatePackageNames,
    'validate-scheme': validateScheme,
  },
}
