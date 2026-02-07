# ts/no-unsafe-assignment

Disallow assigning `any`-typed values to variables, which bypasses TypeScript's type checking.

- **Plugin:** ts
- **Default:** off
- **Auto-fix:** No

## Why

When a value typed as `any` is assigned to a variable, the `any` type "spreads" through subsequent usage of that variable. This silently disables type checking for all downstream code that touches the variable, defeating TypeScript's safety guarantees. This rule catches common patterns where `any` leaks into your codebase through assignments.

## Examples

### Bad

```ts
// casting to any before assigning
const value = input as any

// JSON.parse returns any without type annotation
const data = JSON.parse(rawJson)

// eval returns any
const result = eval('1 + 2')

// require returns any
const lib = require('some-lib')

// explicit any type annotation
const config: any = loadConfig()

// assigning any-returning function to a property
obj.data = JSON.parse(response)
```

### Good

```ts
// use a specific type assertion
const value = input as UserConfig

// add a type annotation to JSON.parse
const data: User = JSON.parse(rawJson)

// or use a type assertion with a specific type
const data = JSON.parse(rawJson) as User

// use import instead of require
import lib from 'some-lib'

// use unknown instead of any
const config: unknown = loadConfig()

// add type annotation to property assignment
const data: ResponseData = JSON.parse(response)
obj.data = data
```

## Details

The rule detects four patterns of unsafe assignment:

1. **`as any` casts in assignments:** Flags expressions like `const x = value as any` where a value is cast to `any` and then assigned.

2. **Untyped assignments from unsafe functions:** Flags assignments from functions known to return `any`:
   - `JSON.parse()` -- returns `any` by default
   - `eval()` -- returns `any`
   - `Function()` -- returns `any`
   - `require()` -- returns `any`

   The rule only flags these when the receiving variable has no type annotation (e.g., `const data = JSON.parse(...)` but not `const data: MyType = JSON.parse(...)`).

3. **Explicit `any` type annotations:** Flags variable declarations that explicitly use `: any` as the type annotation (e.g., `const config: any = ...`).

4. **Property assignments from unsafe functions:** Flags property assignments like `obj.foo = JSON.parse(...)` where the result of an unsafe function is assigned directly to a property.

The rule handles comments and string literals to avoid false positives, and skips equality comparisons (`==`, `===`, `!=`, `!==`) when checking for assignment operators.

Applies to files with extensions: `.ts`, `.tsx`.

## Auto-fix

This rule does not provide auto-fix. Resolving unsafe assignments requires knowing the correct type to use, which depends on the runtime data and cannot be inferred statically by the linter.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'ts/no-unsafe-assignment': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
