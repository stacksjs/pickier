# style/arrow-parens

Require parentheses around arrow function parameters, even when there is only a single parameter.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** Yes

## Examples

### Bad

```ts
const double = x => x * 2

const greet = name => `Hello, ${name}`

const ids = items.map(item => item.id)

const process = value => {
  return value + 1
}
```

### Good

```ts
const double = (x) => x * 2

const greet = (name) => `Hello, ${name}`

const ids = items.map((item) => item.id)

const process = (value) => {
  return value + 1
}

// Multiple parameters are already parenthesized
const add = (a, b) => a + b

// Destructured parameters are already parenthesized
const getName = ({ name }) => name
```

## Details

The rule detects arrow functions with a single unparenthesized parameter (e.g., `x =>`) and reports a warning. It correctly handles the following edge cases:

- Parameters already wrapped in parentheses are ignored
- The `async` keyword before `=>` is not treated as a parameter
- Occurrences inside strings or comments are ignored
- Parameters preceded by `(` from a surrounding context (such as a function call) are ignored

## Auto-fix

When `--fix` is applied, the fixer wraps the single parameter in parentheses. For example, `x => x * 2` becomes `(x) => x * 2`.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/arrow-parens': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
