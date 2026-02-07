# ts/no-top-level-await

Disallow top-level `await` statements in TypeScript and JavaScript files.

- **Plugin:** ts
- **Default:** error
- **Auto-fix:** No

## Why

Top-level `await` can cause issues in CommonJS modules, block module evaluation, and lead to unexpected execution order. It is only valid in ES modules and can cause problems in environments that do not fully support it. This rule flags any `await` expression that appears at the top level of a file (outside of any function, class, or block scope).

## Examples

### Bad

```ts
// top-level await blocks module loading
const data = await fetchData()

await initialize()

const config = await import('./config')
```

### Good

```ts
// wrap in an async function
async function main() {
  const data = await fetchData()
  await initialize()
}

main()

// or use .then()
fetchData().then(data => {
  console.log(data)
})

// for-await is allowed at top level (it implies its own scope)
for await (const item of stream) {
  process(item)
}
```

## Details

The rule uses a heuristic approach to detect top-level `await`:

- Tracks brace depth to determine whether code is at the top level (depth 0)
- Properly handles strings (single-quoted, double-quoted, and template literals), line comments, and block comments to avoid false positives
- Skips `for await` constructs, which are a separate language feature
- Checks word boundaries to avoid matching `await` inside identifiers

Applies to files with extensions: `.ts`, `.tsx`, `.mts`, `.cts`, `.js`, `.mjs`, `.cjs`.

## Auto-fix

This rule does not provide auto-fix. Top-level `await` removal requires restructuring the code (e.g., wrapping in an async IIFE or using `.then()` chains), which cannot be done automatically.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'ts/no-top-level-await': 'error',  // 'off' | 'warn' | 'error'
  },
}
```
