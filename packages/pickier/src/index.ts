// Unified CLI API
export { run } from './cli'
export type { RunOptions } from './cli'
export type { FormatOptions, LintOptions } from './cli'
export * from './config'

export * from './format'
export type { PickierPlugin, RuleContext, RuleModule } from './types'
export * from './types'
export * from './utils'
// Back-compat named exports used by tests and VS Code package
export { runLint } from './linter'
export { runFormat } from './formatter'
