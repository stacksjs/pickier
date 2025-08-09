export interface BinaryConfig {
  from: string
  verbose: boolean
}

export type RuleSeverity = 'off' | 'warn' | 'error'

export interface PickierRulesConfig {
  // linter rules (subset for now)
  noDebugger: RuleSeverity
  noConsole: RuleSeverity
}

export interface PickierLintConfig {
  extensions: string[]
  reporter: 'stylish' | 'json' | 'compact'
  cache: boolean
  maxWarnings: number
}

export interface PickierFormatConfig {
  extensions: string[]
  trimTrailingWhitespace: boolean
  // maximum number of consecutive blank lines to keep
  maxConsecutiveBlankLines: number
  // final newline policy: 'one' ensures 1; 'two' ensures a blank line + final newline; 'none' ensures no trailing newline
  finalNewline: 'one' | 'two' | 'none'
}

export interface PickierConfig {
  verbose: boolean
  ignores: string[]
  lint: PickierLintConfig
  format: PickierFormatConfig
  rules: PickierRulesConfig
}
