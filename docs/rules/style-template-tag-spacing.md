# style/template-tag-spacing

Disallow spaces between a tag function and its template literal.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** Yes

## Examples

### Bad

```ts
const result = html `<div>${content}</div>`
const query = sql `SELECT * FROM users`
const styles = css `color: red;`
const highlighted = chalk.red `Error!`
```

### Good

```ts
const result = html`<div>${content}</div>`
const query = sql`SELECT * FROM users`
const styles = css`color: red;`
const highlighted = chalk.red`Error!`
```

## Details

This rule flags any space between an identifier (tag function) and the opening backtick of a template literal. Tagged template literals should have the tag function directly adjacent to the template with no whitespace in between.

The following are excluded from checks:

- **Keywords that can precede template literals without being tags**: `return`, `case`, `typeof`, `void`, `delete`, `throw`, `new`, `in`, `of`, `await`, `yield`, `export`, `default`, `extends`, `else`, `instanceof`. These keywords may naturally appear before a template literal without being a tag function.

Lines that are comments are skipped, and identifiers inside strings or comments are ignored.

## Auto-fix

Running with `--fix` removes the space between the tag function and the template literal backtick. For example, `` html `<div>` `` becomes `` html`<div>` ``. Fixes are applied from right to left within each line to preserve character positions.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/template-tag-spacing': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
