# Configuration

Pickier can be configured using a `pickier.config.ts` (or `.js` / `.json`) file in your project root.

## Example (TypeScript)

```ts
// pickier.config.ts
import type { PickierConfig } from 'pickier'

const config: PickierConfig = {
  verbose: false,
  ignores: ['**/node_modules/**', '**/dist/**', '**/build/**'],
  lint: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    reporter: 'stylish',
    cache: false,
    maxWarnings: -1,
  },
  format: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.yaml', '.yml'],
    trimTrailingWhitespace: true,
    maxConsecutiveBlankLines: 1,
    finalNewline: 'one', // 'one' | 'two' | 'none'
  },
  rules: {
    noDebugger: 'error', // 'off' | 'warn' | 'error'
    noConsole: 'warn',
  },
}

export default config
```

## JSON config

```json
{
  "verbose": false,
  "ignores": ["**/node_modules/**", "**/dist/**", "**/build/**"],
  "lint": {
    "extensions": [".ts", ".tsx", ".js", ".jsx"],
    "reporter": "stylish",
    "cache": false,
    "maxWarnings": -1
  },
  "format": {
    "extensions": [".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".yaml", ".yml"],
    "trimTrailingWhitespace": true,
    "maxConsecutiveBlankLines": 1,
    "finalNewline": "one"
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
