# style/no-trailing-spaces

Disallow trailing whitespace (spaces or tabs) at the end of lines.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** No

## Examples

### Bad

```
const x = 1
function foo() {
  return x
}
```

(Lines above have invisible trailing spaces or tabs after the visible code.)

### Good

```ts
const x = 1
function foo() {
  return x
}
```

## Details

This rule checks every line in the file for trailing whitespace characters (spaces and tabs) after the last non-whitespace character. Any line that ends with one or more whitespace characters is flagged.

Trailing whitespace is problematic because:
- It creates unnecessary noise in version control diffs.
- It can cause subtle issues with some tools and editors.
- It adds no semantic value to the code.

The column reported in the issue points to the start of the trailing whitespace.

## Auto-fix

This rule does not provide auto-fix. Configure your editor to trim trailing whitespace on save, or use the Pickier formatter which handles trailing whitespace removal as part of its formatting pass.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/no-trailing-spaces': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
