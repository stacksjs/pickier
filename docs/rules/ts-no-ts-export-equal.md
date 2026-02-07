# ts/no-ts-export-equal

Disallow `exports =` syntax in TypeScript files; prefer ESM `export default`.

- **Plugin:** ts
- **Default:** off
- **Auto-fix:** No

## Why

The `exports =` pattern is a CommonJS convention that does not align with modern ESM (ECMAScript Module) syntax. TypeScript supports `export default` and named exports, which are the standard in modern JavaScript. Using `exports =` ties your code to the CommonJS module system and makes it harder to tree-shake, statically analyze, and interoperate with ESM consumers.

## Examples

### Bad

```ts
// CommonJS-style exports
exports = { foo, bar }

exports = MyClass

exports = function handler() {
  // ...
}
```

### Good

```ts
// ESM default export
export default { foo, bar }

export default MyClass

export default function handler() {
  // ...
}

// Named exports
export { foo, bar }
export function handler() {
  // ...
}
```

## Details

The rule scans each line of TypeScript files for the pattern `exports =` (with optional whitespace around the `=`). It strips comments before checking, so `exports =` inside comments will not trigger a warning.

Applies to files with extensions: `.ts`, `.tsx`, `.mts`, `.cts`, `.d.ts`.

## Auto-fix

This rule does not provide auto-fix. Migrating from `exports =` to ESM exports requires understanding the module's API surface and how consumers import it, which cannot be reliably automated.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'ts/no-ts-export-equal': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
