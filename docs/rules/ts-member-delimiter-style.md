# ts/member-delimiter-style

Enforce consistent use of semicolons as member delimiters in interfaces and type literals.

- **Plugin:** ts
- **Default:** off
- **Auto-fix:** Yes

## Why

TypeScript interfaces and type literals allow both semicolons (`;`) and commas (`,`) as member delimiters, and even permit omitting them entirely. Mixing styles within a codebase leads to inconsistency. This rule enforces semicolons as the delimiter in interfaces and type literals, which is the conventional TypeScript style.

## Examples

### Bad

```ts
// commas instead of semicolons
interface User {
  name: string,
  age: number,
  email: string,
}

// missing delimiters
interface Config {
  host: string
  port: number
  debug: boolean
}

// mixed delimiters
interface Mixed {
  name: string;
  age: number,
  email: string
}
```

### Good

```ts
// consistent semicolons
interface User {
  name: string;
  age: number;
  email: string;
}

// type literals also use semicolons
type Config = {
  host: string;
  port: number;
  debug: boolean;
}

// readonly and optional members
interface Options {
  readonly id: string;
  label?: string;
  [key: string]: unknown;
}
```

## Details

The rule tracks `interface` and `type` declarations with brace-delimited bodies and checks each member line:

- **Comma delimiter:** Flags members that end with `,` when `;` is expected, reporting "Expected semicolon delimiter in interface, found comma."
- **Missing delimiter:** Flags members that end without any delimiter (no `;` or `,`), reporting "Missing semicolon delimiter in interface member." This check applies to lines that look like type members (starting with an identifier followed by `:`, a `[` index signature, or the `readonly` keyword).

The rule skips comment lines, empty lines, union/intersection continuation lines (`|` or `&`), and closing braces.

Applies to all file types that contain TypeScript interfaces or type literals.

## Auto-fix

When `--fix` is used, the rule replaces trailing commas with semicolons inside interface and type literal bodies.

**Before fix:**

```ts
interface User {
  name: string,
  age: number,
}
```

**After fix:**

```ts
interface User {
  name: string;
  age: number;
}
```

Note: The fixer replaces commas with semicolons but does not add missing delimiters.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'ts/member-delimiter-style': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
