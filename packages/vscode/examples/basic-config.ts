/**
 * Basic Pickier Configuration Example
 *
 * This is a minimal configuration that sets up essential formatting and linting rules.
 * Save this as `pickier.config.ts` in your project root.
 */

import type { PickierConfig } from 'pickier'

const config: PickierConfig = {
  verbose: false,
  ignores: ['**/node_modules/**', '**/dist/**', '**/build/**'],

  lint: {
    extensions: ['ts', 'js', 'json', 'html', 'css', 'md', 'yaml'],
    reporter: 'stylish',
    cache: false,
    maxWarnings: -1,
  },

  format: {
    extensions: ['ts', 'js', 'json', 'html', 'css', 'md', 'yaml'],
    trimTrailingWhitespace: true,
    maxConsecutiveBlankLines: 1,
    finalNewline: 'one',
    indent: 2,
    indentStyle: 'spaces',
    quotes: 'single',
    semi: false,
  },

  rules: {
    noDebugger: 'error',
    noConsole: 'warn',
  },
}

export default config
