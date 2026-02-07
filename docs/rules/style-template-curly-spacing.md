# style/template-curly-spacing

Disallow spaces inside template literal interpolation braces.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** Yes

## Examples

### Bad

```ts
const greeting = `Hello, ${ name }!`
const url = `https://api.example.com/${ endpoint }/${ id }`
const message = `Total: ${ price * quantity }`
```

### Good

```ts
const greeting = `Hello, ${name}!`
const url = `https://api.example.com/${endpoint}/${id}`
const message = `Total: ${price * quantity}`
```

## Details

This rule checks for spaces or tabs immediately after `${` and immediately before `}` inside template literal interpolation expressions. It verifies that the `${` is actually inside a template literal by counting backtick characters on the line before the expression.

The rule handles nested braces within the interpolation expression correctly by tracking brace depth to find the matching closing `}`.

## Auto-fix

Running with `--fix` removes whitespace padding inside template literal interpolation braces. For example, `` `${ name }` `` becomes `` `${name}` `` and `` `${ a + b }` `` becomes `` `${a + b}` ``.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/template-curly-spacing': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
