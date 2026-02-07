# style/arrow-spacing

Require consistent spacing before and after the `=>` arrow in arrow functions.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** Yes

## Examples

### Bad

```ts
const fn = (x)=> x + 1
const add = (a, b)=>a + b
const greet = (name)=> {
  return `Hello, ${name}`
}
const double = (n) =>n * 2
```

### Good

```ts
const fn = (x) => x + 1
const add = (a, b) => a + b
const greet = (name) => {
  return `Hello, ${name}`
}
const double = (n) => n * 2
```

## Details

This rule enforces that the fat arrow (`=>`) in arrow function expressions is surrounded by spaces on both sides. It checks each occurrence of `=>` in non-comment, non-string contexts and reports:

- A missing space **before** `=>` when the preceding character is not whitespace.
- A missing space **after** `=>` when the following character is not whitespace or a newline.

Lines that are entirely comments (`//`, `/*`, `*`-prefixed lines) are skipped. Occurrences of `=>` inside strings or comments within a line are also ignored.

## Auto-fix

When `--fix` is used, the fixer:

- Inserts a space before `=>` when a non-whitespace character directly precedes it (e.g., `x=>` becomes `x =>`).
- Inserts a space after `=>` when a non-whitespace character directly follows it (e.g., `=>x` becomes `=> x`).

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/arrow-spacing': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
