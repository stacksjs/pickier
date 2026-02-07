# ts/prefer-nullish-coalescing

Prefer the nullish coalescing operator (`??`) over logical OR (`||`) for providing default values.

- **Plugin:** ts
- **Default:** off
- **Auto-fix:** Yes

## Why

The logical OR operator (`||`) returns the right-hand operand when the left-hand operand is any falsy value: `false`, `0`, `""` (empty string), `null`, `undefined`, or `NaN`. This causes unintended behavior when `0`, `""`, or `false` are valid values. The nullish coalescing operator (`??`) only falls through on `null` or `undefined`, making it the safer choice for default value patterns.

## Examples

### Bad

```ts
// || treats 0, '', and false as "missing"
const port = config.port || 3000       // 0 becomes 3000
const name = user.name || 'Anonymous'  // '' becomes 'Anonymous'
const enabled = opts.flag || true      // false becomes true

const timeout = getTimeout() || 5000
const label = props.label || 'default'
```

### Good

```ts
// ?? only falls through on null/undefined
const port = config.port ?? 3000       // 0 stays 0
const name = user.name ?? 'Anonymous'  // '' stays ''
const enabled = opts.flag ?? true      // false stays false

const timeout = getTimeout() ?? 5000
const label = props.label ?? 'default'
```

## Details

The rule flags `||` expressions where the pattern looks like a default-value assignment:

- The left operand is a simple variable, property access, or function call (e.g., `config.port`, `getValue()`)
- The right operand is a literal value, object, or variable (e.g., `3000`, `'default'`, `fallback`)

The rule skips `||` when:

- The left operand contains comparison operators (`<`, `>`, `!`, `=`), since these are boolean expressions where `||` is semantically correct
- The left operand is a boolean literal (`true`/`false`)
- The right operand does not look like a default value

The rule handles comments and string literals to avoid false positives, and correctly tracks nested parentheses, braces, and brackets when analyzing operands.

Applies to files with extensions: `.ts`, `.tsx`.

## Auto-fix

When `--fix` is used, the rule replaces `||` with `??` in simple `identifier || defaultValue` patterns. It does not replace `||` when the right-hand side is a boolean literal, to avoid changing the semantics of boolean logic.

**Before fix:**

```ts
const port = config.port || 3000
const name = user.name || 'Anonymous'
```

**After fix:**

```ts
const port = config.port ?? 3000
const name = user.name ?? 'Anonymous'
```

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'ts/prefer-nullish-coalescing': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
