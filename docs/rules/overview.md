# Rules Overview

Pickier provides a comprehensive set of linting rules organized into plugins. Core rules are configured under `rules`. Plugin rules are configured under `pluginRules`.

## Rule Organization

Rules are organized into the following plugins:

### Core Rules

Built-in rules that are always available and configured under `rules`:

- `noDebugger`- Disallow debugger statements

-`noConsole`- Disallow console statements
-`noCondAssign`- Disallow assignment in conditional expressions
-`noTemplateCurlyInString`- Disallow template literal placeholder syntax in regular strings

### Plugin Rules

Plugin rules are configured under`pluginRules` and organized by category:

#### ESLint Plugin (`eslint/`)

Legacy compatibility layer for ESLint rule names. These rules duplicate the `general/`and`quality/`plugins for backward compatibility. It's recommended to use the`general/`or`quality/` prefixes for new configurations.

#### General Plugin (`general/`)

Error detection and possible problems (35+ rules including):

- `array-callback-return`- Enforce return statements in array callbacks

-`constructor-super`- Require super() calls in constructors
-`no-const-assign`- Disallow reassigning const variables
-`no-dupe-keys`- Disallow duplicate keys in object literals
-`no-undef` - Disallow undeclared variables

- [`no-unused-vars`](/rules/no-unused-vars) - Disallow unused variables
- `no-unreachable` - Disallow unreachable code
- [`prefer-const`](/rules/prefer-const) - Require const declarations for variables that are never reassigned
- `prefer-template` - Require template literals instead of string concatenation

See the [full list](/rules/index.md#general-plugin) and [general plugin documentation](/rules/general.md).

#### Quality Plugin (`quality/`)

Best practices and code quality (40+ rules including):

- `complexity`- Enforce a maximum cyclomatic complexity

-`eqeqeq`- Require === and !==
-`max-depth`- Enforce a maximum depth that blocks can be nested
-`no-alert`- Disallow the use of alert, confirm, and prompt
-`no-eval`- Disallow eval()
-`no-var`- Require let or const instead of var
-`prefer-arrow-callback` - Require arrow functions as callbacks

See the [full list](/rules/index.md#quality-plugin) and [quality plugin documentation](/rules/quality.md).

#### Pickier Plugin (`pickier/`)

Sorting and import organization (17 rules). See [pickier plugin documentation](/rules/pickier.md).

Key rules:

- [`sort-exports`](/rules/sort-exports)
- [`sort-imports`](/rules/pickier-sort-imports)
- [`sort-named-imports`](/rules/pickier-sort-named-imports)
- [`sort-objects`](/rules/pickier-sort-objects)
- [`sort-heritage-clauses`](/rules/pickier-sort-heritage-clauses)
- `import-dedupe`- Remove duplicate imports

-`no-duplicate-imports` - Disallow duplicate imports

#### Style Plugin (`style/`)

Code style enforcement (7 rules). See [style plugin documentation](/rules/style.md).

Key rules:

- `brace-style`- Enforce consistent brace style

-`curly` - Enforce consistent use of curly braces

- [`max-statements-per-line`](/rules/style-max-statements-per-line) - Enforce maximum number of statements per line
- `consistent-chaining`- Enforce consistent newlines in method chains

-`consistent-list-newline` - Enforce consistent newlines in array/object literals

#### TypeScript Plugin (`ts/`)

TypeScript-specific rules (9 rules). See [TypeScript plugin documentation](/rules/ts.md).

Key rules:

- `no-explicit-any` - Disallow explicit any types
- [`no-require-imports`](/rules/ts-no-require-imports) - Disallow require() imports
- `prefer-optional-chain`- Prefer optional chaining (?.)

-`no-floating-promises`- Require promises to be awaited or returned
-`no-misused-promises` - Disallow misused promises

#### RegExp Plugin (`regexp/`)

Regular expression safety (3 rules). See [RegExp plugin documentation](/rules/regexp.md).

All rules:

- [`no-super-linear-backtracking`](/rules/regexp-no-super-linear-backtracking) - Disallow exponential backtracking (ReDoS prevention)
- [`no-unused-capturing-group`](/rules/regexp-no-unused-capturing-group) - Disallow unused capturing groups
- `no-useless-lazy` - Disallow useless lazy quantifiers

#### Markdown Plugin (`markdown/`)

Markdown documentation linting (53+ rules). See [markdown plugin documentation](/rules/markdown.md) for the complete list.

## Exploring Rules

You can explore the rule implementations directly in the codebase:

- Plugin definitions: `packages/pickier/src/plugins/`- Rule implementations:`packages/pickier/src/rules/`- Core linting logic:`packages/pickier/src/linter.ts`- Formatter helpers:`packages/pickier/src/format.ts`## Configuration

See [Advanced Configuration](/advanced/configuration.md) and [Plugin System](/advanced/plugin-system.md) for detailed configuration options.

## Best practices

- Start new rules at`warn`to gauge noise, then tighten to`error`where appropriate
- Prefer bare rule IDs in config (e.g.,`'sort-imports'`), leverage category prefixes for discoverability (e.g., `'regexp/no-super-linear-backtracking'`)
- Keep sorting rules (`sort-objects`, `sort-keys`, `sort-exports`, `sort-imports`) enabled to reduce merge conflicts and diff noise
- Pair rules with the formatter for auto-fixes where supported
- Use group pages — [`pickier`](/rules/pickier), [`style`](/rules/style), [`regexp`](/rules/regexp) — to navigate related options and examples
