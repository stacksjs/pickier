# style/dot-location

Enforce the dot to appear on the same line as the property in chained method calls, rather than on the line of the object.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** Yes

## Examples

### Bad

```ts
promise.
  then(handleResult).
  catch(handleError)

const value = obj.
  property.
  method()
```

### Good

```ts
promise
  .then(handleResult)
  .catch(handleError)

const value = obj
  .property
  .method()
```

## Auto-fix

When `--fix` is used, the fixer removes the trailing dot from the end of the current line and prepends it to the beginning of the next line, preserving the next line's indentation. This produces the "dot on property line" style commonly used in chained calls.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/dot-location': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
