# ts/prefer-optional-chain

Prefer optional chaining (`?.`) over chained logical AND (`&&`) for property access.

- **Plugin:** ts
- **Default:** off
- **Auto-fix:** Yes

## Why

Chaining `&&` operators to safely access nested properties is a common pre-ES2020 pattern, but it is verbose and error-prone. Optional chaining (`?.`) is the modern, concise alternative that short-circuits on `null` or `undefined` and returns `undefined` without throwing.

## Examples

### Bad

```ts
// simple guard-then-access
const name = user && user.name

// nested property access
const city = user && user.address && user.address.city

// deeper chaining
const zip = user && user.address && user.address.zip && user.address.zip.code

// method call guard
const result = obj && obj.method && obj.method()

// chained property access
const value = config.settings && config.settings.theme
```

### Good

```ts
// optional chaining
const name = user?.name

// nested optional chaining
const city = user?.address?.city

// deeper chaining
const zip = user?.address?.zip?.code

// method call
const result = obj?.method?.()

// chained property access
const value = config.settings?.theme
```

## Details

The rule detects three patterns of `&&`-based null guarding:

1. **Simple guard:** `foo && foo.bar` -- a variable is checked for truthiness, then a property is accessed on it.

2. **Chained property guard:** `obj.a && obj.a.b` -- a property chain is checked, then extended with an additional property.

3. **Triple-or-more chain:** `a && a.b && a.b.c` -- multiple `&&` operands that each extend the previous one by a property access, forming a progressive null-checking chain.

The rule strips comments and string literals before analysis. It only applies to TypeScript files.

Applies to files with extensions: `.ts`, `.tsx`.

## Auto-fix

When `--fix` is used, the rule replaces `&&`-guarded property access with optional chaining:

**Before fix:**

```ts
const name = user && user.name
const city = user.address && user.address.city
```

**After fix:**

```ts
const name = user?.name
const city = user.address?.city
```

The fixer handles both simple (`foo && foo.bar`) and chained (`obj.a && obj.a.b`) patterns. For triple-or-more chains, multiple fixer passes may be needed since the fixer runs iteratively.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'ts/prefer-optional-chain': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
