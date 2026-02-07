# style/space-infix-ops

Require consistent spacing around infix operators such as `&&`, `||`, `??`, and compound assignment operators.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** Yes

## Examples

### Bad

```ts
const result = a&&b
const fallback = value??'default'
const either = x||y
let count = 0
count+=1
count-=1
count*=2
count/=2
count**=3
let flags = 0
flags|=FLAG_A
flags&=MASK
flags^=TOGGLE
flags<<=2
flags>>=1
flags>>>=1
let x = null
x??=fallback
x||=backup
x&&=value
```

### Good

```ts
const result = a && b
const fallback = value ?? 'default'
const either = x || y
let count = 0
count += 1
count -= 1
count *= 2
count /= 2
count **= 3
let flags = 0
flags |= FLAG_A
flags &= MASK
flags ^= TOGGLE
flags <<= 2
flags >>= 1
flags >>>= 1
let x = null
x ??= fallback
x ||= backup
x &&= value
```

## Details

This rule checks the following infix and compound assignment operators for proper spacing on both sides:

- Logical: `&&`, `||`, `??`
- Assignment: `+=`, `-=`, `*=`, `/=`, `%=`, `**=`
- Bitwise assignment: `<<=`, `>>=`, `>>>=`, `&=`, `|=`, `^=`
- Logical assignment: `??=`, `||=`, `&&=`

The rule is careful not to flag shorter operators when they are part of a longer one (for example, `&&` inside `&&=` is not flagged separately). Lines that are entirely comments are skipped, and occurrences inside strings or comments are ignored.

## Auto-fix

When `--fix` is used, the fixer processes operators from longest to shortest to avoid partial replacements. For each operator it:

- Inserts a space before the operator if a non-whitespace character directly precedes it.
- Inserts a space after the operator if a non-whitespace character directly follows it.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/space-infix-ops': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
