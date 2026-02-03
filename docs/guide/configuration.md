# Configuration

Pickier works out of the box, but you can customize behavior with `pickier.config.ts`.

## Configuration File

Create `pickier.config.ts` in your project root:

```typescript
// pickier.config.ts
import type { PickierConfig } from 'pickier'

const config: PickierConfig = {
  verbose: false,
  ignores: ['**/node_modules/**', '**/dist/**'],
  lint: { /* ... */ },
  format: { /* ... */ },
  rules: { /* ... */ },
  plugins: [ /* ... */ ],
  pluginRules: { /* ... */ },
}

export default config
```

## General Options

```typescript
const config: PickierConfig = {
  // Enable verbose logging
  verbose: false,

  // Global ignore patterns
  ignores: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.git/**',
    '**/coverage/**',
  ],
}
```

## Lint Configuration

```typescript
lint: {
  // File extensions to lint
  extensions: ['ts', 'tsx', 'js', 'jsx'],  // or ['.ts', '.tsx']

  // Output format: 'stylish' | 'json' | 'compact'
  reporter: 'stylish',

  // Enable caching (reserved for future)
  cache: false,

  // Fail when warnings exceed this count (-1 = disabled)
  maxWarnings: -1,
}
```

### Lint Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `extensions` | `string[]` | `['ts', 'js']` | File extensions to lint |
| `reporter` | `string` | `'stylish'` | Output format |
| `cache` | `boolean` | `false` | Enable caching |
| `maxWarnings` | `number` | `-1` | Max warnings before failure |

## Format Configuration

```typescript
format: {
  // File extensions to format
  extensions: ['ts', 'js', 'json', 'md', 'yaml', 'yml'],

  // Trim trailing whitespace
  trimTrailingWhitespace: true,

  // Max consecutive blank lines
  maxConsecutiveBlankLines: 1,

  // Final newline handling: 'one' | 'two' | 'none'
  finalNewline: 'one',

  // Indentation size (for code files)
  indent: 2,

  // Indentation style: 'space' | 'tab'
  indentStyle: 'space',

  // String quote style: 'single' | 'double'
  quotes: 'single',

  // Remove stylistic semicolons
  semi: false,
}
```

### Format Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `extensions` | `string[]` | `['ts', 'js', 'json', 'md']` | File extensions |
| `trimTrailingWhitespace` | `boolean` | `true` | Trim line endings |
| `maxConsecutiveBlankLines` | `number` | `1` | Max blank lines |
| `finalNewline` | `string` | `'one'` | EOF newline handling |
| `indent` | `number` | `2` | Indent size |
| `indentStyle` | `string` | `'space'` | Tabs or spaces |
| `quotes` | `string` | `'single'` | Quote style |
| `semi` | `boolean` | `false` | Semicolon handling |

## Built-in Rules

```typescript
rules: {
  // 'off' | 'warn' | 'error'
  noDebugger: 'error',   // Remove debugger statements
  noConsole: 'warn',     // Warn on console usage
}
```

### Rule Severity

| Value | Behavior |
|-------|----------|
| `'off'` | Rule disabled |
| `'warn'` | Reports warning, doesn't fail |
| `'error'` | Reports error, fails lint |

## Plugin Rules

Configure plugin rules:

```typescript
pluginRules: {
  // Markdown linting
  'markdown/heading-increment': 'error',
  'markdown/no-trailing-spaces': 'error',
  'markdown/fenced-code-language': 'error',
  'markdown/no-duplicate-heading': 'warn',

  // Style rules
  'style/no-tabs': 'error',
  'style/max-line-length': ['warn', { max: 120 }],

  // TypeScript rules
  'ts/no-any': 'warn',
  'ts/explicit-return-type': 'off',

  // General rules
  'general/no-debugger': 'error',
  'general/no-console': 'warn',

  // Sorting rules
  'pickier/sort-imports': 'error',
  'pickier/sort-package-json': 'error',
}
```

### Available Plugin Categories

