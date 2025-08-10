import type { PickierConfig } from './types'
import { loadConfig } from 'bunfig'


export const defaultConfig: PickierConfig = {
  verbose: false,
  ignores: ['**/node_modules/**', '**/dist/**', '**/build/**'],
  lint: {
    extensions: ['ts', 'js', 'html', 'css', 'json', 'jsonc', 'md', 'yaml', 'yml', 'stx'],
    reporter: 'stylish',
    cache: false,
    maxWarnings: -1,
  },
  format: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.yaml', '.yml'],
    trimTrailingWhitespace: true,
    maxConsecutiveBlankLines: 1,
    finalNewline: 'one',
  },
  rules: {
    noDebugger: 'error',
    noConsole: 'warn',
  },
}

// eslint-disable-next-line antfu/no-top-level-await
export const config: PickierConfig = await loadConfig({
  name: 'pickier',
  defaultConfig,
})
