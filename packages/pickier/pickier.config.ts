// Pickier configuration (package default example)
// Copy this file into your project root as pickier.config.ts and adjust as needed.

import type { PickierConfig } from './src/types'

const config: PickierConfig = {
  verbose: true,
  ignores: ['**/node_modules/**', '**/dist/**', '**/build/**'],
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
    quotes: 'single',
    semi: false,
  },
  rules: {
    noDebugger: 'error',
    noConsole: 'warn',
    noUnusedCapturingGroup: 'error',
    noCondAssign: 'error',
    noTemplateCurlyInString: 'warn',
  },
}

export default config
