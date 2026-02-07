# style/keyword-spacing

Require consistent spacing before and after keywords such as `if`, `else`, `for`, `while`, `switch`, `catch`, and `finally`.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** Yes

## Examples

### Bad

```ts
if(x) {
  // ...
}

for(let i = 0; i < 10; i++) {
  // ...
}

while(running) {
  // ...
}

switch(value) {
  // ...
}

try {
  // ...
}catch(e) {
  // ...
}

if (ok) {
  // ...
}else{
  // ...
}

try {
  // ...
}finally{
  // ...
}
```

### Good

```ts
if (x) {
  // ...
}

for (let i = 0; i < 10; i++) {
  // ...
}

while (running) {
  // ...
}

switch (value) {
  // ...
}

try {
  // ...
} catch (e) {
  // ...
}

if (ok) {
  // ...
} else {
  // ...
}

try {
  // ...
} finally {
  // ...
}
```

## Details

This rule checks two spacing conditions:

1. **Space after keywords** -- Keywords like `if`, `for`, `while`, `switch`, and `catch` must be followed by a space before the opening parenthesis.
2. **Space before keywords** -- Keywords like `else`, `catch`, and `finally` must be preceded by a space when they follow a closing `)` or `}`.

The rule skips lines that are comments (`//`, `/*`, `*`-prefixed) and ignores keywords found inside strings or comments.

## Auto-fix

When `--fix` is used, the fixer:

- Inserts a space between keywords (`if`, `for`, `while`, `switch`, `catch`) and an immediately following `(`.
- Inserts a space before `else`, `catch`, and `finally` when they immediately follow `)` or `}`.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/keyword-spacing': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
