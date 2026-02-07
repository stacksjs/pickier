# style/quote-props

Remove unnecessary quotes from object property keys when the key is a valid JavaScript identifier.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** Yes

## Examples

### Bad

```ts
const obj = {
  'name': 'Alice',
  "age": 30,
  'isActive': true,
  'onClick': handleClick,
}
```

### Good

```ts
const obj = {
  name: 'Alice',
  age: 30,
  isActive: true,
  onClick: handleClick,
}

// Quotes are required for non-identifier keys
const config = {
  'content-type': 'application/json',
  'max-age': 3600,
  '0invalid': true,
}

// Quotes are preserved for reserved words
const reserved = {
  'class': 'container',
  'return': true,
  'import': './module',
}
```

## Details

The rule checks each object property key and reports a warning when the key is quoted (`'key'` or `"key"`) but the key name is a valid JavaScript identifier that does not require quotes.

Keys that are **not flagged** include:

- Keys containing hyphens, spaces, or other special characters (e.g., `'content-type'`)
- Keys that start with a digit (e.g., `'0invalid'`)
- JavaScript reserved words such as `class`, `return`, `function`, `var`, `let`, `const`, `delete`, `typeof`, `void`, `in`, `instanceof`, `new`, `this`, `throw`, `try`, `catch`, `finally`, `switch`, `case`, `default`, `break`, `continue`, `do`, `while`, `for`, `if`, `else`, `with`, `import`, `export`, `extends`, `super`, `yield`, `await`, `enum`, `implements`, `interface`, `package`, `private`, `protected`, `public`, and `static`
- Lines inside comments

## Auto-fix

When `--fix` is applied, the fixer removes the surrounding quotes from property keys that are valid identifiers and not reserved words. For example, `'name': 'Alice'` becomes `name: 'Alice'`.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/quote-props': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
