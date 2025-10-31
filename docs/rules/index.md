# Rules Reference

Pickier includes a comprehensive set of linting rules organized into plugins. All rules support both `// eslint-disable-next-line` and `// pickier-disable-next-line` directives for compatibility.

## Table of Contents

- [Core Rules](#core-rules) - Built-in rules always available
- [ESLint Plugin](#eslint-plugin) - Legacy compatibility layer
- [General Plugin](#general-plugin) - Error detection and possible problems
- [Quality Plugin](#quality-plugin) - Best practices and code quality
- [Pickier Plugin](#pickier-plugin) - Sorting and import organization
- [Style Plugin](#style-plugin) - Code style enforcement
- [TypeScript Plugin](#typescript-plugin) - TypeScript-specific rules
- [RegExp Plugin](#regexp-plugin) - Regular expression safety
- [Markdown Plugin](#markdown-plugin) - Markdown documentation linting

## Quick Reference

| Rule ID | Category | Auto-fix | Default | Description |
|---------|----------|----------|---------|-------------|
| `quotes` | Core | ✅ | warn | Enforce consistent quote style |
| `indent` | Core | ✅ | warn | Enforce consistent indentation |
| `no-debugger` | Core | ✅ | error | Disallow debugger statements |
| `no-console` | Core | ❌ | warn | Disallow console statements |
| `no-template-curly-in-string` | Core | ❌ | error | Disallow template literal placeholder syntax in regular strings |
| `no-cond-assign` | Core | ❌ | error | Disallow assignment in conditional expressions |
| `pickier/no-unused-vars` | General | ❌ | error | Disallow unused variables |
| `pickier/prefer-const` | General | ✅ | error | Require const declarations for variables that are never reassigned |
| `pickier/prefer-template` | General | ✅ | warn | Require template literals instead of string concatenation |
| `pickier/sort-imports` | Sort | ✅ | off | Enforce sorted import declarations |
| `pickier/sort-named-imports` | Sort | ✅ | off | Enforce sorted named imports |
| `pickier/sort-exports` | Sort | ✅ | off | Enforce sorted export declarations |
| `pickier/sort-objects` | Sort | ✅ | off | Enforce sorted object properties |
| `pickier/sort-keys` | Sort | ✅ | off | Enforce sorted object keys |
| `pickier/sort-classes` | Sort | ✅ | off | Enforce sorted class members |
| `pickier/sort-enums` | Sort | ✅ | off | Enforce sorted enum members |
| `pickier/sort-heritage-clauses` | Sort | ✅ | off | Enforce sorted heritage clauses |
| `regexp/no-super-linear-backtracking` | RegExp | ❌ | error | Disallow exponential backtracking in regexes |
| `regexp/no-unused-capturing-group` | RegExp | ❌ | warn | Disallow unused capturing groups |
| `regexp/no-useless-lazy` | RegExp | ✅ | warn | Disallow useless lazy quantifiers |
| `markdown/*` | Markdown | ✅ | varies | Various markdown formatting rules |

## Core Rules

Core rules are built-in and always available. These catch common code quality issues.

### quotes
- **Default:** `warn`
- **Auto-fix:** ✅
- **Config:** `format.quotes` (default: `'single'`)

Enforces consistent use of single or double quotes.

```ts
// ❌ Bad (when format.quotes: 'single')
const msg = "Hello"

// ✅ Good
const msg = 'Hello'
```

[Full documentation →](./no-debugger.md)

### indent
- **Default:** `warn`
- **Auto-fix:** ✅
- **Config:** `format.indent`, `format.indentStyle`

Enforces consistent indentation (spaces or tabs).

```ts
// ❌ Bad (when format.indent: 2, format.indentStyle: 'spaces')
function test() {
    return true  // 4 spaces
}

// ✅ Good
function test() {
  return true  // 2 spaces
}
```

### no-debugger
- **Default:** `error`
- **Auto-fix:** ✅
- **Config:** `rules.noDebugger`

Disallows debugger statements to prevent them from being committed.

```ts
// ❌ Bad
function debug() {
  debugger
  return value
}

// ✅ Good
function debug() {
  return value
}
```

[Full documentation →](./no-debugger.md)

### no-console
- **Default:** `warn`
- **Auto-fix:** ❌
- **Config:** `rules.noConsole`

Warns about console statements that should be removed before production.

```ts
// ❌ Bad
console.log('Debug info')
console.warn('Warning')

// ✅ Good
logger.info('Info')  // Use proper logging library
```

[Full documentation →](./no-console.md)

### no-template-curly-in-string
- **Default:** `error`
- **Auto-fix:** ❌
- **Config:** `rules.noTemplateCurlyInString`

Disallows template literal placeholder syntax in regular strings (likely a mistake).

```ts
// ❌ Bad
const message = "Hello ${name}"  // Won't interpolate!

// ✅ Good
const message = `Hello ${name}`  // Will interpolate
```

[Full documentation →](./no-template-curly-in-string.md)

### no-cond-assign
- **Default:** `error`
- **Auto-fix:** ❌
- **Config:** `rules.noCondAssign`

Disallows assignment operators in conditional expressions (likely a typo for `===`).

```ts
// ❌ Bad
if (user = getUser()) {  // Assignment instead of comparison!
  // ...
}

// ✅ Good
if (user === getUser()) {
  // ...
}

// ✅ Also good (intentional assignment wrapped in parens)
if ((user = getUser())) {
  // ...
}
```

[Full documentation →](./no-cond-assign.md)

## ESLint Plugin

The `eslint/` plugin provides a legacy compatibility layer for ESLint rule names. These rules are duplicates of the `general/` and `quality/` plugins, allowing for a smooth migration from ESLint.

**Note:** It's recommended to use the `general/` or `quality/` prefixes for new configurations, as the `eslint/` prefix is maintained only for backward compatibility.

[See General Plugin](#general-plugin) and [Quality Plugin](#quality-plugin) for the actual rule implementations.

## General Plugin

The `general/` plugin contains error detection and possible problems rules. These rules catch common programming errors and potential bugs.

### Available Rules

All rules in this plugin can be referenced with either `general/rule-name` or `eslint/rule-name` (for compatibility).

**Error Detection:**
- `array-callback-return` - Enforce return statements in array callbacks
- `constructor-super` - Require super() calls in constructors
- `for-direction` - Enforce "for" loop update clause moving counter in the right direction
- `getter-return` - Enforce return statements in getters
- `no-async-promise-executor` - Disallow async promise executor
- `no-compare-neg-zero` - Disallow comparing against -0
- `no-cond-assign` - Disallow assignment in conditional expressions
- `no-const-assign` - Disallow reassigning const variables
- `no-constant-condition` - Disallow constant expressions in conditions
- `no-constructor-return` - Disallow returning value from constructor
- `no-dupe-class-members` - Disallow duplicate class members
- `no-dupe-keys` - Disallow duplicate keys in object literals
- `no-duplicate-case` - Disallow duplicate case labels
- `no-empty-pattern` - Disallow empty destructuring patterns
- `no-fallthrough` - Disallow fallthrough of case statements
- `no-irregular-whitespace` - Disallow irregular whitespace
- `no-loss-of-precision` - Disallow number literals that lose precision
- `no-promise-executor-return` - Disallow returning values from Promise executor
- `no-redeclare` - Disallow variable redeclaration
- `no-self-assign` - Disallow assignments where both sides are exactly the same
- `no-self-compare` - Disallow comparisons where both sides are exactly the same
- `no-sparse-arrays` - Disallow sparse arrays
- `no-undef` - Disallow undeclared variables
- `no-unsafe-negation` - Disallow negating the left operand of relational operators
- `no-unreachable` - Disallow unreachable code after return, throw, continue, and break
- `no-unused-vars` - Disallow unused variables
- `no-useless-catch` - Disallow unnecessary catch clauses
- `prefer-const` - Require const declarations for variables that are never reassigned
- `prefer-object-spread` - Prefer object spread over Object.assign
- `prefer-template` - Require template literals instead of string concatenation
- `use-isnan` - Require calls to isNaN() when checking for NaN
- `valid-typeof` - Enforce comparing typeof expressions against valid strings

## Quality Plugin

The `quality/` plugin contains best practices and code quality rules. These rules enforce coding standards and prevent common antipatterns.

### Available Rules

All rules in this plugin can be referenced with either `quality/rule-name` or `eslint/rule-name` (for compatibility).

**Best Practices:**
- `default-case` - Require default cases in switch statements
- `eqeqeq` - Require === and !==
- `no-alert` - Disallow the use of alert, confirm, and prompt
- `no-await-in-loop` - Disallow await inside of loops
- `no-caller` - Disallow use of caller/callee
- `no-case-declarations` - Disallow lexical declarations in case clauses
- `no-else-return` - Disallow else blocks after return statements
- `no-empty` - Disallow empty block statements
- `no-empty-function` - Disallow empty functions
- `no-eval` - Disallow eval()
- `no-extend-native` - Disallow extending native types
- `no-global-assign` - Disallow assignment to native objects
- `no-implied-eval` - Disallow implied eval()
- `no-iterator` - Disallow __iterator__ property
- `no-new` - Disallow new operators outside of assignments
- `no-new-func` - Disallow new operators with Function object
- `no-new-wrappers` - Disallow new operators with String, Number, and Boolean
- `no-octal` - Disallow octal literals
- `no-param-reassign` - Disallow reassignment of function parameters
- `no-proto` - Disallow __proto__ property
- `no-return-assign` - Disallow assignment in return statement
- `no-shadow` - Disallow variable declarations from shadowing outer scope
- `no-throw-literal` - Disallow throwing literals as exceptions
- `no-use-before-define` - Disallow use of variables before they are defined
- `no-useless-call` - Disallow unnecessary .call() and .apply()
- `no-with` - Disallow with statements
- `require-await` - Disallow async functions which have no await expression

**Code Quality & Complexity:**
- `complexity` - Enforce a maximum cyclomatic complexity
- `max-depth` - Enforce a maximum depth that blocks can be nested
- `max-lines-per-function` - Enforce a maximum number of lines per function
- `no-extra-boolean-cast` - Disallow unnecessary boolean casts
- `no-lonely-if` - Disallow if statements as the only statement in else blocks
- `no-sequences` - Disallow comma operators
- `no-useless-concat` - Disallow unnecessary concatenation of strings
- `no-useless-escape` - Disallow unnecessary escape characters
- `no-useless-rename` - Disallow renaming import, export, and destructured assignments
- `no-useless-return` - Disallow redundant return statements
- `no-var` - Require let or const instead of var
- `prefer-arrow-callback` - Require arrow functions as callbacks

## Pickier Plugin

The `pickier/` plugin contains sorting and import organization rules specific to Pickier.

### Available Rules

**Sort Rules:**
- `sort-exports` - Enforce sorted export declarations
- `sort-objects` - Enforce sorted object properties
- `sort-imports` - Enforce sorted import declarations
- `sort-named-imports` - Enforce sorted named imports
- `sort-heritage-clauses` - Enforce sorted heritage clauses (extends/implements)
- `sort-keys` - Enforce sorted object keys

**Import Rules:**
- `import-dedupe` - Remove duplicate imports
- `import-first` - Ensure imports come first
- `import-named` - Ensure named imports exist in the module
- `import-no-cycle` - Prevent import cycles
- `import-no-unresolved` - Ensure imports point to valid files
- `no-import-dist` - Disallow importing from dist folders
- `no-import-node-modules-by-path` - Disallow importing node_modules by path
- `no-duplicate-imports` - Disallow duplicate imports

**Style Rules:**
- `top-level-function` - Enforce top-level function declarations

## Style Plugin

The `style/` plugin enforces code style and formatting conventions.

### Available Rules

- `brace-style` - Enforce consistent brace style
- `curly` - Enforce consistent use of curly braces
- `max-statements-per-line` - Enforce maximum number of statements per line
- `if-newline` - Enforce newlines in if statements
- `consistent-chaining` - Enforce consistent newlines in method chains
- `consistent-list-newline` - Enforce consistent newlines in array/object literals
- `indent-unindent` - Enforce consistent indentation levels

## TypeScript Plugin

The `ts/` plugin contains TypeScript-specific linting rules.

### Available Rules

- `no-require-imports` - Disallow require() imports
- `no-top-level-await` - Disallow top-level await
- `no-ts-export-equal` - Disallow TypeScript export = syntax
- `no-explicit-any` - Disallow explicit any types
- `prefer-nullish-coalescing` - Prefer nullish coalescing operator (??)
- `prefer-optional-chain` - Prefer optional chaining (?.)
- `no-floating-promises` - Require promises to be awaited or returned
- `no-misused-promises` - Disallow misused promises
- `no-unsafe-assignment` - Disallow unsafe assignments

## RegExp Plugin

The `regexp/` plugin provides regular expression safety and optimization rules.

### Available Rules

- `no-super-linear-backtracking` - Disallow exponential backtracking (ReDoS prevention)
- `no-unused-capturing-group` - Disallow unused capturing groups
- `no-useless-lazy` - Disallow useless lazy quantifiers

## Markdown Plugin

The `markdown/` plugin provides 53+ rules for markdown linting and formatting. See [Markdown Rules Documentation](./markdown.md) for full details.

### Rule Categories

**Heading Rules (11 rules):**
- `heading-increment`, `heading-style`, `no-missing-space-atx`, `no-multiple-space-atx`
- `no-missing-space-closed-atx`, `no-multiple-space-closed-atx`
- `blanks-around-headings`, `heading-start-left`, `no-duplicate-heading`
- `single-title`, `no-trailing-punctuation`

**List Rules (6 rules):**
- `ul-style`, `list-indent`, `ul-indent`, `ol-prefix`
- `list-marker-space`, `blanks-around-lists`

**Whitespace Rules (9 rules):**
- `no-trailing-spaces`, `no-hard-tabs`, `no-multiple-blanks`
- `no-multiple-space-blockquote`, `no-blanks-blockquote`
- `blanks-around-fences`, `single-trailing-newline`, `blanks-around-tables`

**Link Rules (9 rules):**
- `no-reversed-links`, `no-bare-urls`, `no-space-in-links`
- `no-empty-links`, `link-fragments`, `reference-links-images`
- `link-image-reference-definitions`, `link-image-style`, `descriptive-link-text`

**Code Rules (5 rules):**
- `line-length`, `commands-show-output`, `fenced-code-language`
- `code-block-style`, `code-fence-style`

**Emphasis/Strong Rules (5 rules):**
- `no-emphasis-as-heading`, `no-space-in-emphasis`, `no-space-in-code`
- `emphasis-style`, `strong-style`

**Other Rules (8 rules):**
- `no-inline-html`, `hr-style`, `first-line-heading`
- `required-headings`, `proper-names`, `no-alt-text`
- `table-pipe-style`, `table-column-count`, `table-column-style`

---

## Disabling Rules

All rules support disable directives using the `pickier` prefix (or `eslint` for compatibility):

```ts
// Disable next line for specific rule
// pickier-disable-next-line no-debugger
debugger

// Disable multiple rules
// pickier-disable-next-line no-debugger, no-console
debugger; console.log('test')

// Disable for a block
/* pickier-disable no-console */
console.log('debug 1')
console.log('debug 2')
/* pickier-enable no-console */

// Disable for entire file (at top)
/* pickier-disable no-console */

// Note: eslint-disable-next-line also works for compatibility
// eslint-disable-next-line no-console
console.log('compatible')
```

## Configuration

See [Configuration Guide](../config.md) and [Advanced Configuration](../advanced/configuration.md) for detailed configuration options.

## Best Practices

1. **Start with defaults** - Pickier's defaults are carefully chosen
2. **Enable sort rules gradually** - They can cause large diffs initially
3. **Use disable comments sparingly** - Fix the issue instead when possible
4. **Prefix intentionally unused vars** - Use `_name` instead of disabling the rule
5. **Run with --fix** - Most issues are auto-fixable
6. **Add pre-commit hooks** - Catch issues before they're committed

## Related

- [CLI Reference](../cli.md)
- [Configuration Guide](../config.md)
- [VS Code Extension](./vscode.md)
