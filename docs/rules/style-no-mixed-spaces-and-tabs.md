# style/no-mixed-spaces-and-tabs

Disallow mixing spaces and tabs within the indentation of a single line.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** No

## Examples

### Bad

```
// Leading whitespace mixes spaces and tabs
function foo() {
 → const x = 1      // space then tab
→  return x         // tab then space
}
```

### Good

```ts
// Consistent space indentation
function foo() {
  const x = 1
  return x
}

// Consistent tab indentation
function foo() {
→ const x = 1
→ return x
}
```

## Details

This rule examines only the leading whitespace (indentation) of each line. If the indentation contains both space and tab characters on the same line, a warning is reported. Lines with no indentation or indentation using only one type of whitespace character are not flagged.

The rule does not check whitespace within the code portion of a line (after the first non-whitespace character), only the indentation prefix.

## Auto-fix

This rule does not provide auto-fix, because it is ambiguous whether the project intends to use spaces or tabs. Choose one style and configure your editor accordingly. For tab-to-space conversion, see the `style/no-tabs` rule which does provide auto-fix.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/no-mixed-spaces-and-tabs': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
