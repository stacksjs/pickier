# pickier (built-in plugin)

Rules provided by the built-in `pickier` plugin. These focus on layout, sorting, and practical hygiene checks.

- [`sort-objects`](/rules/pickier-sort-objects): require object literal keys to be sorted
- [`sort-imports`](/rules/pickier-sort-imports): enforce canonical ordering/grouping of the import block
- [`sort-named-imports`](/rules/pickier-sort-named-imports): sort named specifiers within a single import statement
- [`sort-heritage-clauses`](/rules/pickier-sort-heritage-clauses): sort TypeScript `extends`/`implements` lists
- [`sort-keys`](/rules/sort-keys): ESLint-like object key sort check
- [`sort-exports`](/rules/sort-exports): sort contiguous export statements
- [`no-unused-vars`](/rules/no-unused-vars): report variables/parameters that are declared but never used
- [`prefer-const`](/rules/prefer-const): suggest `const` for variables that are never reassigned

See the [Plugin System](/advanced/plugin-system) for configuration examples.
