# style/key-spacing

Enforce consistent spacing around colons in object literal properties.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** Yes

## Examples

### Bad

```ts
const obj = {
  name:'Chris',
  age:30,
  active:true,
}

const config = {
  host:'localhost',
  port:3000,
}

const person = {
  firstName :'Alice',
  lastName  :'Smith',
}
```

### Good

```ts
const obj = {
  name: 'Chris',
  age: 30,
  active: true,
}

const config = {
  host: 'localhost',
  port: 3000,
}

const person = {
  firstName: 'Alice',
  lastName: 'Smith',
}
```

## Details

This rule enforces two spacing conventions around colons in object property definitions:

1. **Space after colon** -- The colon in a property definition (`key: value`) must be followed by a space. Patterns like `name:'Chris'` are flagged.
2. **No space before colon** -- Extra spaces between the property key and the colon are flagged. Patterns like `name : 'Chris'` or `name  : 'Chris'` are reported.

The rule uses a heuristic to identify property-like patterns: it looks for lines where an identifier (optionally quoted) is followed by an optional `?` and then a colon. This covers standard object properties, TypeScript interface members, and optional properties.

The rule does not flag:

- `case` and `default` labels in switch statements.
- Colons inside strings or comments.
- Lines that are entirely comments.

## Auto-fix

When `--fix` is used, the fixer inserts a space after the colon when a non-whitespace character directly follows it in a property pattern. For example:

- `name:'Chris'` becomes `name: 'Chris'`
- `port:3000` becomes `port: 3000`
- `active?:true` becomes `active?: true`

Note: The auto-fix addresses missing spaces after colons. Removing extra spaces before colons is detected but not automatically fixed by the current fixer.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/key-spacing': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
