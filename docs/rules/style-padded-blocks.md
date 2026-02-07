# style/padded-blocks

Disallow empty lines immediately after an opening brace or immediately before a closing brace in blocks.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** Yes

## Examples

### Bad

```ts
function foo() {

  return 'bar'

}

if (condition) {

  doSomething()

}

class MyClass {

  method() {
    return true
  }

}
```

### Good

```ts
function foo() {
  return 'bar'
}

if (condition) {
  doSomething()
}

class MyClass {
  method() {
    return true
  }
}
```

## Auto-fix

When `--fix` is used, the fixer removes empty lines that appear directly after an opening brace `{` and directly before a closing brace `}`. Both types of padding are removed in a single pass.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/padded-blocks': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
