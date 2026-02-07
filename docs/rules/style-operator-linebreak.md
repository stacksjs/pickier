# style/operator-linebreak

Enforce operators to appear at the beginning of continued lines rather than at the end of the previous line.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** Yes

## Examples

### Bad

```ts
const result = a &&
  b

const sum = value1 +
  value2 +
  value3

const check = foo ||
  bar
```

### Good

```ts
const result = a
  && b

const sum = value1
  + value2
  + value3

const check = foo
  || bar
```

## Details

This rule checks for binary and logical operators (`&&`, `||`, `??`, `+`, `-`, `*`, `/`, `%`, `**`, `|`, `&`, `^`, `<<`, `>>`, `>>>`) at the end of a line when the expression continues on the next line. Ternary operators (`?` and `:`) are intentionally excluded from this rule -- see `style/multiline-ternary` for ternary formatting.

The rule skips lines that are comments and avoids false positives for operators inside string literals or comments.

## Auto-fix

When `--fix` is used, the fixer removes the trailing operator from the end of the current line and prepends it to the beginning of the next line, preserving indentation. For example, `a &&` on one line and `b` on the next becomes `a` and `&& b`.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/operator-linebreak': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
