# pickier (built-in plugin)

Rules provided by the built-in `pickier` plugin. These focus on layout, sorting, and practical hygiene checks.

- [`no-unused-vars`](/rules/no-unused-vars): report variables/parameters that are declared but never used
- [`prefer-const`](/rules/prefer-const): suggest `const` for variables that are never reassigned
- [`sort-array-includes`](/rules/sort-array-includes): enforce sorted array literals immediately used with `.includes(...)`
- [`sort-classes`](/rules/sort-classes): enforce sorted class members
- [`sort-enums`](/rules/sort-enums): enforce sorted enum members
- [`sort-exports`](/rules/sort-exports): sort contiguous export statements
- [`sort-heritage-clauses`](/rules/sort-heritage-clauses): sort TypeScript `extends`/`implements` lists
- [`sort-imports`](/rules/sort-imports): enforce canonical ordering/grouping of the import block
- [`sort-interfaces`](/rules/sort-interfaces): enforce sorted TypeScript interface members
- [`sort-keys`](/rules/sort-keys): ESLint-like object key sort check
- [`sort-maps`](/rules/sort-maps): enforce sorted entries inside `new Map([...])`
- [`sort-named-imports`](/rules/sort-named-imports): sort named specifiers within a single import statement
- [`sort-object-types`](/rules/sort-object-types): enforce sorted TypeScript object type members
- [`sort-objects`](/rules/sort-objects): require object literal keys to be sorted

See the [Plugin System](/advanced/plugin-system) for configuration examples.
