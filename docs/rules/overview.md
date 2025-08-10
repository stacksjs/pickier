# Rules Overview

Pickier provides a small set of core rules and a growing set of plugin rules. Core rules are configured under `rules`. Plugin rules are configured under `pluginRules`.

You can explore the rule implementations directly in the codebase:

- Core and plugin checks live in `packages/pickier/src/cli/run-lint.ts`.
- Formatter-related helpers (imports, spacing) live in `packages/pickier/src/format.ts`.

Core:

- [`noDebugger`](/rules/no-debugger)
- [`noConsole`](/rules/no-console)
- [`noCondAssign`](/rules/no-cond-assign) (optional)
- [`regexp/noUnusedCapturingGroup`](/rules/regexp-no-unused-capturing-group) (optional)

Plugin:

- [`sort-objects`](/rules/pickier-sort-objects)
- [`sort-imports`](/rules/pickier-sort-imports)
- [`sort-named-imports`](/rules/pickier-sort-named-imports)
- [`sort-heritage-clauses`](/rules/pickier-sort-heritage-clauses)
- [`sort-keys`](/rules/sort-keys)
- [`sort-exports`](/rules/sort-exports)
- [`max-statements-per-line`](/rules/style-max-statements-per-line)
- [`pickier/no-unused-vars`](/rules/no-unused-vars)
- [`no-super-linear-backtracking`](/rules/regexp-no-super-linear-backtracking)
- [`prefer-const`](/rules/prefer-const)

Groups:

- [`pickier`](/rules/pickier): sorting and hygiene rules
- [`style`](/rules/style): stylistic constraints
- [`regexp`](/rules/regexp): regex safety checks

See Advanced » Plugin System for configuration details.

## Best practices

- Start new rules at `warn` to gauge noise, then tighten to `error` where appropriate
- Prefer bare rule IDs in config (e.g., `'sort-imports'`), leverage category prefixes for discoverability (e.g., `'regexp/no-super-linear-backtracking'`)
- Keep sorting rules (`sort-objects`, `sort-keys`, `sort-exports`, `sort-imports`) enabled to reduce merge conflicts and diff noise
- Pair rules with the formatter for auto-fixes where supported
- Use group pages — [`pickier`](/rules/pickier), [`style`](/rules/style), [`regexp`](/rules/regexp) — to navigate related options and examples
