# style/no-mixed-operators

Disallow mixing logical and bitwise operators of different precedence without clarifying parentheses.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** No

## Examples

### Bad

```ts
// Mixing && and ||
const a = foo && bar || baz

// Mixing || and ??
const b = foo || bar ?? defaultValue

// Mixing && and ??
const c = foo && bar ?? fallback

// Mixing bitwise & and |
const d = flags & MASK | FLAG

// Mixing bitwise & and ^
const e = a & b ^ c

// Mixing bitwise | and ^
const f = a | b ^ c
```

### Good

```ts
// Parentheses clarify grouping with && and ||
const a = (foo && bar) || baz
const a2 = foo && (bar || baz)

// Parentheses clarify grouping with || and ??
const b = (foo || bar) ?? defaultValue

// Parentheses clarify grouping with && and ??
const c = (foo && bar) ?? fallback

// Parentheses clarify grouping with bitwise operators
const d = (flags & MASK) | FLAG
const e = (a & b) ^ c
const f = a | (b ^ c)

// Same-type operators are fine without extra parens
const g = a && b && c
const h = a || b || c
const i = a ?? b ?? c
```

## Details

The rule identifies lines where two different operator groups are used together without parentheses to clarify the intended precedence. The following combinations are flagged:

| Mix | Example |
|---|---|
| `&&` and `\|\|` | `a && b \|\| c` |
| `&&` and `??` | `a && b ?? c` |
| `\|\|` and `??` | `a \|\| b ?? c` |
| `&` (bitwise) and `\|` (bitwise) | `a & b \| c` |
| `&` (bitwise) and `^` (bitwise) | `a & b ^ c` |
| `\|` (bitwise) and `^` (bitwise) | `a \| b ^ c` |

The rule uses parenthesis depth tracking to determine whether the different operator groups are already separated by parentheses. If one group of operators is nested at a deeper parenthesis level than the other, the expression is considered properly clarified and is not flagged.

Occurrences inside strings or comments are ignored.

## Auto-fix

This rule does not provide auto-fix. The intended grouping is ambiguous, so the developer must add parentheses manually to clarify the desired precedence.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/no-mixed-operators': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
