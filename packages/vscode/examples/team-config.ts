/**
 * Team/Enterprise Pickier Configuration Example
 *
 * This configuration is designed for team environments with:
 * - Consistent formatting across team members
 * - Strict linting rules for code quality
 * - Performance optimizations for large codebases
 * - Integration with CI/CD pipelines
 */

import type { PickierConfig } from 'pickier'

const config: PickierConfig = {
  verbose: false, // Keep quiet in CI environments

  // Comprehensive ignore patterns for enterprise projects
  ignores: [
    // Dependencies
    '**/node_modules/**',
    '**/vendor/**',

    // Build outputs
    '**/dist/**',
    '**/build/**',
    '**/out/**',
    '**/.next/**',
    '**/.nuxt/**',
    '**/public/build/**',

    // Test artifacts
    '**/coverage/**',
    '**/.nyc_output/**',
    '**/test-results/**',

    // IDE and OS files
    '**/.vscode/**',
    '**/.idea/**',
    '**/Thumbs.db',
    '**/.DS_Store',

    // Generated files
    '**/*.generated.ts',
    '**/*.d.ts',
    '**/schema.prisma',

    // Legacy code (if applicable)
    '**/legacy/**',
    '**/deprecated/**',
  ],

  lint: {
    extensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'jsonc', 'html', 'css', 'scss', 'md', 'yaml', 'yml'],
    reporter: 'stylish', // Human-readable for development
    cache: true, // Essential for large codebases
    maxWarnings: 0, // Zero tolerance for warnings in production
  },

  format: {
    extensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'jsonc', 'html', 'css', 'scss', 'md', 'yaml', 'yml'],
    trimTrailingWhitespace: true,
    maxConsecutiveBlankLines: 1, // Strict formatting
    finalNewline: 'one',
    indent: 2, // Standard 2-space indentation
    indentStyle: 'spaces', // Consistent across platforms
    quotes: 'single', // Team preference
    semi: false, // Modern JavaScript style
  },

  rules: {
    // Zero tolerance for debugging code in production
    noDebugger: 'error',
    noConsole: 'error', // Strict - no console.log in production

    // RegExp best practices
    noUnusedCapturingGroup: 'error',

    // Prevent common bugs
    noCondAssign: 'error',
    noTemplateCurlyInString: 'error',
  },

  // Comprehensive plugin rules for code quality
  pluginRules: {
    // Import organization (critical for large teams)
    'sort-imports': 'error',
    'sort-named-imports': ['error', {
      type: 'alphabetical',
      order: 'asc',
      ignoreCase: false,
    }],

    // Object and interface consistency
    'sort-objects': ['error', {
      type: 'alphabetical',
      order: 'asc',
      ignoreCase: false,
      partitionByNewLine: true,
    }],
    'sort-keys': ['error', 'asc', {
      caseSensitive: false,
      natural: true,
      minKeys: 3, // Only enforce for objects with 3+ keys
      allowLineSeparatedGroups: true,
    }],
    'sort-interfaces': ['error', {
      type: 'alphabetical',
      order: 'asc',
      partitionByNewLine: true,
    }],
    'sort-object-types': ['error', {
      type: 'alphabetical',
      order: 'asc',
      partitionByNewLine: true,
    }],

    // Class organization
    'sort-classes': ['error', {
      type: 'alphabetical',
      order: 'asc',
      ignoreCase: false,
      partitionByNewLine: false,
    }],

    // Export consistency
    'sort-exports': ['error', {
      type: 'alphabetical',
      order: 'asc',
      partitionByNewLine: false,
    }],

    // TypeScript specific (strict for enterprise)
    'ts/no-require-imports': 'error',
    'sort-heritage-clauses': ['error', {
      type: 'alphabetical',
      order: 'asc',
      ignoreCase: false,
    }],

    // Code style enforcement
    'style/max-statements-per-line': ['error', { max: 1 }],

    // Variable management
    'prefer-const': 'error',
    'no-unused-vars': ['error', {
      varsIgnorePattern: '^_',
      argsIgnorePattern: '^_',
    }],

    // Security and performance
    'regexp/no-super-linear-backtracking': 'error',

    // Switch statement organization
    'sort-switch-case': ['warn', {
      type: 'alphabetical',
      order: 'asc',
    }],

    // Array consistency
    'sort-array-includes': ['warn', {
      type: 'alphabetical',
      order: 'asc',
    }],

    // Enum organization
    'sort-enums': ['error', {
      type: 'alphabetical',
      order: 'asc',
      partitionByNewLine: false,
    }],

    // Map consistency
    'sort-maps': ['warn', {
      type: 'alphabetical',
      order: 'asc',
    }],
  },
}

export default config
