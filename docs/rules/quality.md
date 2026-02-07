# quality (built-in plugin)

The `quality` plugin provides best practices and code quality rules. These rules enforce coding standards, prevent common antipatterns, and help maintain clean, maintainable code.

**40 rules total**

## Available Rules

All rules can be configured using either the `quality/` or `eslint/` prefix (for backward compatibility).

### Equality & Comparisons

| Rule | Description |
|------|-------------|
| `eqeqeq` | Require === and !== |
| `default-case` | Require default cases in switch statements |

### Functions

| Rule | Description |
|------|-------------|
| `no-empty-function` | Disallow empty functions |
| `no-param-reassign` | Disallow reassignment of function parameters |
| `no-useless-call` | Disallow unnecessary .call() and .apply() |
| `require-await` | Disallow async functions which have no await expression |
| `prefer-arrow-callback` | Require arrow functions as callbacks |

### Control Flow

| Rule | Description |
|------|-------------|
| `no-else-return` | Disallow else blocks after return statements |
| `no-await-in-loop` | Disallow await inside of loops |

### Dangerous Features

| Rule | Description |
|------|-------------|
| `no-eval` | Disallow eval() |
| `no-implied-eval` | Disallow implied eval() |
| `no-new-func` | Disallow new operators with Function object |
| `no-alert` | Disallow the use of alert, confirm, and prompt |
| `no-caller` | Disallow use of caller/callee |
| `no-with` | Disallow with statements |

### Objects & Prototypes

| Rule | Description |
|------|-------------|
| `no-extend-native` | Disallow extending native types |
| `no-global-assign` | Disallow assignment to native objects |
| `no-proto` | Disallow \_\_proto\_\_ property |
| `no-iterator` | Disallow \_\_iterator\_\_ property |
| `no-new-wrappers` | Disallow new operators with String, Number, and Boolean |
| `no-new` | Disallow new operators outside of assignments |

### Code Quality

| Rule | Description |
|------|-------------|
| `no-empty` | Disallow empty block statements |
| `no-case-declarations` | Disallow lexical declarations in case clauses |
| `no-octal` | Disallow octal literals |
| `no-return-assign` | Disallow assignment in return statement |
| `no-sequences` | Disallow comma operators |
| `no-throw-literal` | Disallow throwing literals as exceptions |
| `no-useless-return` | Disallow redundant return statements |

### String & Type Operations

| Rule | Description |
|------|-------------|
| `no-useless-concat` | Disallow unnecessary concatenation of strings |
| `no-useless-escape` | Disallow unnecessary escape characters |
| `no-useless-rename` | Disallow renaming import, export, and destructured assignments |

### Boolean Logic

| Rule | Description |
|------|-------------|
| `no-extra-boolean-cast` | Disallow unnecessary boolean casts |
| `no-lonely-if` | Disallow if statements as the only statement in else blocks |

### Modern JavaScript

| Rule | Description |
|------|-------------|
| `no-var` | Require let or const instead of var |

### Complexity Metrics

These rules help keep code maintainable by limiting complexity:

| Rule | Description |
|------|-------------|
| `complexity` | Enforce a maximum cyclomatic complexity (default: 20) |
| `max-depth` | Enforce a maximum depth that blocks can be nested (default: 4) |
| `max-lines-per-function` | Enforce a maximum number of lines per function (default: 300) |

## Configuration

Configure rules in your `pickier.config.ts`:

```ts
import type { PickierConfig } from 'pickier'

const config: PickierConfig = {
  pluginRules: {
    // Use quality/ prefix (recommended)
    'quality/eqeqeq': 'error',
    'quality/no-eval': 'error',
    'quality/no-var': 'error',
    'quality/prefer-arrow-callback': 'warn',

    // Complexity limits with options
    'quality/complexity': ['error', { max: 15 }],
    'quality/max-depth': ['error', { max: 3 }],

    // Or use eslint/ prefix for compatibility
    'eslint/eqeqeq': 'error',
  },
}

export default config
```

## Best Practices

- Use `eqeqeq` to avoid type coercion bugs
- Enable `no-var` to use modern JavaScript
- Set `no-eval` to `error` for security
- Configure complexity metrics based on your team's needs
- Start complexity rules at `warn` to understand your baseline
- Use `prefer-arrow-callback` for cleaner callback syntax

## Common Patterns

### Enforcing Modern JavaScript

```ts
pluginRules: {
  'quality/no-var': 'error',
  'quality/prefer-arrow-callback': 'warn',
  'quality/eqeqeq': 'error',
}
```

### Security-Focused Configuration

```ts
pluginRules: {
  'quality/no-eval': 'error',
  'quality/no-implied-eval': 'error',
  'quality/no-new-func': 'error',
  'quality/no-extend-native': 'error',
}
```

### Complexity Control

```ts
pluginRules: {
  'quality/complexity': ['error', { max: 10 }],
  'quality/max-depth': ['error', { max: 3 }],
  'quality/max-lines-per-function': ['warn', { max: 100 }],
}
```

## See Also

- [General Plugin](/rules/general) - Error detection and possible problems
- [Rules Index](/rules/index) - Complete rule catalog
- [Plugin System](/advanced/plugin-system) - Plugin configuration guide
