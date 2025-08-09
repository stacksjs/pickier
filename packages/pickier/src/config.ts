import type { BinaryConfig, PickierConfig } from './types'
import { loadConfig } from 'bunfig'

export const defaultConfig: BinaryConfig = {
  from: 'localhost:5173',
  verbose: true,
}

export const pickierDefaults: PickierConfig = {
  verbose: false,
  ignores: ['**/node_modules/**', '**/dist/**', '**/build/**'],
  lint: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
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
export const config: BinaryConfig = await loadConfig({
  name: 'binary',
  defaultConfig,
})

// eslint-disable-next-line antfu/no-top-level-await
export const pickierConfig: PickierConfig = await loadConfig({
  name: 'pickier',
  defaultConfig: pickierDefaults,
})
