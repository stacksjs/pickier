# Types

## `FormatOptions`

```ts
export interface FormatOptions {
  write?: boolean
  check?: boolean
  config?: string
  ignorePath?: string
  ext?: string
  verbose?: boolean
}
```

## `LintOptions`

```ts
export interface LintOptions {
  fix?: boolean
  dryRun?: boolean
  maxWarnings?: number
  reporter?: 'stylish' | 'json' | 'compact'
  config?: string
  ignorePath?: string
  ext?: string
  cache?: boolean
  verbose?: boolean
}
```

## `PickierConfig`

```ts
export interface PickierConfig {
  verbose: boolean
  ignores: string[]
  lint: PickierLintConfig
  format: PickierFormatConfig
  rules: PickierRulesConfig
}
```

### `PickierLintConfig`

```ts
export interface PickierLintConfig {
  extensions: string[]
  reporter: 'stylish' | 'json' | 'compact'
  cache: boolean
  maxWarnings: number
}
```

### `PickierFormatConfig`

```ts
export interface PickierFormatConfig {
  extensions: string[]
  trimTrailingWhitespace: boolean
  maxConsecutiveBlankLines: number
  finalNewline: 'one' | 'two' | 'none'
}
```

### `PickierRulesConfig`

```ts
export interface PickierRulesConfig {
  noDebugger: 'off' | 'warn' | 'error'
  noConsole: 'off' | 'warn' | 'error'
}
```
