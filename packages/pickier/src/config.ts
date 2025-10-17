import type { PickierConfig } from './types'
import { loadConfig } from 'bunfig'

export const defaultConfig: PickierConfig = {
  ignores: [
    '**/node_modules/**',
    '**/.pnpm/**',
    '**/.yarn/**',
    '**/dist/**',
    '**/build/**',
    '**/out/**',
    '**/.output/**',
    '**/.next/**',
    '**/.nuxt/**',
    '**/.vite/**',
    '**/.turbo/**',
    '**/.cache/**',
    '**/coverage/**',
    '**/vendor/**',
    '**/tmp/**',
    '**/.git/**',
    '**/.idea/**',
    '**/.vscode/**',
    '**/*.test.ts',
    '**/*.spec.ts',
  ],
  lint: {
    extensions: ['ts', 'js', 'html', 'css', 'json', 'jsonc', 'md', 'yaml', 'yml', 'stx'],
    reporter: 'stylish',
    cache: false,
    maxWarnings: -1,
  },
  format: {
    extensions: ['ts', 'js', 'html', 'css', 'json', 'jsonc', 'md', 'yaml', 'yml', 'stx'],
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
  pluginRules: {
    'style/brace-style': 'warn',
    'style/curly': 'off',
    'style/if-newline': 'off',
    'style/max-statements-per-line': 'warn',
    'pickier/import-dedupe': 'warn',
    'pickier/no-import-node-modules-by-path': 'error',
    'pickier/no-import-dist': 'error',
    'pickier/prefer-const': 'error',
    'pickier/prefer-template': 'warn',
    'pickier/no-unused-vars': 'error',
    'regexp/no-unused-capturing-group': 'error',
    'regexp/no-super-linear-backtracking': 'error',
    'regexp/no-useless-lazy': 'error',
    'ts/no-top-level-await': 'error',
  },
  verbose: false,
}

// eslint-disable-next-line antfu/no-top-level-await
export const config: PickierConfig = await loadConfig({
  name: 'pickier',
  defaultConfig,
})
