# sort-switch-case

Enforce sorted `switch`case statements.

Switch statements with many cases benefit from a predictable order for scanability and maintenance.

## Config```ts

pluginRules: {
  sort-switch-case: [warn, { type: alphabetical, order: asc, ignoreCase: true }],
}

```Options:

-`type`: alphabetical | natural | line-length | custom | unsorted (default: alphabetical)

- `order`: asc | desc (default: asc)
- `ignoreCase`: boolean (default: true)
- `specialCharacters`: keep | trim | remove (default: keep)
- `alphabet`: string (default: ) — only when type=custom

## Example

Before:

```ts

switch (action.type) {
  case FETCH_USER_ERROR: /_..._/ break
  case FETCH_USER_SUCCESS: /_..._/ break
  case DELETE_USER: /_..._/ break
  case FETCH_USER_REQUEST: /_..._/ break
  case ADD_USER: /_..._/ break
  default: break
}

```After (alphabetical asc):```ts
switch (action.type) {
  case ADD_USER: /_..._/ break
  case DELETE_USER: /_..._/ break
  case FETCH_USER_ERROR: /_..._/ break
  case FETCH_USER_REQUEST: /_..._/ break
  case FETCH_USER_SUCCESS: /_..._/ break
  default: break
}
```## Best practices

- Use`natural`when case labels include numeric suffixes
- Keep groups separated by comments and disable sorting across groups if desired
- Start at`warn`to evaluate usefulness before enforcing with`error`
