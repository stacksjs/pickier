# style/no-tabs

Disallow tab characters in source code when the project is configured to use spaces for indentation.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** Yes

## Examples

### Bad

```
// Indentation uses tabs (shown as arrows)
function foo() {
→ const x = 1
→ → return x
}
```

### Good

```ts
// Indentation uses spaces
function foo() {
  const x = 1
  return x
}
```

## Details

This rule flags any line that contains a tab character (`\t`), reporting the column of the first tab found on each line. It is designed for projects that use spaces for indentation.

When the project configuration explicitly sets `format.indentStyle` to `'tabs'`, this rule is automatically skipped and produces no warnings. This prevents false positives in projects that intentionally use tab-based indentation.

The rule checks for tabs anywhere on the line, not just in the leading indentation -- tabs used for alignment within a line of code are also flagged.

## Auto-fix

When `--fix` is used, the fixer replaces every tab character in the file with spaces. The number of spaces per tab is determined by the `format.indent` configuration value (defaulting to 2 spaces). All tabs in the file are replaced in a single pass.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/no-tabs': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
