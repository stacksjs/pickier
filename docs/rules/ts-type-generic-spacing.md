# ts/type-generic-spacing

Disallow spaces inside generic type angle brackets.

- **Plugin:** ts
- **Default:** off
- **Auto-fix:** Yes

## Why

Spaces inside generic angle brackets (`< >`) are unconventional in TypeScript and reduce readability by visually separating the type name from its type parameters. The standard convention is to write generics without internal spacing: `Array<string>`, not `Array< string >`.

## Examples

### Bad

```ts
// space after <
const items: Array< string> = []

// space before >
const map: Map<string, number > = new Map()

// spaces on both sides
type Result = Promise< string >

// in function signatures
function identity< T >(value: T): T {
  return value
}

// in class declarations
class Container< T > {
  value: T
}
```

### Good

```ts
// no spaces inside angle brackets
const items: Array<string> = []

const map: Map<string, number> = new Map()

type Result = Promise<string>

function identity<T>(value: T): T {
  return value
}

class Container<T> {
  value: T
}

// arrow functions with extends are fine
const fn = <T extends string>(value: T) => value

// nested generics
type Deep = Map<string, Array<Promise<number>>>
```

## Details

The rule checks for two spacing violations:

1. **Space after `<`:** Detects patterns like `TypeName< T` where there is whitespace after the opening angle bracket in a generic position. The rule identifies generic positions by looking for an identifier immediately before `<`.

2. **Space before `>`:** Detects patterns like `T >` where there is whitespace before the closing angle bracket. It uses a heuristic to confirm the `>` is a generic close (not a comparison operator) by checking that a matching `<` preceded by an identifier exists earlier on the same line. The rule also excludes `=>` (arrow functions) from matching.

The rule skips comment lines and avoids matching inside strings or comments.

## Auto-fix

When `--fix` is used, the rule removes spaces after `<` and before `>` in generic type positions.

**Before fix:**

```ts
const items: Array< string > = []
function identity< T >(value: T): T {}
type Result = Promise< number >
```

**After fix:**

```ts
const items: Array<string> = []
function identity<T>(value: T): T {}
type Result = Promise<number>
```

The fixer preserves `=>` arrow syntax and only removes spaces when there is an identifier before the opening `<`.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'ts/type-generic-spacing': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
