# style/computed-property-spacing

Disallow spaces inside computed property brackets.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** Yes

## Examples

### Bad

```ts
const value = obj[ key ]
const item = arr[ index ]
const nested = obj[ 'property' ]
const dynamic = map[ getKey() ]
```

### Good

```ts
const value = obj[key]
const item = arr[index]
const nested = obj['property']
const dynamic = map[getKey()]
```

## Details

This rule checks for spaces immediately after `[` and immediately before `]` in computed property access expressions. It only targets bracket notation used for property access (where the `[` is preceded by an identifier, `)`, or `]`), so array literals and destructuring patterns are not affected.

The rule skips lines that are comments (`//`, `/*`, or lines starting with `*` inside block comments) and ignores brackets found inside strings or comments.

## Auto-fix

Running with `--fix` removes any whitespace padding inside computed property brackets. For example, `obj[ key ]` becomes `obj[key]` and `arr[ index ]` becomes `arr[index]`.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/computed-property-spacing': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
