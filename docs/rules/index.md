# Rules Reference

Pickier includes a comprehensive set of linting rules organized into categories. All rules support both `// eslint-disable-next-line` and `// pickier-disable-next-line` directives.

## Table of Contents

- [Core Rules](#core-rules)
- [General Rules](#general-rules)
- [Sort Rules](#sort-rules)
- [Style Rules](#style-rules)
- [TypeScript Rules](#typescript-rules)
- [Regular Expression Rules](#regexp-rules)
- [Markdown Rules](#markdown-rules)

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

## General Rules

General rules from the `pickier` plugin for code quality.

### pickier/no-unused-vars
- **Default:** `error`
- **Auto-fix:** ❌
- **Help:** Either use this variable in your code, remove it, or prefix it with an underscore (_name) to mark it as intentionally unused

Disallows unused variables, parameters, and imports.

```ts
// ❌ Bad
const unused = 'value'
function test(unusedParam: string) {
  return 42
}

// ✅ Good
const _unused = 'value'  // Prefixed with _ to mark as intentional
function test(_unusedParam: string) {  // Prefixed with _
  return 42
}
```

[Full documentation →](./no-unused-vars.md)

### pickier/prefer-const
- **Default:** `error`
- **Auto-fix:** ✅
- **Help:** Change 'let name' to 'const name' since the variable is never reassigned

Requires const declarations for variables that are never reassigned.

```ts
// ❌ Bad
let x = 10
let name = 'John'
return x + name.length

// ✅ Good (auto-fixed)
const x = 10
const name = 'John'
return x + name.length
```

[Full documentation →](./prefer-const.md)

### pickier/prefer-template
- **Default:** `warn`
- **Auto-fix:** ✅
- **Help:** Use template literals (backticks) instead of string concatenation

Requires template literals instead of string concatenation.

```ts
// ❌ Bad
const greeting = 'Hello ' + name + '!'
const url = baseUrl + '/' + path

// ✅ Good (auto-fixed)
const greeting = `Hello ${name}!`
const url = `${baseUrl}/${path}`
```

[Full documentation →](./prefer-template.md)

## Sort Rules

Sort rules help maintain consistent ordering in your code. All are disabled by default.

### pickier/sort-imports
- **Default:** `off`
- **Auto-fix:** ✅

Enforces sorted import declarations.

```ts
// ❌ Bad
import { z } from 'zod'
import { readFile } from 'fs'
import React from 'react'

// ✅ Good (auto-fixed)
import { readFile } from 'fs'
import React from 'react'
import { z } from 'zod'
```

[Full documentation →](./pickier-sort-imports.md)

### pickier/sort-named-imports
- **Default:** `off`
- **Auto-fix:** ✅

Enforces alphabetically sorted named imports.

```ts
// ❌ Bad
import { useState, useEffect, useCallback } from 'react'

// ✅ Good (auto-fixed)
import { useCallback, useEffect, useState } from 'react'
```

[Full documentation →](./pickier-sort-named-imports.md)

### Other Sort Rules
- `pickier/sort-exports` - Sort export statements
- `pickier/sort-objects` - Sort object properties
- `pickier/sort-keys` - Sort object keys
- `pickier/sort-classes` - Sort class members
- `pickier/sort-enums` - Sort enum members
- `pickier/sort-heritage-clauses` - Sort extends/implements clauses

## Regular Expression Rules

Rules for safer and more efficient regular expressions.

### regexp/no-super-linear-backtracking
- **Default:** `error`
- **Auto-fix:** ❌

Prevents exponential backtracking that can cause ReDoS vulnerabilities.

```ts
// ❌ Bad - can cause catastrophic backtracking
const regex = /(a+)+b/

// ✅ Good
const regex = /a+b/
```

[Full documentation →](./regexp-no-super-linear-backtracking.md)

### regexp/no-unused-capturing-group
- **Default:** `warn`
- **Auto-fix:** ❌

Warns about capturing groups that aren't used.

```ts
// ❌ Bad - capturing group not used
const regex = /test-(\\d+)/
const match = text.match(regex)

// ✅ Good - use non-capturing group
const regex = /test-(?:\\d+)/
// Or use the captured value
const [, id] = text.match(/test-(\\d+)/)
```

[Full documentation →](./regexp-no-unused-capturing-group.md)

## Markdown Rules

Rules for consistent markdown formatting. See [markdown rules documentation](./markdown.md).

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
