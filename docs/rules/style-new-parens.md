# style/new-parens

Require parentheses when invoking a constructor with `new`, even when there are no arguments.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** Yes

## Examples

### Bad

```ts
const date = new Date
const map = new Map
const set = new Set
const err = new Error
const obj = new MyClass
const nested = new Foo.Bar
```

### Good

```ts
const date = new Date()
const map = new Map()
const set = new Set()
const err = new Error('something went wrong')
const obj = new MyClass()
const nested = new Foo.Bar()

// Generics with parentheses are fine
const map = new Map<string, number>()
```

## Details

The rule detects `new ClassName` expressions that are missing the invoking parentheses. It handles several patterns:

- Simple constructors: `new Foo` should be `new Foo()`
- Namespaced constructors: `new Foo.Bar` should be `new Foo.Bar()`
- Generic constructors: `new Map<string, number>` should be `new Map<string, number>()`
- Constructors that already have parentheses are not flagged
- The rule only matches class-like names starting with an uppercase letter
- Occurrences inside strings or comments are ignored

## Auto-fix

When `--fix` is applied, the fixer appends `()` to constructor invocations that are missing parentheses. For example, `new Date` becomes `new Date()` and `new Map<string, number>` becomes `new Map<string, number>()`.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/new-parens': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
