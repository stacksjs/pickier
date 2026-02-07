# style/if-newline

Enforce a newline after `if` conditions when the body does not use curly braces, disallowing the single-line braceless form.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** No

## Examples

### Bad

```ts
if (condition) return true

if (x > 0) doSomething()

if (ready) start()
```

### Good

```ts
if (condition)
  return true

if (x > 0)
  doSomething()

if (ready) {
  start()
}
```

## Details

This rule flags `if` statements where the condition is immediately followed by a non-block statement on the same line (e.g., `if (x) return`). It does not flag `if` statements that use curly braces on the same line (e.g., `if (x) {`), since the opening brace serves as a clear visual delimiter.

The intent is to improve readability by ensuring the body of a braceless `if` always appears on its own line, making the control flow easier to follow.

## Auto-fix

This rule does not provide auto-fix. Manually move the statement to the next line or wrap the body in curly braces.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/if-newline': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
