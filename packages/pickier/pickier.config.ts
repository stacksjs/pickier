// Pickier configuration (package default example)
// Copy this file into your project root as pickier.config.ts and adjust as needed.

import type { PickierConfig } from './src/types'

const config: PickierConfig = {
  verbose: false,
  ignores: ['**/node_modules/**', '**/dist/**', '**/build/**'],
  lint: {
    extensions: ['ts', 'js', 'html', 'css', 'json', 'jsonc', 'md', 'yaml', 'yml', 'stx'],
    reporter: 'stylish',
    cache: false,
    maxWarnings: -1,
  },
  format: {
    extensions: ['.ts', '.js', '.html', '.css', '.json', '.jsonc', '.md', '.yaml', '.yml'],
    trimTrailingWhitespace: true,
    maxConsecutiveBlankLines: 1,
    finalNewline: 'one',
    indent: 2,
    quotes: 'single',
  },
  rules: {
    noDebugger: 'error',
    noConsole: 'warn',
  },
}

export default config
