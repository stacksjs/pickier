# Functions

## `runFormat(globs: string[], options: FormatOptions): Promise<number>`

- Expands provided `globs` (directories auto-expand to `**/*`).
- Filters files by `options.ext` or `format.extensions` defaults.
- Normalizes whitespace:
  - trims trailing spaces
  - collapses multiple blank lines to a configured max
  - enforces final newline policy
- Modes:
  - `check`: prints files needing format, returns 1 if any
  - `write`: writes changes, returns 0
  - default (neither): behaves like `check`

### FormatOptions

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

Return value: `Promise<number>` — process-like exit code.

---

## `runLint(globs: string[], options: LintOptions): Promise<number>`

- Loads `PickierConfig` (defaults or from `options.config`).
- Scans code files for simple issues:
  - `noDebugger`: flags/auto-fixes `debugger` statements
  - `noConsole`: flags `console.*` usage
- Respects `ignores` patterns from config.
- Reporters:
  - `stylish` (grouped, colored)
  - `json` (machine-readable)
  - `compact` (one-line per issue)
- Exit codes:
  - 1 if any errors
  - 1 if warnings exceed `maxWarnings`
  - 0 otherwise

### LintOptions

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

Return value: `Promise<number>` — process-like exit code.
