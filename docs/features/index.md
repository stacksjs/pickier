# Features

Pickier focuses on speed and consistency. Explore each feature below.

- [Formatting](/features/formatting): Fast whitespace normalization, indentation, quotes, semicolon policy. Backed by `formatCode`, `fixIndentation`, `fixQuotes`, and JSON sorting logic from the formatter.
- [Imports](/features/imports): Deterministic import cleanup and ordering, powered by `formatImports` with merging, deduplication, and grouping by kind.
- [JSON and config sorting](/features/json-and-config-sorting): Stable ordering for `package.json` and `tsconfig.json` using curated key orders.
- [Linting basics](/features/linting-basics): Lightweight checks like `no-debugger`, `no-console`, indentation and quotes diagnostics.
- [Performance](/features/performance): Bun, fast-glob scanning, and simple heuristics for near-instant results.

## How it works (at a glance)

- CLI routes to `runFormat` and `runLint` in the core library.
- Formatting leverages `formatCode` to apply consistent rules per file type (TS/JS and JSON have special handling).
- Import management is done by `formatImports`, which parses and reconstructs import blocks deterministically.
- Linting is heuristic and plugin-driven, with built-in rules for sorting and style checks.
