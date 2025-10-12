# Test Suite Structure

This directory contains all tests for the Pickier package, organized into logical categories.

## Directory Structure

```
test/
├── core/              # Core functionality & utilities
│   ├── ast.test.ts
│   ├── utils.test.ts
│   ├── ignored-dirs.test.ts
│   ├── ignored-dirs-cli.test.ts
│   └── style-consistency.test.ts
│
├── format/            # Formatting tests
│   ├── format.test.ts
│   ├── format-more.test.ts
│   ├── format-advanced-cases.test.ts
│   ├── format-edge-cases.test.ts
│   ├── format-semi.test.ts
│   ├── format-semi-edge.test.ts
│   ├── quotes-indent.test.ts
│   ├── formatter-fixtures.test.ts
│   └── imports/       # Import formatting
│       ├── format-imports.test.ts
│       ├── format-import-edge-cases.test.ts
│       └── format-imports-edge.test.ts
│
├── lint/              # Linting tests
│   ├── lint.test.ts
│   ├── lint-more.test.ts
│   ├── lint-config.test.ts
│   ├── lint-disable-next-line.test.ts
│   ├── lint-fixtures-disable-next-line.test.ts
│   └── lint-programmatic.test.ts
│
├── rules/             # ESLint rules tests
│   ├── sort/          # Sort rules (13 tests)
│   ├── style/         # Style rules (5 tests)
│   ├── quality/       # Code quality rules (4 tests)
│   ├── imports/       # Import rules (3 tests)
│   ├── typescript/    # TypeScript rules (3 tests)
│   ├── regexp/        # RegExp rules (2 tests)
│   └── rules-pickier-edge-cases.test.ts
│
├── plugin/            # Plugin system tests
│   ├── plugin-system.test.ts
│   └── plugin-system-advanced.test.ts
│
├── fixtures/          # Test fixtures
├── output/            # Test output files
└── helpers.ts         # Shared test utilities
```

## Running Tests

```bash
# Run all tests
bun test

# Run tests for specific category
bun test test/format
bun test test/lint
bun test test/rules
bun test test/plugin
bun test test/core

# Run tests for specific subcategory
bun test test/rules/sort
bun test test/rules/style
bun test test/format/imports
```

## Test Helpers

The `helpers.ts` file provides common utilities to reduce code duplication:

```typescript
import { formatHelpers, lintHelpers, ruleHelpers } from './helpers'

// Create temp directories for testing
const tempDir = formatHelpers.createTempDir()
```

## Adding New Tests

1. **Determine the category** - Is it format, lint, rules, plugin, or core?
2. **Choose the right subcategory** - For rules, determine if it's sort, style, quality, imports, typescript, or regexp
3. **Follow naming conventions** - Use descriptive names that match the pattern
4. **Use test helpers** - Import and use helpers from `helpers.ts` to reduce duplication
5. **Update imports** - Ensure relative paths to `src/` are correct based on nesting level

## Test File Naming

- **Format tests**: `format-{feature}.test.ts`
- **Lint tests**: `lint-{feature}.test.ts`
- **Rule tests**: `rules-{rule-name}.test.ts`
- **Plugin tests**: `plugin-{feature}.test.ts`
- **Core tests**: `{feature}.test.ts`
