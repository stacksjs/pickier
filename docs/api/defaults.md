# Defaults

Pickier ships with sensible defaults. You can import and inspect them if needed.

```ts
import { pickierConfig as loadedConfig } from '@stacksjs/pickier'
```

The static defaults are:

```ts
// See packages/pickier/src/config.ts
export const pickierDefaults = {
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
    finalNewline: 'one',
  },
  rules: {
    noDebugger: 'error',
    noConsole: 'warn',
  },
}
```

Runtime-loaded config uses `bunfig` to merge your local `pickier.config.*` over these defaults.
