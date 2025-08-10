<p align="center"><img src="https://github.com/stacksjs/rpx/blob/main/.github/art/cover.jpg?raw=true" alt="Social Card of this repo"></p>

# A Better Developer Experience

Pickier is a fast formatter and linter that helps you keep your codebase clean and consistent.

- **Fast**: runs on Bun and uses efficient scanning
- **Simple**: one CLI, two core commands: `lint` and `format`
- **Configurable**: customize behavior via `pickier.config.{ts,js,json}`

## Quickstart

```bash
# add to your project (dev dependency)
bun add -d pickier
# pnpm add -D pickier
# npm i -D pickier
# yarn add -D pickier
```

Run Pickier from your project root:

```bash
# check formatting without modifying files
pickier format . --check

# lint with auto-fix for debugger statements
pickier lint src --fix
```

Next, read the Install and Usage pages for more details.
