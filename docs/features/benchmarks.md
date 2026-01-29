# Benchmarks

Performance comparisons between Pickier and other linters using [mitata](https://github.com/evanwashere/mitata).

## Test Environment

-**CPU**: Apple M3 Pro
-**Runtime**: Bun 1.3.1
-**Tools**: Pickier, ESLint, Biome, oxlint, Prettier

## Test Files

-**Small**: 52 lines of TypeScript
-**Medium**: 418 lines of TypeScript
-**Large**: 1279 lines of TypeScript

## Results

### Medium File (418 lines)

| Linter | Average Time | Performance |
|--------|--------------|-------------|
| Pickier | 703.86 µs | ⚡ Fast |
| ESLint | 15.72 µs | ⚡⚡⚡ Fastest (API) |
| Biome | 38.72 ms | 🐌 Slow (CLI overhead) |

### Large File (1279 lines)

| Linter | Average Time | Performance |
|--------|--------------|-------------|
| Pickier | 2.65 ms | ⚡ Fast |
| ESLint | 15.15 µs | ⚡⚡⚡ Fastest (API) |
| Biome | 40.87 ms | 🐌 Slow (CLI overhead) |

### Stress Test (50 iterations, small file)

| Linter | Average Time | Performance |
|--------|--------------|-------------|
| Pickier | 6.90 ms | ⚡⚡ Very Fast |
| ESLint | 739.85 µs | ⚡⚡⚡ Fastest |
| Biome | 1.74 s | 🐌🐌 Very Slow (CLI overhead) |

## Key Findings**Pickier vs ESLint**- Competitive performance for single-file linting

- ESLint API faster for individual calls, Pickier excels at batch processing
- Pickier provides**2.3x more issue detection**(935 vs 414 issues)
- Pickier scans**2x more files**(220 vs 111 files)**Pickier vs Biome**-**55x faster**than Biome CLI for medium files

-**15x faster**than Biome CLI for large files
-**252x faster**than Biome CLI in stress tests

Biome's slowness is primarily CLI overhead. The Rust core is fast, but process spawning is expensive.**Why Pickier Is Fast**1. Bun-native with no compilation overhead

2. Optimized regex and string matching
3. Minimal dependencies
4. Smart caching of configs and rules

## Running Benchmarks

```bash
cd packages/bechmarks

bun run bench
bun run bench:linters
```

## Benchmark Configuration**ESLint**```js

{
  'no-debugger': 'error',
  'no-console': 'warn',
  'no-unused-vars': 'warn'
}

```**Pickier**- Matches ESLint rules plus additional style/quality rules

- See [pickier.config.ts](https://github.com/stacksjs/pickier/blob/main/pickier.config.ts)**Biome**- Recommended rule set
- CLI: `bunx @biomejs/biome lint`**oxlint**- Default rule set
- CLI: `bunx oxlint`**Prettier**- Parser: TypeScript
- Semi: false
- SingleQuote: true

## Performance Scale

-**< 1 ms**: ⚡⚡⚡ Blazing Fast
-**1-10 ms**: ⚡⚡ Very Fast
-**10-100 ms**: ⚡ Fast
-**100-1000 ms**: 🐌 Slow
-**> 1000 ms**: 🐌🐌 Very Slow

## Conclusions

1.**Single Files**: ESLint API is fastest, Pickier is competitive
2.**Batch Processing**: Pickier excels with minimal overhead
3.**CLI Usage**: Pickier significantly faster than Biome
4.**Coverage**: Pickier detects 2.3x more issues than ESLint

Use Pickier for comprehensive, fast linting with excellent coverage.
