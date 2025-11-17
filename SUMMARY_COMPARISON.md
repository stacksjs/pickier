# Summary Output Comparison

## ESLint Output
```bash
❯ bun run lint
$ bunx --bun eslint .

/Users/chrisbreuer/Code/pickier/packages/pickier/test/core/ast-edge-cases.test.ts
   5:10  error  'runLint' is defined but never used                               unused-imports/no-unused-imports
   6:1   error  Expected "../../src/formatter" to come before "../../src/linter"  perfectionist/sort-imports
  16:25  error  Unexpected template string expression                             no-template-curly-in-string
  25:25  error  Unexpected template string expression                             no-template-curly-in-string

✖ 24 problems (24 errors, 0 warnings)
  4 errors and 0 warnings potentially fixable with the `--fix` option.

error: script "lint" exited with code 1
```

## Pickier Output (NOW!)
```bash
❯ ./packages/pickier/pickier run test-file.ts --mode lint

test-file.ts
error  1:1  noDebugger  Unexpected debugger statement
warn   2:1  noConsole   Unexpected console call
warn   3:20 quotes      Inconsistent quote style
warn   3:1  sort-named-imports  Named imports are not sorted


✖ 4 problems (1 error, 3 warnings)
  1 error and 0 warnings potentially fixable with the `--fix` option.
```

## Features Implemented

✅ **Summary line** showing total problems
✅ **Error/warning breakdown** with proper pluralization
✅ **Fixable count** showing what can be auto-fixed
✅ **Proper exit codes** (1 for errors, 0 for success)
✅ **Color coding** (red for problems, gray for fixable info)
✅ **JSON reporter skips summary** (structured output only)

## Example Outputs

### No Issues
```bash
❯ ./packages/pickier/pickier run clean-file.ts --mode lint
Exit code: 0
```
(No output when clean)

### With Fixable Issues  
```bash
✖ 12 problems (0 errors, 12 warnings)
  0 errors and 1 warning potentially fixable with the `--fix` option.
```

### Mixed Issues
```bash
✖ 26 problems (8 errors, 18 warnings)
  0 errors and 4 warnings potentially fixable with the `--fix` option.
```

## Implementation Details

- Counts fixable issues by checking which rules have `fix()` functions
- Handles both plugin/rule and short-form rule IDs
- Built-in fixable rules: `noDebugger`
- Plugin fixable rules: `sort-imports`, `sort-exports`
