# style/block-spacing

Require consistent spacing inside single-line blocks.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** Yes

## Examples

### Bad

```ts
if (ok) {return true}
function foo() {return 'bar'}
const fn = () => {return x}
if (x) {doSomething()}
```

### Good

```ts
if (ok) { return true }
function foo() { return 'bar' }
const fn = () => { return x }
if (x) { doSomething() }
```

## Details

This rule enforces spaces immediately after `{` and immediately before `}` in single-line blocks -- blocks where the opening and closing braces appear on the same line with content between them.

The rule:

1. Finds each `{` on a line (skipping strings, comments, and template literal interpolation `${}`).
2. Locates the matching `}` on the same line by tracking brace depth.
3. If the block is single-line and non-empty, checks that:
   - The first character after `{` is a space or tab.
   - The last character before `}` is a space or tab.

Multi-line blocks (where `}` is on a different line) and empty blocks `{}` are not flagged. Only the first block on each line is checked.

## Auto-fix

When `--fix` is used, the fixer transforms single-line blocks that lack internal spacing:

- `{content}` becomes `{ content }` (spaces added on both sides).
- `{content }` becomes `{ content }` (space added after `{`).
- `{ content}` becomes `{ content }` (space added before `}`).

Template literal expressions `${}` are not modified.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/block-spacing': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
