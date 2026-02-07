# style/rest-spread-spacing

Disallow spaces between the spread/rest operator (`...`) and its operand.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** Yes

## Examples

### Bad

```ts
const copy = [... arr]
const merged = { ... obj1, ... obj2 }
function foo(... args) {}
const [first, ... rest] = items
const result = fn(... params)
```

### Good

```ts
const copy = [...arr]
const merged = { ...obj1, ...obj2 }
function foo(...args) {}
const [first, ...rest] = items
const result = fn(...params)
```

## Details

This rule flags any occurrence of `...` (the spread or rest operator) followed by one or more spaces before an identifier, array literal, or object literal. The spread/rest operator should be directly adjacent to its operand with no intervening whitespace.

The rule matches `...` followed by whitespace and then an identifier character (`a-z`, `A-Z`, `_`, `$`). Lines that are entirely comments are skipped, and occurrences inside strings or comments are ignored.

## Auto-fix

When `--fix` is used, the fixer removes all whitespace between `...` and the following operand. It handles operands that start with an identifier character, `[`, or `{`. For example:

- `... arr` becomes `...arr`
- `... obj` becomes `...obj`
- `... [a, b]` becomes `...[a, b]`
- `... { x }` becomes `...{ x }`

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/rest-spread-spacing': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
