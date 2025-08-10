import type { PickierConfig } from './types'
import { loadConfig } from 'bunfig'

export const defaultConfig: PickierConfig = {
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
  verbose: false,
}

// eslint-disable-next-line antfu/no-top-level-await
export const config: PickierConfig = await loadConfig({
  name: 'pickier',
  defaultConfig,
})
