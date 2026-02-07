# style/indent-unindent

Enforce consistent indentation inside tagged template literals that use unindent-style helper tags.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** No

## Examples

### Bad

```ts
const html = $`
<div>
  <span>Hello</span>
</div>
`

const query = unindent`
select *
    from users
  where active = true
`
```

### Good

```ts
const html = $`
  <div>
    <span>Hello</span>
  </div>
`

const query = unindent`
  select *
  from users
  where active = true
`
```

## Details

This rule targets tagged template literals using common unindent helper tags: `$`, `unindent`, and `unIndent`. These tags typically strip leading indentation at runtime, so the source content should be indented consistently for readability.

When one of these tags is detected, the rule checks that each non-empty line inside the template is indented at least two spaces beyond the indentation level of the tag line itself. Only multiline templates are checked -- single-line tagged templates (where the closing backtick is on the same line) are skipped.

The rule reports the first line that does not meet the expected indentation level and stops, so you will see at most one issue per tagged template.

## Auto-fix

This rule does not provide auto-fix. Manually adjust the indentation of the template content to be consistent.

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/indent-unindent': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
