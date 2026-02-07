# ts (built-in plugin)

TypeScript-specific rules provided by the built-in `ts` plugin. These enforce TypeScript best practices, type safety, and consistent formatting of type annotations.

**13 rules total** (7 with auto-fix)

## Type Safety Rules

| Rule | Auto-fix | Default | Description |
|------|----------|---------|-------------|
| [`no-explicit-any`](/rules/ts-no-explicit-any) | Yes | off | Disallow the `any` type |
| [`no-unsafe-assignment`](/rules/ts-no-unsafe-assignment) | No | off | Disallow assigning `any` typed values |
| [`no-floating-promises`](/rules/ts-no-floating-promises) | No | off | Require promises to be awaited, returned, or `.catch()`'d |
| [`no-misused-promises`](/rules/ts-no-misused-promises) | No | off | Disallow promises in places not designed for them |
| [`prefer-nullish-coalescing`](/rules/ts-prefer-nullish-coalescing) | Yes | off | Prefer `??` over `\|\|` for null/undefined checks |
| [`prefer-optional-chain`](/rules/ts-prefer-optional-chain) | Yes | off | Prefer `?.` over chained `&&` for property access |

## Module Rules

| Rule | Auto-fix | Default | Description |
|------|----------|---------|-------------|
| [`no-require-imports`](/rules/ts-no-require-imports) | No | off | Disallow `require()` imports; prefer ESM |
| [`no-ts-export-equal`](/rules/ts-no-ts-export-equal) | No | off | Disallow `export =`; prefer ESM `export default` |
| [`no-top-level-await`](/rules/ts-no-top-level-await) | No | error | Disallow top-level `await` statements |

## Formatting Rules

| Rule | Auto-fix | Default | Description |
|------|----------|---------|-------------|
| [`member-delimiter-style`](/rules/ts-member-delimiter-style) | Yes | off | Enforce consistent `;` or `,` in interfaces and type literals |
| [`type-annotation-spacing`](/rules/ts-type-annotation-spacing) | Yes | off | Require consistent spacing around `:` in type annotations |
| [`type-generic-spacing`](/rules/ts-type-generic-spacing) | Yes | off | Disallow spaces inside generic angle brackets `Array< string >` |
| [`type-named-tuple-spacing`](/rules/ts-type-named-tuple-spacing) | Yes | off | Require space after `:` in named tuple members `[name: string]` |

## Configuration

All TS rules are configured via `pluginRules` using the `ts/` prefix:

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'ts/no-top-level-await': 'error',
    'ts/no-explicit-any': 'warn',
    'ts/member-delimiter-style': 'warn',
    'ts/type-annotation-spacing': 'warn',
    'ts/type-generic-spacing': 'warn',
    'ts/type-named-tuple-spacing': 'warn',
    // ...
  },
}
```

See the [Plugin System](/advanced/plugin-system) for more configuration examples.
