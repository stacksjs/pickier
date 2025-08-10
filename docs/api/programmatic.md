# Programmatic Usage

Import from `pickier` to run Pickier from your own scripts.

## Format

```ts
import type { FormatOptions } from 'pickier'
import { runFormat } from 'pickier'

async function main() {
  const globs = ['src', 'README.md']
  const options: FormatOptions = {
    write: true, // write changes to disk
    ext: '.ts,.tsx,.js,.jsx,.md',
    verbose: true,
  }

  // exit code: 0 when formatted or already clean; 1 if --check and changes needed
  const code = await runFormat(globs, options)
  if (code !== 0)
    process.exit(code)
}

main()
```

Notes:

- When neither `check` nor `write` is set, formatting runs in check mode by default.
- `ext` filters files by extension.

## Lint

```ts
import type { LintOptions } from 'pickier'
import { runLint } from 'pickier'

async function main() {
  const globs = ['src', 'scripts/**/*.{ts,js}']
  const options: LintOptions = {
    fix: true,
    dryRun: false,
    reporter: 'stylish',
    maxWarnings: 0,
    verbose: true,
  }

  // exit code: 1 if errors found or warnings exceed maxWarnings
  const code = await runLint(globs, options)
  if (code !== 0)
    process.exit(code)
}

main()
```

Notes:

- `fix` removes `debugger` statements; `noConsole` produces warnings or errors depending on config.
- `reporter` can be `stylish`, `json`, or `compact`.

## Using a custom config

Both functions accept `--config` via the options object as a path string.

```ts
const code = await runLint(['.'], { config: './pickier.config.ts', reporter: 'json' })
```
