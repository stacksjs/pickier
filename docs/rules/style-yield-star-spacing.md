# style/yield-star-spacing

Enforce consistent spacing around the `*` in `yield*` expressions.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** Yes

## Examples

### Bad

```ts
function* generator() {
  // Space before *
  yield *otherGenerator()
  yield  *anotherGenerator()

  // No space after *
  yield*otherGenerator()
}
```

### Good

```ts
function* generator() {
  yield* otherGenerator()
  yield* [1, 2, 3]
  yield* anotherGenerator()
}
```

## Details

This rule enforces the following spacing conventions for `yield*` delegation expressions:

1. **No space before `*`**: The `*` should be attached directly to `yield`. Writing `yield *expr` or `yield  *expr` is flagged; it should be `yield*`.
2. **Space after `*`**: There should be a space between `*` and the delegated expression. Writing `yield*expr` is flagged; it should be `yield* expr`.

Lines that are comments are skipped, and patterns inside strings or comments are ignored.

## Auto-fix

Running with `--fix` normalizes `yield*` spacing:

- Removes any space between `yield` and `*` (e.g., `yield *` becomes `yield*`)
- Adds a space after `*` when a non-whitespace character immediately follows (e.g., `yield*expr` becomes `yield* expr`)

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/yield-star-spacing': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
