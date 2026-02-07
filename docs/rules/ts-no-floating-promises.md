# ts/no-floating-promises

Require promises to be awaited, returned, or handled with `.catch()`.

- **Plugin:** ts
- **Default:** off
- **Auto-fix:** No

## Why

A "floating" promise is one that is created but not handled -- it is not awaited, not returned, and has no `.catch()` handler. If the promise rejects, the error will be silently swallowed or cause an unhandled promise rejection, which can crash Node.js processes. This rule ensures that every promise-returning call is explicitly handled.

## Examples

### Bad

```ts
// floating promise -- rejection is unhandled
fetchData()

// async function call without await
asyncInit()

// Promise constructor without handling
new Promise((resolve) => resolve(42))

// Promise static methods without handling
Promise.resolve(42)
Promise.all([task1(), task2()])
```

### Good

```ts
// awaited
await fetchData()

// returned from a function
function init() {
  return asyncInit()
}

// .catch() for error handling
fetchData().catch(handleError)

// .then().catch() chain
fetchData()
  .then(process)
  .catch(handleError)

// .finally() for cleanup
fetchData().finally(cleanup)

// assigned to a variable for later use
const promise = fetchData()

// explicitly marked as fire-and-forget
void asyncInit()
```

## Details

The rule uses heuristics to detect floating promises based on common async patterns:

- **Known async functions:** Calls to functions named with common async prefixes/suffixes like `fetch`, `load`, `get`, `post`, `put`, `delete`, `save`, `update`, or containing `async`/`Async` in their name
- **Promise constructors:** `new Promise(...)`
- **Promise static methods:** `Promise.resolve()`, `Promise.reject()`, `Promise.all()`, `Promise.allSettled()`, `Promise.race()`, `Promise.any()`
- **HTTP clients:** Direct calls to `fetch()`, `axios()`, `request()`

A promise call is considered "handled" if it:

- Is preceded by `await`, `return`, or `void`
- Has `.then()`, `.catch()`, or `.finally()` chained on it
- Is assigned to a variable (`const result = ...`)
- Is passed as an argument to another function

The rule strips comments and string literals before analysis to avoid false positives.

Applies to files with extensions: `.ts`, `.tsx`.

## Auto-fix

This rule does not provide auto-fix. Handling a floating promise requires choosing a strategy (await, return, catch, or void), which depends on the surrounding code context and developer intent.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'ts/no-floating-promises': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
