<p align="center"><img src=".github/art/cover.jpg" alt="Social Card of this repo"></p>

[![npm version][npm-version-src]][npm-version-href]
[![GitHub Actions][github-actions-src]][github-actions-href]
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
<!-- [![npm downloads][npm-downloads-src]][npm-downloads-href] -->
<!-- [![Codecov][codecov-src]][codecov-href] -->

# Pickier

Fast Bun‑native linting and formatting. Minimal defaults. Extensible. Built for speed.

## Features

- Fast, Bun-first CLI (no Node install required)
- Lint and Format in one tool
- Sensible defaults with zero-config usage
- Simple, typed `pickier.config.ts` for overrides
- Dry‑run mode for safe previews
- Thorough tests

## Install

```bash
# as a dev dependency
bun add -D @stacksjs/pickier

# or with npm/pnpm/yarn
npm i -D @stacksjs/pickier
```

You can also run it directly via npx/bunx without installing:

```bash
npx pickier --help
# or
bunx pickier --help
```

## Quick start

```bash
# Lint everything, pretty output
pickier lint .

# Auto-fix issues (safe fixes only)
pickier lint . --fix

# Preview fixes without writing
pickier lint . --fix --dry-run --verbose

# Format and write changes
pickier format . --write

# Check formatting without writing (CI-friendly)
pickier format . --check
```

## CLI

- `pickier lint [...globs]`
  - `--fix`: apply safe fixes (e.g. remove `debugger` statements)
  - `--dry-run`: simulate fixes without writing
  - `--max-warnings <n>`: fail if warnings exceed n (default: -1)
  - `--reporter <stylish|json|compact>`: output format (default: stylish)
  - `--ext <.ts,.tsx,.js,...>`: comma-separated extensions (overrides config)
  - `--ignore-path <file>`: optional ignore file (e.g. .gitignore)
  - `--cache`: reserved (no-op currently)
  - `--verbose`
  - Examples:
    - `pickier lint . --dry-run`
    - `pickier lint src --fix`
    - `pickier lint "src/**/*.{ts,tsx}" --reporter json`

- `pickier format [...globs]`
  - `--write`: write formatted files
  - `--check`: only check, non-zero exit on differences
  - `--ext <.ts,.tsx,.js,.json,...>`
  - `--ignore-path <file>`
  - `--verbose`
  - Examples:
    - `pickier format . --check`
    - `pickier format src --write`
    - `pickier format "**/*.{ts,tsx,js}" --write`

## Configuration

Pickier works out-of-the-box. To customize, create `pickier.config.ts` in your project root. All fields are optional.

```ts
// pickier.config.ts
import type { PickierConfig } from '@stacksjs/pickier'

const config: PickierConfig = {
  verbose: false,
  ignores: ['**/node_modules/**', '**/dist/**', '**/build/**'],

  lint: {
    // which extensions to lint
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    // stylish | json | compact
    reporter: 'stylish',
    // reserved (not used yet)
    cache: false,
    // -1 disables, otherwise fail when warnings > maxWarnings
    maxWarnings: -1,
  },

  format: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.yaml', '.yml'],
    trimTrailingWhitespace: true,
    maxConsecutiveBlankLines: 1,
    // one | two | none
    finalNewline: 'one',
  },

  rules: {
    // 'off' | 'warn' | 'error'
    noDebugger: 'error',
    noConsole: 'warn',
  },
}

export default config
```

Notes:

- `noDebugger` removes lines that are debugger statements when `--fix` is used.
- `noConsole` controls severity (turn off for libraries that allow console logs).

## Development

This repository contains Pickier’s source under `packages/pickier`.

Common tasks:

```bash
# install deps
bun i

# run tests (with coverage)
bun test --coverage

# build JS and type declarations
bun run -C packages/pickier build

# compile native binary for your platform
bun run -C packages/pickier compile

# compile all platform binaries
bun run -C packages/pickier compile:all
```

Try the CLI locally without publishing:

```bash
# run the TS entry directly
bun packages/pickier/bin/cli.ts --help

# run the built dist CLI
bun packages/pickier/dist/bin/cli.js lint .

# or the compiled native binary (after compile)
./packages/pickier/bin/pickier-<your-platform> --help
```

## CI & Releases

- CI runs lint, typecheck, tests, and build.
- Release workflow bundles platform binaries and publishes to npm.

## License

MIT © Stacks.js

## Links

- Docs (TBD)
- GitHub: <https://github.com/stacksjs/pickier>
- Issues: <https://github.com/stacksjs/pickier/issues>

## Programmatic usage

You can also call Pickier from code (Bun/Node). Useful for custom tooling, editors, or pipelines.

```ts
// example.ts
import { runLint, runFormat, pickierConfig, type LintOptions, type FormatOptions } from '@stacksjs/pickier'

// Lint some directories
const lintOptions: LintOptions = {
  fix: true,        // apply safe fixes
  dryRun: false,    // set true to simulate fixes
  reporter: 'json', // 'stylish' | 'json' | 'compact'
  maxWarnings: 0,   // fail on any warning
}

const lintCode = await runLint(['src', 'tests'], lintOptions)
console.log('lint exit code:', lintCode)

// Format some globs
const formatOptions: FormatOptions = {
  write: true, // write changes
}

const fmtCode = await runFormat(['src/**/*.ts'], formatOptions)
console.log('format exit code:', fmtCode)

// Access loaded config (from pickier.config.ts or defaults)
console.log('loaded config:', pickierConfig)
```

Run it with Bun:

```bash
bun example.ts
```
