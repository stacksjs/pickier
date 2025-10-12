// Pickier configuration (local project)
// You can customize lint/format behavior and rule severities here.
// All fields are optional; defaults are shown below.

const config = {
  // Increase verbosity of CLI outputs
  verbose: false,

  // Glob patterns to ignore
  ignores: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/test/fixtures/**',
    '**/test/output/**',
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
    'prefer-const': 'warn', // prefer const over let
  },

  // Plugin rules (advanced linting)
  pluginRules: {
    'style/curly': 'warn',
    'style/if-newline': 'warn',
    'pickier/no-unused-vars': 'error', // catch unused imports/vars
    'pickier/sort-imports': 'warn', // sort import statements
    'pickier/sort-named-imports': 'warn', // sort named imports
    'pickier/sort-objects': 'warn', // sort object keys
    'pickier/sort-exports': 'warn', // sort exports
    'pickier/import-dedupe': 'warn', // dedupe imports
    'pickier/no-import-node-modules-by-path': 'error',
    'pickier/no-import-dist': 'error',
    'ts/no-top-level-await': 'error',
  },
}

export default config
