import type { PickierOptions } from 'pickier'

// Pickier configuration (local project)
// You can customize lint/format behavior and rule severities here.
// All fields are optional; defaults are shown below.

const config: PickierOptions = {
  // Increase verbosity of CLI outputs (shows detailed error context)
  verbose: true,

  // Glob patterns to ignore
  ignores: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/test/fixtures/**',
    '**/test/output/**',
    '**/*.test.ts', // Ignore test files - they contain intentional examples of problematic code
    '**/*.spec.ts',
    'docs/**',
    'packages/vscode/examples/**',
  ],

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
    extensions: ['ts', 'js', 'html', 'css', 'json', 'jsonc', 'md', 'yaml', 'yml', 'stx'],
    // Remove trailing whitespace
    trimTrailingWhitespace: true,
    // Keep at most this many consecutive blank lines
    maxConsecutiveBlankLines: 1,
    // Final newline policy: 'one' | 'two' | 'none'
    finalNewline: 'one',
    indent: 2,
    quotes: 'single',
    semi: false,
  },

  // Rule severities
  rules: {
    noDebugger: 'error', // remove debugger statements
    noConsole: 'warn', // warn on console usage
    noTemplateCurlyInString: 'error', // catch ${} in regular strings
    noCondAssign: 'error', // no assignments in conditionals
  },

  // Plugin rules (advanced linting)
  pluginRules: {
    'ts/prefer-const': 'warn', // prefer const over let
    'style/curly': 'off', // disabled by default, can be enabled per project
    'style/if-newline': 'off', // disabled by default, can be enabled per project
    'pickier/no-unused-vars': 'error', // catch unused imports/vars
    'pickier/sort-imports': 'off', // too noisy, especially in test files
    'pickier/sort-named-imports': 'off', // too noisy, especially in test files
    'pickier/sort-objects': 'off', // too noisy, especially in test files
    'pickier/sort-exports': 'warn', // sort exports
    'pickier/import-dedupe': 'warn', // dedupe imports
    'pickier/no-import-node-modules-by-path': 'error',
    'pickier/no-import-dist': 'error',
    'ts/no-top-level-await': 'error',
  },
}

export default config
