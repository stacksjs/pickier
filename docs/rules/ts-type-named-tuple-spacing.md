# ts/type-named-tuple-spacing

Require a space after the colon in named tuple members.

- **Plugin:** ts
- **Default:** off
- **Auto-fix:** Yes

## Why

TypeScript named tuples use the syntax `[name: Type, ...]` to label each position. Omitting the space after the colon (e.g., `[name:Type]`) is inconsistent with the spacing convention used in all other TypeScript type annotations, where a space after `:` is standard. This rule enforces that consistency.

## Examples

### Bad

```ts
// missing space after colon
type Point = [x:number, y:number]

type Entry = [key:string, value:unknown]

type Range = [start:number, end:number, step?:number]

function process(...args: [name:string, age:number]): void {}
```

### Good

```ts
// space after colon
type Point = [x: number, y: number]

type Entry = [key: string, value: unknown]

type Range = [start: number, end: number, step?: number]

function process(...args: [name: string, age: number]): void {}
```

## Details

The rule scans for square bracket regions (`[...]`) on lines that appear to be in a type context. Within those regions, it looks for `identifier:Type` patterns where the colon is immediately followed by a non-space character.

The rule uses several heuristics to determine whether a line is a type context:

- Contains `type ` keyword
- Contains `: [` (type annotation with tuple)
- Contains `= [` (type alias assignment)
- Contains `as ` (type assertion)
- Contains generics with brackets (`<...[`)
- Contains `extends` or `implements`

This prevents false positives on regular array access patterns, object destructuring, and computed properties, which also use square brackets but are not tuple types.

The rule properly handles nested brackets, comments, and strings.

## Auto-fix

When `--fix` is used, the rule inserts a space after the colon in named tuple members within bracket regions on type-context lines.

**Before fix:**

```ts
type Point = [x:number, y:number]
type Entry = [key:string, value:unknown]
```

**After fix:**

```ts
type Point = [x: number, y: number]
type Entry = [key: string, value: unknown]
```

The fixer processes bracket regions from right to left to maintain correct string indices when inserting spaces.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'ts/type-named-tuple-spacing': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
