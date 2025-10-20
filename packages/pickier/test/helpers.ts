import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/**
 * Create a temporary directory for testing
 * @param prefix - Prefix for the temp directory name
 * @returns Path to the temporary directory
 */
export function createTempDir(prefix = 'pickier-test-'): string {
  return mkdtempSync(join(tmpdir(), prefix))
}

/**
 * Common test helpers for format tests
 */
export const formatHelpers = {
  createTempDir: (prefix = 'pickier-format-'): string => createTempDir(prefix),
}

/**
 * Common test helpers for lint tests
 */
export const lintHelpers = {
  createTempDir: (prefix = 'pickier-lint-'): string => createTempDir(prefix),
}

/**
 * Common test helpers for rule tests
 */
export const ruleHelpers = {
  createTempDir: (prefix = 'pickier-rule-'): string => createTempDir(prefix),
}

/**
 * Common test helpers for plugin tests
 */
export const pluginHelpers = {
  createTempDir: (prefix = 'pickier-plugin-'): string => createTempDir(prefix),
}
