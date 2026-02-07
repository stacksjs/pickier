# style/indent-binary-ops

Enforce consistent indentation of continuation lines that start with a binary operator in multiline expressions.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** Yes

## Examples

### Bad

```ts
// Continuation line not indented relative to the start of the expression
const result = a
+ b
+ c

// Over-indented continuation
const value = x
      === y

// Inconsistent indentation in a condition
if (
  longConditionA
&& longConditionB
    || longConditionC
) {
  doSomething()
}
```

### Good

```ts
// Continuation lines indented 2 spaces from the expression start
const result = a
  + b
  + c

const value = x
  === y

if (
  longConditionA
    && longConditionB
    || longConditionC
) {
  doSomething()
}

const flags = hasPermission
  && isEnabled
  && !isBlocked
```

## Details

The rule checks lines that begin with a binary operator and ensures they are indented exactly 2 spaces more than the "start line" of the expression. The start line is the nearest preceding line that does not itself begin with a binary operator (skipping blank lines and comments).

The following binary operators are recognized:

- **Comparison:** `===`, `!==`, `==`, `!=`, `>=`, `<=`, `>`, `<`
- **Logical:** `&&`, `||`, `??`
- **Arithmetic:** `+`, `-`, `*`, `/`, `%`, `**`
- **Bitwise:** `|`, `&`, `^`, `<<`, `>>`, `>>>`
- **Keyword:** `instanceof`, `in`

Lines inside strings or comments are ignored.

## Auto-fix

When `--fix` is applied, the fixer re-indents each continuation line to be exactly 2 spaces more than the indentation of the start line. The content of the line is preserved; only the leading whitespace is adjusted.

For example, with a start line indented at 0 spaces:

```ts
// Before
const x = a
+ b
      + c

// After
const x = a
  + b
  + c
```

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/indent-binary-ops': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
