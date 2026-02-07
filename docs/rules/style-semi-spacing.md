# style/semi-spacing

Disallow spaces before semicolons and require spaces after semicolons in for-loop headers.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** Yes

## Examples

### Bad

```ts
const x = 1 ;
let y = 2 ;
for (let i = 0 ;i < 10 ;i++) {}
for (let i = 0;i < 10;i++) {}
```

### Good

```ts
const x = 1;
let y = 2;
for (let i = 0; i < 10; i++) {}
```

## Details

This rule enforces two spacing conventions around semicolons:

1. **No space before semicolons** -- A space immediately preceding a semicolon is flagged (unless the preceding content on the line is only whitespace).
2. **Space after semicolons in for-loop headers** -- When a semicolon appears on a line that contains multiple semicolons (typical of `for` loop headers), a missing space after the semicolon is flagged. Semicolons followed by `)` are allowed without a trailing space, since this covers patterns like `for (;;)`.

The rule skips lines that are entirely comments and ignores semicolons found inside strings or comments.

## Auto-fix

When `--fix` is used, the fixer:

- Removes any space immediately before a semicolon (` ;` becomes `;`).
- Inserts a space after a semicolon when a non-whitespace character directly follows (`;i` becomes `; i`), except when followed by another `;` or `)`.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/semi-spacing': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
