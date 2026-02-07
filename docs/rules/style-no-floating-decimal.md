# style/no-floating-decimal

Disallow floating decimal points in numeric literals, such as `.5` (should be `0.5`) and `2.` (should be `2.0`).

- **Plugin:** style
- **Default:** off
- **Auto-fix:** Yes

## Examples

### Bad

```ts
const discount = .5
const tax = .25 + .1
const price = 2.
const ratio = 10.
const threshold = -.75
```

### Good

```ts
const discount = 0.5
const tax = 0.25 + 0.1
const price = 2.0
const ratio = 10.0
const threshold = -0.75
```

## Details

The rule detects two forms of floating decimal points:

1. **Leading decimal point** -- a decimal point without a leading digit, such as `.5` or `.123`. Property access expressions like `obj.length` are correctly excluded.
2. **Trailing decimal point** -- a decimal point after a digit with no following digit, such as `2.` or `10.`. Member access like `arr.length` or chained numbers like `1.0` are not affected.

Occurrences inside strings, template literals, or comments are ignored.

## Auto-fix

When `--fix` is applied, the fixer makes two corrections:

- **Leading decimal**: Prepends a `0` before the decimal point (e.g., `.5` becomes `0.5`)
- **Trailing decimal**: Appends a `0` after the decimal point (e.g., `2.` becomes `2.0`)

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/no-floating-decimal': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
