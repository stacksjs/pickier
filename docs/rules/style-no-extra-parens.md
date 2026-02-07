# style/no-extra-parens

Remove redundant parentheses around simple expressions in `return` statements.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** Yes

## Examples

### Bad

```ts
function getName() {
  return (name)
}

function getCount() {
  return (count)
}

function getValue() {
  return (42)
}

function isReady() {
  return (true)
}

function getDefault() {
  return (null)
}

function getLabel() {
  return ('hello')
}
```

### Good

```ts
function getName() {
  return name
}

function getCount() {
  return count
}

function getValue() {
  return 42
}

function isReady() {
  return true
}

// Parentheses around complex expressions are allowed
function getResult() {
  return (a + b)
}

// Parentheses around object literals are necessary
function getObj() {
  return ({ key: 'value' })
}

// Parentheses around JSX or ternaries may be kept
function render() {
  return (condition ? a : b)
}
```

## Details

The rule detects `return (expr)` statements where the inner expression is simple enough that the parentheses serve no purpose. An expression is considered "simple" if it is one of:

- An identifier or member access expression (e.g., `name`, `obj.prop`, `arr[0]`)
- A string literal (starting with `'`, `"`, or `` ` ``)
- A numeric literal (starting with a digit)
- A boolean literal (`true` or `false`)
- `null` or `undefined`

Complex expressions involving operators, function calls, or nested parentheses are not flagged, since parentheses around those may improve readability or are syntactically necessary.

## Auto-fix

When `--fix` is applied, the fixer removes the outer parentheses from the return value. For example, `return (name)` becomes `return name`. The original indentation and optional semicolon are preserved.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/no-extra-parens': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
