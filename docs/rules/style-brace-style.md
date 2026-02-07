# style/brace-style

Enforce consistent brace style for control flow blocks using the "one true brace style" (1TBS) convention.

- **Plugin:** style
- **Default:** warn
- **Auto-fix:** No

## Examples

### Bad

```ts
// Opening brace on its own line (Allman style)
if (condition)
{
  doSomething()
}

// Closing brace on same line as else (cuddled)
if (condition) {
  doSomething()
} else {
  doOther()
}

// Closing brace on same line as catch
try {
  riskyOperation()
} catch (e) {
  handleError(e)
}
```

### Good

```ts
// Opening brace on same line
if (condition) {
  doSomething()
}
else {
  doOther()
}

// Each block keyword on its own line
try {
  riskyOperation()
}
catch (e) {
  handleError(e)
}
finally {
  cleanup()
}
```

## Details

This rule enforces two aspects of the 1TBS brace style:

1. **Closing brace with subsequent block keyword**: The closing brace `}` must not appear on the same line as `else`, `catch`, or `finally`. Each of these keywords should start on a new line after the closing brace.

2. **Opening brace placement**: A lone `{` on its own line is flagged when the previous line suggests it should be on the same line (e.g., after `if (...)`, `function`, `for`, etc.). This does not flag braces that follow assignment operators (`=`), colons (`:`), commas (`,`), or opening parentheses/brackets, since those typically indicate object or array literals.

Issues from this rule are reported with severity `error`.

## Auto-fix

This rule does not provide auto-fix. Manually adjust brace placement to follow the 1TBS convention.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/brace-style': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
