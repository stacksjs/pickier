# style/space-before-blocks

Require a space before the opening brace of blocks.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** Yes

## Examples

### Bad

```ts
if (ok){
  // ...
}

function foo(){
  return true
}

class Bar{
  // ...
}

for (const item of list){
  // ...
}

while (running){
  // ...
}

try{
  // ...
} catch (e){
  // ...
}
```

### Good

```ts
if (ok) {
  // ...
}

function foo() {
  return true
}

class Bar {
  // ...
}

for (const item of list) {
  // ...
}

while (running) {
  // ...
}

try {
  // ...
} catch (e) {
  // ...
}
```

## Details

This rule requires a space before the opening brace `{` of a block when the brace is preceded by `)` or a word character (`a-z`, `A-Z`, `0-9`, `_`). These are the typical positions where a block begins: after a function signature, a control-flow condition, a class name, etc.

The following cases are intentionally **not** flagged:

- **Template literals** -- `${` is skipped.
- **Object literals after `=`, `:`, `(`, `,`, `[`** -- these are value contexts, not block contexts.
- **Nested braces** -- `{{` is allowed without extra spacing.

Lines that are entirely comments are skipped, and braces inside strings or comments are ignored.

## Auto-fix

When `--fix` is used, the fixer inserts a space before `{` wherever it is directly preceded by `)` or a word character. For example:

- `if (ok){` becomes `if (ok) {`
- `function foo(){` becomes `function foo() {`
- `class Bar{` becomes `class Bar {`

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/space-before-blocks': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
