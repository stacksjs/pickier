# style/no-multiple-empty-lines

Disallow more than one consecutive blank line, helping maintain consistent vertical spacing throughout the codebase.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** No

## Examples

### Bad

```ts
const a = 1


const b = 2



function foo() {
  return a + b
}
```

### Good

```ts
const a = 1

const b = 2

function foo() {
  return a + b
}
```

## Details

This rule counts consecutive empty (whitespace-only) lines. When more than one consecutive blank line is found, each extra blank line beyond the first is reported as an error. A maximum of one blank line is allowed between any two non-empty lines.

The rule checks the entire file, including blank lines at the top, between declarations, and at the bottom.

## Auto-fix

This rule does not provide auto-fix. Manually remove the extra blank lines so that no more than one consecutive blank line remains.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/no-multiple-empty-lines': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
