# style/array-bracket-spacing

Disallow spaces inside array brackets.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** Yes

## Examples

### Bad

```ts
const arr = [ 1, 2, 3 ]
const names = [ 'alice', 'bob' ]
const nested = [ [ 1, 2 ], [ 3, 4 ] ]
```

### Good

```ts
const arr = [1, 2, 3]
const names = ['alice', 'bob']
const nested = [[1, 2], [3, 4]]
```

## Details

This rule checks for spaces immediately after `[` and immediately before `]` in single-line array expressions. It reports a warning when there is a space or tab character directly after an opening bracket or directly before a closing bracket.

The following cases are ignored:

- Empty brackets `[]`
- Multiline arrays where `[` appears at the end of a line (the closing `]` is on a different line)
- Brackets found inside strings or comments

## Auto-fix

Running with `--fix` removes whitespace padding inside array brackets on the same line. For example, `[ 1, 2, 3 ]` becomes `[1, 2, 3]`. Multiline arrays are not affected.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/array-bracket-spacing': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
