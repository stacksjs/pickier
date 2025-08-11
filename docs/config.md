# Configuration

Pickier can be configured using a `pickier.config.ts` (or `.js` / `.json`) file in your project root.

## Example (TypeScript)

```ts
// pickier.config.ts
import type { PickierConfig } from 'pickier'

const config: PickierConfig = {
  verbose: false,
  ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/vendor/**', '**/coverage/**'],
  lint: {
    extensions: ['ts', 'js', 'html', 'css', 'json', 'jsonc', 'md', 'yaml', 'yml', 'stx'],
    reporter: 'stylish',
    cache: false,
    maxWarnings: -1,
  },
  format: {
    extensions: ['ts', 'js', 'html', 'css', 'json', 'jsonc', 'md', 'yaml', 'yml', 'stx'],
    trimTrailingWhitespace: true,
    maxConsecutiveBlankLines: 1,
    finalNewline: 'one', // 'one' | 'two' | 'none'
    indent: 2,
    indentStyle: 'spaces', // 'spaces' | 'tabs'
    quotes: 'single', // 'single' | 'double'
    semi: false,
  },
  rules: {
    noDebugger: 'error', // 'off' | 'warn' | 'error'
    noConsole: 'warn',
    // optional additional checks
    // noUnusedCapturingGroup: 'warn',
    // noCondAssign: 'error',
  },
  // Enable plugin rules (built-ins and custom)
  // plugins: [myPlugin],
  // pluginRules: {
  //   'pickier/sort-objects': ['warn', { type: 'alphabetical', order: 'asc', ignoreCase: true }],
  //   'style/max-statements-per-line': ['warn', { max: 1 }],
  //   'regexp/no-super-linear-backtracking': 'error',
  // },
}

export default config
```

## JSON config

```json
{
  "verbose": false,
  "ignores": ["**/node_modules/**", "**/dist/**", "**/build/**", "**/vendor/**", "**/coverage/**"],
  "lint": {
    "extensions": ["ts", "js", "html", "css", "json", "jsonc", "md", "yaml", "yml", "stx"],
    "reporter": "stylish",
    "cache": false,
    "maxWarnings": -1
  },
  "format": {
    "extensions": ["ts", "js", "html", "css", "json", "jsonc", "md", "yaml", "yml", "stx"],
    "trimTrailingWhitespace": true,
    "maxConsecutiveBlankLines": 1,
    "finalNewline": "one",
    "indent": 2,
    "indentStyle": "spaces",
    "quotes": "single",
    "semi": false
  },
  "rules": {
    "noDebugger": "error",
    "noConsole": "warn"
  }
}
```

## Notes

- `--config <path>` can point to any of the supported formats.
- When `--ext` is not provided on the CLI, Pickier uses `lint.extensions` or `format.extensions` from your config.
- `ignores` are passed to the file scanner to skip matching paths.
- When `--ext` is omitted, Pickier uses `lint.extensions` / `format.extensions` from your config. Built-in defaults: `.ts,.js,.html,.css,.json,.jsonc,.md,.yaml,.yml,.stx`.
