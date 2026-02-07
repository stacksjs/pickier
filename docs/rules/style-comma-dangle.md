# style/comma-dangle

Require trailing commas in multiline constructs such as arrays, objects, function parameters, and destructuring patterns.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** Yes

## Examples

### Bad

```ts
const user = {
  name: 'Alice',
  age: 30
}

const colors = [
  'red',
  'green',
  'blue'
]

function greet(
  name: string,
  greeting: string
) {
  return `${greeting}, ${name}`
}
```

### Good

```ts
const user = {
  name: 'Alice',
  age: 30,
}

const colors = [
  'red',
  'green',
  'blue',
]

function greet(
  name: string,
  greeting: string,
) {
  return `${greeting}, ${name}`
}
```

## Details

The rule inspects each line that is followed by a closing bracket (`}`, `]`, or `)`). If the preceding line contains a value and does not already end with a trailing comma, a warning is reported.

The following cases are intentionally skipped and will not trigger the rule:

- Empty constructs where the previous line is just an opening bracket (`{`, `[`, `(`)
- Lines that are comments (`//`, `/*`, or `*`)
- Lines that end with an opening bracket (indicating a nested structure)
- Lines that end with `=>` (arrow function body follows)
- Lines that already have a trailing comma

## Auto-fix

When `--fix` is applied, the fixer appends a trailing comma to any line immediately before a closing bracket that is missing one. The comma is inserted at the end of the meaningful content on the line, preserving any trailing whitespace.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/comma-dangle': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
