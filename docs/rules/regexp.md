# regexp (built-in plugin)

Rules provided by the built-in `regexp` plugin.

- [`no-super-linear-backtracking`](/rules/regexp-no-super-linear-backtracking): detect regex anti-patterns that can cause catastrophic backtracking (heuristic)

See the [Plugin System](/advanced/plugin-system) for configuration examples.

## Best practices

- Keep regex-focused rules enabled in code that parses user input
- Prefer simpler patterns and validate with test cases for adversarial inputs
