# style/switch-colon-spacing

Enforce spacing around colons in switch case and default clauses.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** Yes

## Examples

### Bad

```ts
switch (action) {
  case 'increment' :
    return count + 1
  case 'decrement' :
    return count - 1
  default :
    return count
}

switch (status) {
  case 200:return 'OK'
  case 404:return 'Not Found'
  default:return 'Unknown'
}
```

### Good

```ts
switch (action) {
  case 'increment':
    return count + 1
  case 'decrement':
    return count - 1
  default:
    return count
}

switch (status) {
  case 200: return 'OK'
  case 404: return 'Not Found'
  default: return 'Unknown'
}
```

## Details

This rule enforces two spacing conventions for colons in `case` and `default` clauses within `switch` statements:

1. **No space before the colon.** Writing `case 'value' :` is flagged; it should be `case 'value':`.
2. **A space after the colon when content follows on the same line.** Writing `case 200:return` is flagged; it should be `case 200: return`. If the colon is at the end of the line (with statements on the next line), no space is required.

## Auto-fix

Running with `--fix` removes spaces before colons in case/default clauses and adds a space after the colon when a non-whitespace character immediately follows it. For example, `case 'a' :` becomes `case 'a':` and `case 1:doSomething()` becomes `case 1: doSomething()`.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/switch-colon-spacing': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
