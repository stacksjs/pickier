# style/comma-style

Enforce comma-last style, requiring commas to appear at the end of the current line rather than at the beginning of the next line.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** Yes

## Examples

### Bad

```ts
const colors = [
  'red'
  , 'green'
  , 'blue'
]

const user = {
  name: 'Alice'
  , age: 30
  , role: 'admin'
}
```

### Good

```ts
const colors = [
  'red',
  'green',
  'blue',
]

const user = {
  name: 'Alice',
  age: 30,
  role: 'admin',
}
```

## Auto-fix

When `--fix` is used, the fixer moves leading commas to the end of the previous line. For example, a line starting with `, 'green'` becomes `'green'` while the preceding line gets a comma appended to it. The indentation of the current line is preserved.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/comma-style': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
