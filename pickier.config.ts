// Pickier configuration (local project)
// You can customize lint/format behavior and rule severities here.
// All fields are optional; defaults are shown below.

import type { PickierConfig } from './packages/pickier/src/types'

const config: PickierConfig = {
  // Increase verbosity of CLI outputs
  verbose: false,

  // Glob patterns to ignore
  ignores: ['**/node_modules/**', '**/dist/**', '**/build/**'],

  // Lint-specific options
  lint: {
    // File extensions to lint
    extensions: ['ts', 'js', 'html', 'css', 'json', 'jsonc', 'md', 'yaml', 'yml', 'stx'],
    // Output format: 'stylish' | 'json' | 'compact'
    reporter: 'stylish',
    // Enable caching (not yet used, reserved)
    cache: false,
    // Fail if warnings exceed this number; -1 disables
    maxWarnings: -1,
  },

  // Format-specific options
  format: {
    // File extensions to format
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.yaml', '.yml'],
    // Remove trailing whitespace
    trimTrailingWhitespace: true,
    // Keep at most this many consecutive blank lines
    maxConsecutiveBlankLines: 1,
    // Final newline policy: 'one' | 'two' | 'none'
    finalNewline: 'one',
  },

  // Rule severities
  rules: {
    noDebugger: 'error', // remove debugger statements
    noConsole: 'warn', // warn on console usage
  },
}

export default config

// Just to make sure the config is valid
