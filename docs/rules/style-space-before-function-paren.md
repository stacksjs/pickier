# style/space-before-function-paren

Control spacing before the opening parenthesis in function declarations and expressions.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** Yes

## Examples

### Bad

```ts
// Named function with a space before parenthesis
function greet () {
  return 'hello'
}

// Anonymous function without a space before parenthesis
const fn = function() {
  return true
}

// Method-style
const obj = {
  method () {
    return 42
  },
}
```

### Good

```ts
// Named function: no space before parenthesis
function greet() {
  return 'hello'
}

// Anonymous function: space before parenthesis
const fn = function () {
  return true
}

// These are fine
const arrow = () => {}
class Foo {
  method() {}
}
```

## Details

This rule enforces two conventions simultaneously:

1. **Named functions** should have **no space** between the function name and the opening parenthesis: `function foo()` is correct, `function foo ()` is not.
2. **Anonymous functions** should have **a space** between the `function` keyword and the opening parenthesis: `function ()` is correct, `function()` is not.

Occurrences inside strings or comments are ignored.

## Auto-fix

When `--fix` is applied, the fixer performs two transformations:

- Removes the extra space before `(` in named function declarations (e.g., `function foo ()` becomes `function foo()`)
- Adds a space before `(` in anonymous function expressions (e.g., `function()` becomes `function ()`)

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/space-before-function-paren': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
