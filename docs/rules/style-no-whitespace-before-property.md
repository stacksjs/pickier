# style/no-whitespace-before-property

Disallow whitespace before `.` or `?.` in property access expressions.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** Yes

## Examples

### Bad

```ts
const name = user .name
const id = obj .id
const value = response .data .value
const safe = user ?.profile
const nested = obj ?.nested ?.deep
```

### Good

```ts
const name = user.name
const id = obj.id
const value = response.data.value
const safe = user?.profile
const nested = obj?.nested?.deep
```

## Details

This rule flags any whitespace between an expression and a `.` or `?.` used for property access on the same line. It checks both regular dot notation (`.property`) and optional chaining (`?.property`).

The following are excluded from checks:

- **Spread operators**: Patterns involving `..` or `...` are not flagged.
- **Strings and comments**: Dots inside string literals or comments are ignored.
- **Comment lines**: Lines starting with `//`, `/*`, or `*` (inside block comments) are skipped entirely.

Note that this rule only checks whitespace within a single line. Multi-line method chaining where `.` appears at the start of a new line is not affected.

## Auto-fix

Running with `--fix` removes whitespace between the expression and the property access operator. For example, `user .name` becomes `user.name` and `obj ?.value` becomes `obj?.value`. The fixer handles both `.` and `?.` operators and avoids modifying spread operators.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/no-whitespace-before-property': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
