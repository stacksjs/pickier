# regexp/noUnusedCapturingGroup

Flags regex literals that contain capturing groups but no corresponding backreferences. This rule is heuristic and may produce false positives.

- Category: Core (optional)
- Default: off

Config:

```ts
rules: { noUnusedCapturingGroup: 'warn' } // 'off' | 'warn' | 'error'
```

Example:

```ts
const r = /(\d{4})-(\d{2})-(\d{2})/
// no backreference usage detected
```

Rationale: unused capturing groups can be converted to non-capturing `(?:...)` for performance/readability.

## Suggested fix

Replace unused `()` with `(?:...)`:

```ts
const r = /\d{4}-\d{2}-\d{2}/
```

## Best practices

- Name only the groups you need to reference; prefer non-capturing groups otherwise
