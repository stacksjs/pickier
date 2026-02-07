# style/wrap-iife

Require parentheses around immediately invoked function expressions (IIFEs).

- **Plugin:** style
- **Default:** off
- **Auto-fix:** Yes

## Examples

### Bad

```ts
const result = function() { return 42 }()

const value = function(x) { return x * 2 }(21)

void function() { console.log('side effect') }()
```

### Good

```ts
const result = (function() { return 42 })()

const value = (function(x) { return x * 2 })(21)

void (function() { console.log('side effect') })()

// Arrow IIFEs with parens are fine
const x = (() => 42)()
```

## Details

The rule detects function expressions that are immediately invoked without being wrapped in parentheses. The pattern `function(){...}()` is flagged because the wrapping form `(function(){...})()` makes the intent clearer -- the reader immediately sees that the function is being called, not just declared.

The checker looks for `function(...){...}(` patterns where the `function` keyword is not already preceded by an opening parenthesis. If a wrapping `(` is present before `function`, the expression is considered properly wrapped.

## Auto-fix

When `--fix` is applied, the fixer wraps the function expression in parentheses. For example:

- `function() { return 42 }()` becomes `(function() { return 42 })()`
- `function(x) { return x * 2 }(21)` becomes `(function(x) { return x * 2 })(21)`

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/wrap-iife': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
