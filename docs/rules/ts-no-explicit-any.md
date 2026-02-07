# ts/no-explicit-any

Disallow the use of the `any` type in TypeScript files.

- **Plugin:** ts
- **Default:** off
- **Auto-fix:** Yes

## Why

Using `any` defeats the purpose of TypeScript's type safety. It effectively disables type checking for the annotated value, allowing it to be used in any context without compiler warnings. This can lead to runtime errors that TypeScript is designed to prevent. Prefer `unknown` when the type is truly unknown, or use a more specific type.

## Examples

### Bad

```ts
let value: any = 'hello'

function process(input: any): any {
  return input
}

const data: Array<any> = []

const result = value as any

type Callback = (arg: any) => void

interface Config {
  settings: any
}

type Union = string | any
```

### Good

```ts
let value: unknown = 'hello'

function process(input: unknown): string {
  return String(input)
}

const data: Array<string> = []

const result = value as string

type Callback = (arg: unknown) => void

interface Config {
  settings: Record<string, unknown>
}

type Union = string | number
```

## Details

The rule detects `any` in type positions by analyzing the surrounding context:

- Type annotations (`: any`)
- Generic type parameters (`<any>`, `Array<any>`)
- Type assertions (`as any`)
- Union and intersection types (`| any`, `& any`)
- Array types (`any[]`)
- Type aliases (`type Foo = any`)
- Extends clauses (`extends any`)

The rule properly handles block comments, line comments, and string literals to avoid false positives. It also avoids matching `any` when it appears as part of a larger identifier (e.g., `company`, `anything`).

Applies to files with extensions: `.ts`, `.tsx`.

## Auto-fix

When `--fix` is used, the rule conservatively replaces `: any` annotations with `: unknown` in parameter and variable declarations. It does not auto-fix `as any` casts, since those are often intentional escape hatches.

**Before fix:**

```ts
function process(input: any) { }
const value: any = getData()
```

**After fix:**

```ts
function process(input: unknown) { }
const value: unknown = getData()
```

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'ts/no-explicit-any': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