| Plugin | Description | Rules |
|--------|-------------|-------|
| `general/` | Error detection | 35+ rules |
| `quality/` | Best practices | 40+ rules |
| `pickier/` | Import/sorting | 17 rules |
| `style/` | Code style | 7 rules |
| `ts/` | TypeScript | 9 rules |
| `regexp/` | RegExp safety | 3 rules |
| `markdown/` | Documentation | 53+ rules |

## Custom Plugins

Register custom plugins:

```typescript
import type { PickierPlugin } from 'pickier'

const myPlugin: PickierPlugin = {
  name: 'my-plugin',
  rules: {
    'no-todo': {
      meta: { docs: 'Disallow TODO comments' },
      check(content, ctx) {
        const issues = []
        const lines = content.split(/\r?\n/)
        for (let i = 0; i < lines.length; i++) {
          const col = lines[i].indexOf('TODO')
          if (col !== -1) {
            issues.push({
              filePath: ctx.filePath,
              line: i + 1,
              column: col + 1,
              ruleId: 'my-plugin/no-todo',
              message: 'Unexpected TODO comment.',
              severity: 'warning',
            })
          }
        }
        return issues
      },
    },
  },
}

const config: PickierConfig = {
  plugins: [myPlugin],
  pluginRules: {
    'my-plugin/no-todo': 'warn',
  },
}
```

## Import Formatting

Pickier organizes imports automatically:

```typescript
// Before
import { z } from 'zod'
import { useState, useEffect } from 'react'
import type { User, Post } from './types'
import { Button } from './Button'
import fs from 'fs'
import path from 'path'

// After (with sort-imports enabled)
import fs from 'fs'
import path from 'path'
import { useEffect, useState } from 'react'
import { z } from 'zod'

import { Button } from './Button'

import type { Post, User } from './types'
```

Features:

- Type imports separated
- External before relative imports
- Specifiers sorted alphabetically
- Unused imports removed
- Duplicate imports merged

## Semicolon Handling

When `semi: true`:

```typescript
// Before
foo();;
bar();
for (let i = 0; i < 10; i++) {
  ;
}

// After
foo()
bar()
for (let i = 0; i < 10; i++) {
}
```

Safe handling:

- Preserves `for (;;)` loop headers
- Removes duplicate semicolons
- Removes empty statement semicolons
- Keeps necessary semicolons

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PICKIER_NO_AUTO_CONFIG=1` | Disable config auto-loading |
| `PICKIER_TRACE=1` | Enable verbose trace logging |
| `PICKIER_TIMEOUT_MS` | Glob timeout (default: 8000) |
| `PICKIER_RULE_TIMEOUT_MS` | Rule timeout (default: 5000) |
| `PICKIER_FAIL_ON_WARNINGS=1` | Treat warnings as errors |

## Complete Example

```typescript
// pickier.config.ts
import type { PickierConfig } from 'pickier'

const config: PickierConfig = {
  verbose: process.env.CI === 'true',

  ignores: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.git/**',
    '**/coverage/**',
    '**/*.min.js',
  ],

  lint: {
    extensions: ['ts', 'tsx', 'js', 'jsx', 'md'],
    reporter: 'stylish',
    cache: false,
    maxWarnings: process.env.CI ? 0 : -1,
  },

  format: {
    extensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'md', 'yaml', 'yml'],
    trimTrailingWhitespace: true,
    maxConsecutiveBlankLines: 1,
    finalNewline: 'one',
    indent: 2,
    indentStyle: 'space',
    quotes: 'single',
    semi: false,
  },

  rules: {
    noDebugger: 'error',
    noConsole: 'warn',
  },

  pluginRules: {
    // Markdown
    'markdown/heading-increment': 'error',
    'markdown/no-trailing-spaces': 'error',
    'markdown/fenced-code-language': 'warn',

    // Style
    'style/max-line-length': ['warn', { max: 100 }],

    // Sorting
    'pickier/sort-imports': 'error',
    'pickier/sort-package-json': 'error',

    // TypeScript
    'ts/no-any': 'warn',
  },
}

export default config
```

## Related

- [CLI Commands](/guide/cli)
- [Rules Reference](/rules/)
- [Plugin Development](/guide/plugins)
