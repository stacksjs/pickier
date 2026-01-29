# CI Usage

Exit codes:

- `format --check`: exits 1 if changes are needed
- `lint`: exits 1 if any errors, or if warnings exceed `maxWarnings`Examples:```bash

pickier format . --check
pickier lint . --max-warnings 0 --reporter compact

```## GitHub Actions```yaml
name: Pickier
on: [push, pull_request]
jobs:
  pickier:
    runs-on: ubuntu-latest
    steps:

      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - name: Format (check)

        run: bunx pickier format . --check

      - name: Lint

        run: bunx pickier lint . --max-warnings 0 --reporter compact
```## Pre-commit hook```bash

# !/usr/bin/env bash

set -euo pipefail

changed=$(git diff --name-only --cached | tr '\n' ' ')
if [ -n "$changed" ]; then
  bunx pickier format $changed --check | cat
  bunx pickier lint $changed --max-warnings 0 --reporter compact | cat
fi

```## JSON reporter in CI

For machine-readable lint results:```bash
bunx pickier lint . --reporter json > pickier-lint.json
```
