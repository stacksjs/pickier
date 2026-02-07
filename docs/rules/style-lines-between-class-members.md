# style/lines-between-class-members

Require a blank line between class members such as methods, properties, getters, and setters.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** Yes

## Examples

### Bad

```ts
class User {
  name: string
  age: number
  greet() {
    return `Hello, ${this.name}`
  }
  getAge() {
    return this.age
  }
}
```

### Good

```ts
class User {
  name: string

  age: number

  greet() {
    return `Hello, ${this.name}`
  }

  getAge() {
    return this.age
  }
}
```

## Details

This rule tracks brace depth to identify class boundaries and class-level members. It detects members starting with visibility modifiers (`public`, `private`, `protected`), other modifiers (`static`, `readonly`, `abstract`, `override`, `async`), accessors (`get`, `set`), generator markers (`*`), private names (`#`), and standard identifiers. When a multi-line member (such as a method with a body) is immediately followed by another member on the very next line without a blank line between them, the rule reports a violation.

Comments and blank lines between members are not flagged.

## Auto-fix

When `--fix` is used, the fixer inserts a blank line between consecutive class members that lack one. It correctly handles both single-line members (like property declarations) and multi-line members (like methods with bodies).

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/lines-between-class-members': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
