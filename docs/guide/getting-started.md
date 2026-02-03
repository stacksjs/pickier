# Getting Started

Pickier is a fast linter and formatter built with Bun, designed to provide instant feedback with minimal configuration.

## Features

- **Fast CLI** - Instant feedback with Bun's speed
- **Lint & Format** - One tool for both tasks
- **Zero-config defaults** - Works out of the box
- **Import organization** - Sorts and cleans imports
- **JSON/config sorting** - `package.json`, `tsconfig.json`
- **Markdown linting** - 53 rules for documentation
- **Plugin system** - ESLint-style extensibility
- **CI-friendly** - Multiple reporters, strict mode

## Installation

```bash
# As a dev dependency
bun add -D pickier

# Or with npm
npm install -D pickier

# Or with pnpm
pnpm add -D pickier

# Or run directly
bunx pickier --help
npx pickier --help
```

## Quick Start

### Lint Files

```bash
# Lint everything
pickier lint .

# Auto-fix issues
pickier lint . --fix

# Preview fixes without writing
pickier lint . --fix --dry-run

# With specific reporter
pickier lint . --reporter json
```

### Format Files

```bash
# Check formatting
pickier format . --check

# Format and write
pickier format . --write

# Specific file types
pickier format . --ext .ts,.tsx,.js
```

### Unified Command

```bash
# Recommended: Use the unified command
pickier run . --mode lint --fix
pickier run . --mode format --write
```

## What It Does

### Linting

Pickier catches common issues:

- `debugger` statements
- `console` calls
- Unused imports
- Style violations
- Markdown issues

### Formatting

Pickier formats your code:

- Consistent indentation (tabs or spaces)
- Quote style (single or double)
- Semicolon handling
- Trailing whitespace
- Import organization

### Import Organization

Pickier organizes imports:

```typescript
// Before
import { useState } from 'react'
import { Button } from './Button'
import type { User } from './types'
import fs from 'fs'

// After (sorted, type imports separated)
import fs from 'fs'
import { useState } from 'react'

import { Button } from './Button'

import type { User } from './types'
```

## Basic Configuration

Create `pickier.config.ts` to customize:

```typescript
// pickier.config.ts
import type { PickierConfig } from 'pickier'

const config: PickierConfig = {
  verbose: false,
  ignores: ['**/node_modules/**', '**/dist/**'],

  lint: {
    extensions: ['ts', 'js'],
    reporter: 'stylish',
    maxWarnings: -1,
  },

  format: {
    extensions: ['ts', 'js', 'json', 'md'],
    trimTrailingWhitespace: true,
    indent: 2,
    quotes: 'single',
    semi: false,
  },

  rules: {
    noDebugger: 'error',
    noConsole: 'warn',
  },
}

export default config
```

## Example Workflow

```bash
# 1. Install
bun add -D pickier

# 2. Lint and fix
pickier lint . --fix

# 3. Format
pickier format . --write

# 4. Add to package.json
{
  "scripts": {
    "lint": "pickier lint .",
    "lint:fix": "pickier lint . --fix",
    "format": "pickier format . --write",
    "format:check": "pickier format . --check"
  }
}
```

## Next Steps

- [Configuration Guide](/guide/configuration) - Full configuration reference
- [CLI Commands](/guide/cli) - All CLI options
- [Rules Reference](/rules/) - Available lint rules
- [CI/CD Integration](/guide/ci-cd) - Set up continuous integration
