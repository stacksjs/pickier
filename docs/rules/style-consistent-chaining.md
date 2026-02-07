# style/consistent-chaining

Enforce consistent line breaks in member-access and method-call chains, disallowing a mix of inline and newline dot styles within the same chain.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** No

## Examples

### Bad

```ts
// Mixing inline dots and leading-dot newline style
promise.then(handleResult)
  .catch(handleError).finally(cleanup)

// First dot is inline, rest are newline
const result = obj.foo()
  .bar()
  .baz()
```

### Good

```ts
// All dots on their own lines (leading-dot style)
promise
  .then(handleResult)
  .catch(handleError)
  .finally(cleanup)

// All dots inline (single-line chain)
const result = obj.foo().bar().baz()
```

## Details

This rule identifies chains of member access (dots) that span multiple lines and checks whether all dots within the chain use a consistent style:

- **Inline style**: The dot appears on the same line as the preceding expression (e.g., `obj.foo()`).
- **Newline style**: The dot appears at the beginning of a new line (e.g., `.foo()`).

The rule establishes the expected style based on the first dot in the chain. If any subsequent dot in the same chain uses a different style, a warning is reported at the location of the first mismatch.

Optional chaining (`?.`) operators are recognized and excluded from dot-style analysis.

## Auto-fix

This rule does not provide auto-fix. Manually adjust the chain to use a consistent style throughout.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/consistent-chaining': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
