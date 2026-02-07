# style/spaced-comment

Require a space after `//` and `/*` in comments.

- **Plugin:** style
- **Default:** off
- **Auto-fix:** Yes

## Examples

### Bad

```ts
//this is a comment
//TODO: fix this
/*this is a block comment*/
const x = 1 //inline comment
```

### Good

```ts
// this is a comment
// TODO: fix this
/* this is a block comment */
const x = 1 // inline comment

/// triple-slash directive (allowed)
//! special comment (allowed)
/** JSDoc comment (allowed) */
/*! license comment (allowed) */
```

## Details

This rule requires a space immediately after `//` in line comments and after `/*` in block comments. It enforces readability by preventing comments from running directly into their text content.

The following comment styles are **exempted** and not flagged:

- **Triple-slash directives** -- `///` (used for TypeScript reference directives).
- **Bang comments** -- `//!` and `/*!` (used for license headers and special annotations).
- **JSDoc comments** -- `/**` (the second `*` means this is not a plain `/*` comment).
- **Empty comments** -- `//` with nothing after it.
- **URL patterns** -- `//` preceded by `http:` or `https:` is recognized as part of a URL and skipped.

Occurrences of `//` and `/*` inside string literals are ignored.

## Auto-fix

When `--fix` is used, the fixer:

- Inserts a space after `//` when a non-whitespace, non-`/`, non-`!` character directly follows (e.g., `//comment` becomes `// comment`).
- Inserts a space after `/*` when a non-whitespace, non-`*`, non-`!` character directly follows (e.g., `/*comment*/` becomes `/* comment*/`).

## Configuration

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/spaced-comment': 'warn',  // 'off' | 'warn' | 'error'
  },
}
```
