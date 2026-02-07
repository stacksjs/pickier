# style/curly

Enforce consistent use of curly braces for control flow statements, requiring braces when any branch in a chain uses them and flagging unnecessary braces around single simple statements.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** No

## Examples

### Bad

```ts
// Missing braces: the else branch has braces, so the if branch should too
if (condition)
  doSomething()
else {
  doA()
  doB()
}

// Unnecessary braces around a single statement when no sibling branch needs them
if (condition) {
  return true
}

// Inconsistent braces in a loop when the body is nested
while (ready)
  if (flag) handle()
```

### Good

```ts
// All branches use braces consistently
if (condition) {
  doSomething()
}
else {
  doA()
  doB()
}

// Single statement without braces (no sibling branch needs them)
if (condition)
  return true

// Loop with braces
while (ready) {
  if (flag) handle()
}
```

## Details

This rule performs two checks:

1. **Require braces when any branch needs them**: For `if`/`else if`/`else` chains and loop statements (`while`, `do`, `for`, `for await`), if any branch or body in the chain uses curly braces or contains a nested control structure, all branches must use curly braces. This prevents inconsistency where some branches are braced and others are not.

2. **Flag unnecessary braces**: When a branch body consists of a single simple statement (not a control structure, not containing braces, and with balanced parentheses) and no sibling branch in the same chain has multiple statements, the braces are flagged as unnecessary. This encourages the concise braceless form when it is safe.

## Auto-fix

This rule does not provide auto-fix. Manually add or remove braces to achieve consistent style across all branches.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/curly': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
