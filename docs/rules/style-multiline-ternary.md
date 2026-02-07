# style/multiline-ternary

Enforce consistent formatting of multiline ternary expressions by requiring the `:` operator to appear at the start of its line.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** No

## Examples

### Bad

```ts
const value = condition
  ? 'yes' : 'no'

const result = isReady
  ? doSomething()
  : isAlmostReady ? doSomethingElse()
  : fallback()
```

### Good

```ts
const value = condition
  ? 'yes'
  : 'no'

const result = isReady
  ? doSomething()
  : isAlmostReady
    ? doSomethingElse()
    : fallback()
```

## Details

This rule only applies to multiline ternary expressions -- single-line ternaries like `const x = a ? b : c` are not flagged. When a ternary spans multiple lines, the rule checks that the `:` operator is placed at the beginning of its line rather than appearing in the middle of a line alongside other code.

The rule correctly handles:
- Optional chaining (`?.`) -- not confused with ternary `?`
- Nullish coalescing (`??`) -- not confused with ternary `?`
- Key-value pairs (`key: value`) and `case:` labels -- not confused with ternary `:`
- Operators inside string literals and comments

## Auto-fix

This rule does not provide auto-fix. Manually move the `:` operator to the beginning of its own line.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/multiline-ternary': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
