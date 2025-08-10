export type RuleSeverity = 'off' | 'warn' | 'error'

export interface PickierRulesConfig {
  // linter rules (subset for now)
  noDebugger: RuleSeverity
  noConsole: RuleSeverity
}

export type Extension = 'ts' | 'js' | 'html' | 'css' | 'json' | 'jsonc' | 'md' | 'yaml' | 'yml' | 'stx'

export interface PickierLintConfig {
  extensions: Extension[]
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
  // indentation size in spaces for code files (ts/js/tsx/jsx). Tabs will be converted to this many spaces
  indent: number
  // preferred quote style for code files (ts/js/tsx/jsx). JSON is always kept as double quotes
  quotes: 'single' | 'double'
}

export interface PickierConfig {
  verbose: boolean
  ignores: string[]
  lint: PickierLintConfig
  format: PickierFormatConfig
  rules: PickierRulesConfig
}
