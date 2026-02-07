# style/space-in-parens

Disallow spaces inside parentheses.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** Yes

## Examples

### Bad

```ts
const result = foo( bar )
if ( condition ) {
  doSomething( arg1, arg2 )
}
const total = ( a + b ) * c
```

### Good

```ts
const result = foo(bar)
if (condition) {
  doSomething(arg1, arg2)
}
const total = (a + b) * c
```

## Details

This rule checks for spaces immediately after `(` and immediately before `)`. It flags any occurrence where a space character appears directly inside parentheses, whether in function calls, conditionals, grouping expressions, or any other parenthesized construct.

The following cases are ignored:

- Empty parentheses `()`
- Parentheses at the end of a line (opening paren with nothing after it)
- Parentheses found inside strings or comments

## Auto-fix

Running with `--fix` removes whitespace padding inside parentheses. For example, `foo( bar )` becomes `foo(bar)` and `( a + b )` becomes `(a + b)`.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/space-in-parens': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
