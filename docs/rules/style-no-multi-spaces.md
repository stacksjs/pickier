# style/no-multi-spaces

Disallow multiple consecutive spaces in code, excluding indentation.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** No

## Examples

### Bad

```ts
const x  = 1

foo(a,  b, c)

if (condition)  doSomething()

const name  =  'Alice'
```

### Good

```ts
const x = 1

foo(a, b, c)

if (condition) doSomething()

const name = 'Alice'
```

## Details

This rule scans each line of code and flags occurrences of two or more consecutive space characters that appear after indentation. Leading whitespace (indentation) is not checked, only spaces within the code portion of the line.

The rule avoids false positives in the following cases:
- **String literals**: Multiple spaces inside single-quoted, double-quoted, or backtick strings are ignored.
- **Comments**: Multiple spaces inside `//` line comments or `/* */` block comments are ignored.

Each occurrence of multiple consecutive spaces is reported individually with the column pointing to the start of the extra spaces.

## Auto-fix

This rule does not provide auto-fix. Manually reduce multiple spaces to a single space.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/no-multi-spaces': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
