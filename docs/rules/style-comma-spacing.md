# style/comma-spacing

Require a space after commas and disallow spaces before commas.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** Yes

## Examples

### Bad

```ts
const arr = [1,2,3]
function foo(a,b,c) {}
const obj = { x: 1,y: 2 }
import { ref,computed } from 'vue'
const [first ,second] = items
foo(a ,b ,c)
```

### Good

```ts
const arr = [1, 2, 3]
function foo(a, b, c) {}
const obj = { x: 1, y: 2 }
import { ref, computed } from 'vue'
const [first, second] = items
foo(a, b, c)
```

## Details

This rule enforces two spacing conventions around commas:

1. **No space before commas** -- A space immediately preceding a comma is flagged (unless the entire preceding content on the line is whitespace/indentation).
2. **Space after commas** -- A comma must be followed by a space or tab. Commas at the end of a line (trailing commas) are allowed without a following space.

The rule skips lines that are entirely comments and ignores commas found inside strings or comments.

## Auto-fix

When `--fix` is used, the fixer:

- Removes any space immediately before a comma (` ,` becomes `,`).
- Inserts a space after a comma when a non-whitespace character directly follows (`,x` becomes `, x`).

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/comma-spacing': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
