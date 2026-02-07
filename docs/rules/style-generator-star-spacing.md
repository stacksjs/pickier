# style/generator-star-spacing

Enforce consistent spacing around the `*` in generator functions.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** Yes

## Examples

### Bad

```ts
// Space before * in function declarations
function *foo() {
  yield 1
}

function  *bar() {
  yield 2
}

// Missing space after * before function name
function*baz() {
  yield 3
}

// Missing space after * in method shorthand
const obj = {
  *myGenerator() {
    yield 1
  },
}

class MyClass {
  *generate() {
    yield 1
  }
}
```

### Good

```ts
// No space before *, space after * (before name)
function* foo() {
  yield 1
}

function* bar() {
  yield 2
}

// Anonymous generator (no space needed after * before paren)
const gen = function*() {
  yield 1
}

// Space after * in method shorthand
const obj = {
  * myGenerator() {
    yield 1
  },
}

class MyClass {
  * generate() {
    yield 1
  }
}
```

## Details

This rule enforces the following spacing conventions for the `*` in generator functions:

1. **No space before `*`** in `function*` declarations and expressions. The `*` should be attached directly to the `function` keyword: `function*`, not `function *`.
2. **Space after `*`** before the function name. Writing `function*foo()` is flagged; it should be `function* foo()`. An anonymous generator with `function*()` (no name, just a paren) is allowed.
3. **Space after `*`** in generator method shorthand (e.g., `* myMethod()` in class or object literal bodies).

Lines that are comments are skipped, and patterns inside strings or comments are ignored.

## Auto-fix

Running with `--fix` normalizes generator function spacing:

- Removes space between `function` and `*` (e.g., `function *` becomes `function*`)
- Adds a space after `*` before a function name (e.g., `function*foo` becomes `function* foo`)
- Adds a space after `*` in method shorthand (e.g., `*myMethod(` becomes `* myMethod(`)

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/generator-star-spacing': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
