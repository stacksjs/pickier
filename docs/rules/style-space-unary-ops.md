# style/space-unary-ops

Require spaces after word unary operators and disallow spaces after symbol unary operators.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** Yes

## Examples

### Bad

```ts
// Missing space after word operators
const type = typeof"hello"
const removed = delete(obj.key)
const undef = void(0)

// Unexpected space after symbol operators
const negated = ! condition
const complement = ~ bitmask
```

### Good

```ts
// Word operators followed by a space
const type = typeof "hello"
const removed = delete obj.key
const undef = void 0

// Symbol operators with no space
const negated = !condition
const complement = ~bitmask
```

## Details

This rule enforces consistent spacing around unary operators. It distinguishes between two categories:

**Word operators** (require a space after): `typeof`, `void`, `delete`, `new`, `throw`, `yield`, `await`

**Symbol operators** (no space after): `!`, `~`

For the `!` operator, the rule checks that it is used in a unary context (preceded by an operator character, keyword like `return` or `case`, or at the start of an expression) before flagging a space after it.

Lines that are comments are skipped, and operators inside strings or comments are ignored.

## Auto-fix

Running with `--fix` adds a space after word unary operators where missing (e.g., `typeof"hello"` becomes `typeof "hello"`) and removes spaces after `!` and `~` symbol operators (e.g., `! condition` becomes `!condition`).

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/space-unary-ops': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
