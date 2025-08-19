/**
 * Advanced Pickier Configuration Example
 * 
 * This configuration shows more advanced features including:
 * - Custom plugin rules
 * - Extended rule configuration
 * - Custom ignore patterns
 * - Performance optimizations
 */

import type { PickierConfig } from 'pickier'

const config: PickierConfig = {
  verbose: true, // Enable detailed logging
  
  // Custom ignore patterns
  ignores: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/coverage/**',
    '**/.next/**',
    '**/.nuxt/**',
    '**/vendor/**',
    '**/*.min.js',
    '**/*.bundle.js',
  ],
  
  lint: {
    extensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'jsonc', 'html', 'css', 'md', 'yaml', 'yml'],
    reporter: 'stylish', // Options: 'stylish' | 'json' | 'compact'
    cache: true, // Enable caching for better performance
    maxWarnings: 10, // Fail build if more than 10 warnings
  },
  
  format: {
    extensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'jsonc', 'html', 'css', 'md', 'yaml', 'yml'],
    trimTrailingWhitespace: true,
    maxConsecutiveBlankLines: 2, // Allow up to 2 blank lines
    finalNewline: 'one',
    indent: 2,
    indentStyle: 'spaces', // Options: 'spaces' | 'tabs'
    quotes: 'single', // Options: 'single' | 'double'
    semi: false, // Remove semicolons where possible
  },
  
  rules: {
    // Core rules
    noDebugger: 'error',
    noConsole: 'warn',
    
    // RegExp rules
    noUnusedCapturingGroup: 'error',
    
    // Control flow rules
    noCondAssign: 'error',
    
    // String rules
    noTemplateCurlyInString: 'warn',
  },
  
  // Plugin rules configuration
  pluginRules: {
    // Sorting rules
    'sort-objects': ['warn', { 
      type: 'alphabetical', 
      order: 'asc',
      ignoreCase: false,
      partitionByNewLine: true
    }],
    'sort-imports': 'warn',
    'sort-named-imports': ['warn', {
      type: 'alphabetical',
      order: 'asc',
      ignoreCase: false,
      ignoreAlias: false
    }],
    'sort-keys': ['warn', 'asc', {
      caseSensitive: false,
      natural: true,
      minKeys: 2,
      allowLineSeparatedGroups: true
    }],
    
    // Class and interface sorting
    'sort-classes': ['warn', {
      type: 'alphabetical',
      order: 'asc',
      ignoreCase: false,
      partitionByNewLine: false
    }],
    'sort-interfaces': ['warn', {
      type: 'alphabetical',
      order: 'asc',
      partitionByNewLine: true
    }],
    
    // TypeScript specific rules
    'ts/no-require-imports': 'error',
    
    // Style rules
    'style/max-statements-per-line': ['warn', { max: 1 }],
    
    // Code quality rules
    'prefer-const': 'error',
    'no-unused-vars': ['error', {
      varsIgnorePattern: '^_',
      argsIgnorePattern: '^_'
    }],
    
    // RegExp rules
    'regexp/no-super-linear-backtracking': 'error',
  },
}

export default config
