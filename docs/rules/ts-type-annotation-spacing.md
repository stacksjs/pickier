# ts/type-annotation-spacing

Require consistent spacing around the colon in type annotations.

- **Plugin:** ts
- **Default:** off
- **Auto-fix:** Yes

## Why

Consistent spacing in type annotations improves readability. The conventional TypeScript style is no space before the colon and exactly one space after it (e.g., `name: string`). This rule enforces that convention.

## Examples

### Bad

```ts
// space before colon
const name : string = 'Alice'

// no space after colon
const age:number = 30

// both issues
function greet(name :string):void {
  console.log(name)
}

// in parameters
function process(input :unknown, output:string) {}

// in object types
interface User {
  name :string;
  age:number;
}
```

### Good

```ts
// no space before, one space after
const name: string = 'Alice'

const age: number = 30

function greet(name: string): void {
  console.log(name)
}

function process(input: unknown, output: string) {}

interface User {
  name: string;
  age: number;
}

// optional properties are also fine
interface Config {
  debug?: boolean;
  timeout?: number;
}
```

## Details

The rule matches type annotation patterns of the form `identifier: Type` (or `identifier?: Type` for optional annotations). It checks two spacing conditions:

1. **No space before the colon:** The character immediately before `:` should not be a space (unless it follows `?` for optional annotations).
2. **One space after the colon:** The character immediately after `:` should be a space.

The rule recognizes TypeScript built-in types (`string`, `number`, `boolean`, `null`, `undefined`, `void`, `never`, `any`, `unknown`, `object`, `symbol`, `bigint`) and user-defined types (starting with an uppercase letter) as valid type annotations. It ignores colons inside strings, comments, object literals (`{ key: value }`), and URLs.

## Auto-fix

When `--fix` is used, the rule normalizes spacing around colons in type annotations to the form `identifier: Type` -- removing any space before the colon and ensuring exactly one space after it.

**Before fix:**

```ts
const name :string = 'Alice'
const age:number = 30
function greet(x :string):void {}
```

**After fix:**

```ts
const name: string = 'Alice'
const age: number = 30
function greet(x: string): void {}
```

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'ts/type-annotation-spacing': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
