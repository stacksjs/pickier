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
- Import organization: splits type/value imports, sorts modules/specifiers, removes unused named imports
- Optional stylistic semicolon cleanup (`format.semi`)

## Install

```bash
# as a dev dependency
bun add -D pickier

# or with npm/pnpm/yarn
npm i -D pickier
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
import type { PickierConfig } from 'pickier'

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
    // 2-space indentation (code files)
    indent: 2,
    // preferred string quotes in code files: 'single' | 'double'
    quotes: 'single',
    // when true, safely remove stylistic semicolons
    // (never touches for(;;) headers; removes duplicate/empty semicolon statements)
    semi: false,
  },

  rules: {
    // 'off' | 'warn' | 'error'
    noDebugger: 'error',
    noConsole: 'warn',
  },
}

export default config
```

### Formatting details

- Semicolons
  - Controlled by `format.semi` (default `false`). When `true`, Pickier removes only stylistic semicolons safely:
    - preserves `for (init; test; update)` headers
    - removes duplicate trailing semicolons (e.g. `foo();;` → `foo();`)
    - removes lines that are just empty statements (`;`)
    - keeps normal end-of-line semicolons otherwise (non-destructive)

- Imports (TypeScript/JavaScript)
  - Groups and rewrites the top import block:
    - Splits type-only specifiers into `import type { ... } from 'x'`
    - Keeps default and namespace imports
    - Removes unused named specifiers only when they have no alias
    - Merges multiple imports from the same module
  - Sorting
    - Order by kind: type imports, side-effect imports, value imports
    - For modules: external before relative
    - For specifiers: A→Z by identifier; minor normalization for consistent ordering
  - Spacing/newlines
    - Ensures a single blank line between the import block and the rest of the file
    - Respects `format.finalNewline` at EOF

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

## Programmatic usage

You can also call Pickier from code (Bun/Node). Useful for custom tooling, editors, or pipelines.

```ts
import type { FormatOptions, LintOptions } from 'pickier'
// example.ts
import { pickierConfig, runFormat, runLint } from 'pickier'

// Lint some directories
const lintOptions: LintOptions = {
  fix: true, // apply safe fixes
  dryRun: false, // set true to simulate fixes
  reporter: 'json', // 'stylish' | 'json' | 'compact'
  maxWarnings: 0, // fail on any warning
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

## Testing

```bash
bun test
```

## Changelog

Please see our [releases](https://github.com/stacksjs/stacks/releases) page for more information on what has changed recently.

## Contributing

Please review the [Contributing Guide](https://github.com/stacksjs/contributing) for details.

## Community

For help, discussion about best practices, or any other conversation that would benefit from being searchable:

[Discussions on GitHub](https://github.com/stacksjs/stacks/discussions)

For casual chit-chat with others using this package:

[Join the Stacks Discord Server](https://discord.gg/stacksjs)

## Postcardware

“Software that is free, but hopes for a postcard.” We love receiving postcards from around the world showing where `pickier` is being used! We showcase them on our website too.

Our address: Stacks.js, 12665 Village Ln #2306, Playa Vista, CA 90094, United States 🌎

## Sponsors

We would like to extend our thanks to the following sponsors for funding Stacks development. If you are interested in becoming a sponsor, please reach out to us.

- [JetBrains](https://www.jetbrains.com/)
- [The Solana Foundation](https://solana.com/)

## Credits

- [Chris Breuer](https://github.com/chrisbbreuer)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [LICENSE](https://github.com/stacksjs/pickier/tree/main/LICENSE.md) for more information.

Made with 💙

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/pickier?style=flat-square
[npm-version-href]: https://npmjs.com/package/pickier
[github-actions-src]: https://img.shields.io/github/actions/workflow/status/stacksjs/pickier/ci.yml?style=flat-square&branch=main
[github-actions-href]: https://github.com/stacksjs/pickier/actions?query=workflow%3Aci

<!-- [codecov-src]: https://img.shields.io/codecov/c/gh/stacksjs/pickier/main?style=flat-square
[codecov-href]: https://codecov.io/gh/stacksjs/pickier -->
