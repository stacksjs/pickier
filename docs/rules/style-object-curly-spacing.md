# style/object-curly-spacing

Require consistent spacing inside curly braces in object literals, destructuring assignments, and import/export declarations.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** Yes

## Examples

### Bad

```ts
const obj = {a: 1, b: 2}
const {name, age} = person
import {ref, computed} from 'vue'
export {helper, utils}
function process({input}) {
  return {result: input}
}
```

### Good

```ts
const obj = { a: 1, b: 2 }
const { name, age } = person
import { ref, computed } from 'vue'
export { helper, utils }
function process({ input }) {
  return { result: input }
}
```

## Details

This rule enforces spaces immediately after `{` and immediately before `}` in single-line object-like contexts. It reports:

- **Missing space after `{`** when a non-whitespace character directly follows the opening brace.
- **Missing space before `}`** when a non-whitespace character directly precedes the closing brace.

The following cases are intentionally allowed and not flagged:

- **Empty braces** `{}` -- no spaces required.
- **Template literal interpolation** `${}` -- template expressions are skipped.
- **Multi-line objects** -- only opening/closing braces on the same line as content are checked.

Lines that are entirely comments are skipped, and braces inside strings or comments are ignored.

## Auto-fix

When `--fix` is used, the fixer:

- Inserts a space after `{` when a non-whitespace character follows (except for empty braces `{}` and template literals `${}`).
- Inserts a space before `}` when a non-whitespace character precedes (except for `{` and `$`).

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/object-curly-spacing': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
