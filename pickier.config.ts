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
    '**/*.bench.ts', // Ignore benchmark files to match ESLint preset behavior
    '**/*.config.ts', // Ignore config files to match ESLint preset behavior
    '**/docs/**',
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
    noConsole: 'warn', // warn on console usage (tests expect warnings, not errors)
    noTemplateCurlyInString: 'error', // catch ${} in regular strings
    noCondAssign: 'error', // no assignments in conditionals
  },

  // Plugin rules (advanced linting)
  pluginRules: {
    'ts/prefer-const': 'error', // prefer const over let
    'style/curly': 'off', // enforce curly braces for all control statements (disabled for tests)
    'style/if-newline': 'off', // enforce newline after if statement (disabled for tests)
    'pickier/no-unused-vars': 'error', // catch unused imports/vars
    'pickier/sort-imports': 'off', // too noisy, especially in test files
    'pickier/sort-named-imports': 'off', // too noisy, especially in test files
    'pickier/sort-objects': 'off', // too noisy, especially in test files
    'pickier/sort-exports': 'error', // sort exports
    'pickier/import-dedupe': 'error', // dedupe imports
    'pickier/no-import-node-modules-by-path': 'error',
    'pickier/no-import-dist': 'error',
    'ts/no-top-level-await': 'error',
    // Rules added to match ESLint detection (antfu rules map to style/ts rules)
    // Note: antfu/curly maps to style/curly, antfu/if-newline maps to style/if-newline,
    // antfu/no-top-level-await maps to ts/no-top-level-await
    'no-new': 'error',
    'no-regex-spaces': 'error',
    'node/prefer-global/buffer': 'error',
    'node/prefer-global/process': 'error',
    'perfectionist/sort-imports': 'error',
    'prefer-template': 'error',
    'regexp/negation': 'error',
    'regexp/no-misleading-capturing-group': 'error',
    'regexp/no-super-linear-backtracking': 'error',
    'regexp/no-unused-capturing-group': 'error',
    'regexp/no-useless-assertions': 'error',
    'regexp/no-useless-lazy': 'error',
    'regexp/no-useless-non-capturing-group': 'error',
    'regexp/optimal-quantifier-concatenation': 'error',
    'regexp/prefer-character-class': 'error',
    'regexp/prefer-w': 'error',
    'regexp/strict': 'error',
    'regexp/use-ignore-case': 'error',
    'style/brace-style': 'error',
    'style/max-statements-per-line': 'error',
    'style/no-multi-spaces': 'error',
    'style/no-multiple-empty-lines': 'error',
    'style/no-trailing-spaces': 'error',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': 'error',
  },
}

export default config
