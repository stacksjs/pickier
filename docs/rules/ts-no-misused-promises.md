# ts/no-misused-promises

Disallow promises in places not designed to handle them, such as conditionals, logical expressions, and array callbacks.

- **Plugin:** ts
- **Default:** off
- **Auto-fix:** No

## Why

Promises are objects, and objects are always truthy in JavaScript. Using an unawaited promise in a conditional (`if`, `while`, ternary) will always evaluate to `true`, regardless of the eventual resolved value. Similarly, passing an `async` callback to `forEach` will not await the returned promises, leading to unexpected behavior where iterations complete before the async work finishes.

## Examples

### Bad

```ts
// promise in if condition -- always truthy
if (fetchData()) {
  console.log('This always runs')
}

// promise in logical expression
const result = loadConfig() && processConfig()

// promise in ternary
const value = getData() ? 'yes' : 'no'

// promise in while condition
while (checkAsync()) {
  // infinite loop -- condition is always truthy
}

// async callback in forEach -- does not await
items.forEach(async (item) => {
  await processItem(item)
})
```

### Good

```ts
// await the promise in the condition
if (await fetchData()) {
  console.log('Conditional on resolved value')
}

// await in logical expression
const result = await loadConfig() && processConfig()

// await in ternary
const value = (await getData()) ? 'yes' : 'no'

// await in while condition
while (await checkAsync()) {
  // properly re-evaluates each iteration
}

// use for...of with await instead of forEach
for (const item of items) {
  await processItem(item)
}

// or use Promise.all with map
await Promise.all(items.map(async (item) => {
  await processItem(item)
}))
```

## Details

The rule detects four categories of misused promises:

1. **Conditionals (`if`):** Flags async function calls inside `if (...)` conditions that are not preceded by `await`.

2. **Logical expressions (`&&`, `||`):** Flags async function calls used as operands in logical expressions without `await`.

3. **Ternary expressions:** Flags async function calls used in ternary conditions without `await`.

4. **Loop conditions (`while`, `for`):** Flags async function calls in loop conditions without `await`.

5. **`forEach` with async callback:** Flags `array.forEach(async (...) => ...)` because `forEach` ignores the returned promises, meaning iterations run concurrently without waiting for completion.

Async function detection is heuristic-based, matching function names containing common async-related patterns: `async`, `fetch`, `load`, `get`, `save`, and `Promise.*`.

Applies to files with extensions: `.ts`, `.tsx`.

## Auto-fix

This rule does not provide auto-fix. The correct fix depends on the intended logic -- sometimes adding `await` is correct, other times the code needs to be restructured entirely.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'ts/no-misused-promises': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
