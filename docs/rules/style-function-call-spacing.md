# style/function-call-spacing

Disallow spaces between a function name and the opening parenthesis in function calls.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** Yes

## Examples

### Bad

```ts
console.log ('hello')
myFunction (arg1, arg2)
arr.map (item => item.id)
obj.method ()
doSomething (a, b, c)
```

### Good

```ts
console.log('hello')
myFunction(arg1, arg2)
arr.map(item => item.id)
obj.method()
doSomething(a, b, c)
```

## Details

This rule flags any space between an identifier and an opening parenthesis `(` when the identifier represents a function call. It distinguishes function calls from other constructs by excluding:

- **Language keywords**: `if`, `for`, `while`, `switch`, `catch`, `function`, `return`, `typeof`, `void`, `delete`, `throw`, `new`, `await`, `class`, `import`, `export`, `yield`, `async`, `super`, `this`, and others that naturally have a space before `(`.
- **Function declarations**: Identifiers preceded by the `function` or `function*` keyword.
- **Getter/setter definitions**: Identifiers preceded by `get` or `set` keywords.

Lines that are comments are skipped, and identifiers inside strings or comments are ignored.

## Auto-fix

Running with `--fix` removes the space between the function name and the opening parenthesis. For example, `myFunction (arg)` becomes `myFunction(arg)`. Fixes are applied from right to left within each line to preserve character positions.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/function-call-spacing': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
