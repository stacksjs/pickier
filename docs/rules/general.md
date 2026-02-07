# general (built-in plugin)

The `general` plugin provides error detection and possible problems rules. These rules catch common programming errors and potential bugs before they cause issues in production.

**35 rules total**

## Available Rules

All rules can be configured using either the `general/` or `eslint/` prefix (for backward compatibility).

### Variable & Scope

| Rule | Description |
|------|-------------|
| `no-const-assign` | Disallow reassigning const variables |
| `no-redeclare` | Disallow variable redeclaration |
| `no-undef` | Disallow undeclared variables |
| [`no-unused-vars`](/rules/no-unused-vars) | Disallow unused variables |
| `no-shadow` | Disallow variable declarations from shadowing outer scope |
| `no-use-before-define` | Disallow use of variables before they are defined |

### Functions & Callbacks

| Rule | Description |
|------|-------------|
| `array-callback-return` | Enforce return statements in array callbacks |
| `getter-return` | Enforce return statements in getters |
| `constructor-super` | Require super() calls in constructors |
| `no-constructor-return` | Disallow returning value from constructor |

### Control Flow

| Rule | Description |
|------|-------------|
| `for-direction` | Enforce "for" loop update clause moving counter in the right direction |
| `no-fallthrough` | Disallow fallthrough of case statements |
| `no-unreachable` | Disallow unreachable code after return, throw, continue, and break |
| `no-constant-condition` | Disallow constant expressions in conditions |

### Objects & Classes

| Rule | Description |
|------|-------------|
| `no-dupe-keys` | Disallow duplicate keys in object literals |
| `no-dupe-class-members` | Disallow duplicate class members |
| `no-duplicate-case` | Disallow duplicate case labels |

### Async & Promises

| Rule | Description |
|------|-------------|
| `no-async-promise-executor` | Disallow async promise executor |
| `no-promise-executor-return` | Disallow returning values from Promise executor |

### Comparisons

| Rule | Description |
|------|-------------|
| `no-compare-neg-zero` | Disallow comparing against -0 |
| `no-self-assign` | Disallow assignments where both sides are exactly the same |
| `no-self-compare` | Disallow comparisons where both sides are exactly the same |
| `use-isnan` | Require calls to isNaN() when checking for NaN |
| `valid-typeof` | Enforce comparing typeof expressions against valid strings |

### Patterns & Syntax

| Rule | Description |
|------|-------------|
| `no-empty-pattern` | Disallow empty destructuring patterns |
| `no-sparse-arrays` | Disallow sparse arrays |
| `no-irregular-whitespace` | Disallow irregular whitespace |
| `no-loss-of-precision` | Disallow number literals that lose precision |
| `no-unsafe-negation` | Disallow negating the left operand of relational operators |
| `no-useless-catch` | Disallow unnecessary catch clauses |

### Modern JavaScript

| Rule | Description |
|------|-------------|
| [`prefer-const`](/rules/prefer-const) | Require const declarations for variables that are never reassigned |
| `prefer-object-spread` | Prefer object spread over Object.assign |
| `prefer-template` | Require template literals instead of string concatenation |

## Configuration

Configure rules in your `pickier.config.ts`:

```ts
import type { PickierConfig } from 'pickier'

const config: PickierConfig = {
  pluginRules: {
    // Use general/ prefix (recommended)
    'general/no-undef': 'error',
    'general/no-unused-vars': 'error',
    'general/prefer-const': 'error',

    // Or use eslint/ prefix for compatibility
    'eslint/no-undef': 'error',
  },
}

export default config
```

## Best Practices

- Keep error detection rules at `'error'` severity to catch bugs early
- Use `prefer-const` to enforce immutability by default
- Enable `no-unused-vars` to keep code clean and catch typos
- Most of these rules don't have auto-fix, so they require manual correction

## See Also

- [Quality Plugin](/rules/quality) - Best practices and code quality rules
- [Rules Index](/rules/index) - Complete rule catalog
- [Plugin System](/advanced/plugin-system) - Plugin configuration guide
