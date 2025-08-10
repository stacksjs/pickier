# CLI Reference

Pickier provides a single binary, `pickier`, with the following commands.

## Commands

### `pickier lint [...globs]`

Lint files.

Options:

- `--fix` — auto-fix problems (removes `debugger` lines)
- `--dry-run` — simulate fixes without writing
- `--max-warnings <n>` — fail if warnings exceed `n` (default `-1` disables)
- `--reporter <name>` — `stylish` | `json` | `compact` (default `stylish`)
- `--config <path>` — path to Pickier config
- `--ignore-path <file>` — ignore file (gitignore-style)
- `--ext <exts>` — comma-separated extensions (default `.ts,.tsx,.js,.jsx`)
- `--cache` — enable cache (reserved)
- `--verbose` — verbose output

Examples:

```bash
pickier lint . --dry-run
pickier lint src --fix
pickier lint "src/**/*.{ts,tsx}" --reporter json
```

### `pickier format [...globs]`

Format files.

Options:

- `--write` — write changes to files
- `--check` — check without writing
- `--config <path>` — path to Pickier config
- `--ignore-path <file>` — ignore file (gitignore-style)
- `--ext <exts>` — comma-separated extensions (default `.ts,.tsx,.js,.jsx`)
- `--verbose` — verbose output

Examples:

```bash
pickier format . --check
pickier format src --write
pickier format "**/*.{ts,tsx,js}" --write
```

Notes:

- When `--ext` is omitted, the CLI uses its built-in default shown above. To include more file types (html, css, json, md, yaml, yml, stx), pass `--ext` explicitly or configure `format.extensions` / `lint.extensions` in your `pickier` config.

### `pickier version`

Print the CLI version.

### `pickier` (no command)

Shows help.
