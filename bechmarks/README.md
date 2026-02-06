# Pickier Benchmarks

Performance benchmarks comparing Pickier against other tools. All benchmarks use [mitata](https://github.com/evanwashere/mitata) and run on Bun.

## Results

Measured on an Apple M3 Pro with Bun 1.3.9. All tools use equivalent settings (single quotes, no semicolons, 2-space indent). Pickier and Prettier use their in-memory APIs; oxfmt and Biome have no JS formatting API, so they are called via stdin pipe.

### Formatting — In-memory API

Pickier `formatCode()` and Prettier `format()` run in-process. oxfmt and Biome are piped via stdin (no JS formatting API).

| File | Pickier | Biome (stdin) | oxfmt (stdin) | Prettier |
|------|--------:|--------------:|--------------:|---------:|
| Small (52 lines, 1 KB) | **41 us** | 40 ms | 51 ms | 1.59 ms |
| Medium (419 lines, 10 KB) | **417 us** | 42 ms | 50 ms | 10.2 ms |
| Large (1,279 lines, 31 KB) | **1.25 ms** | 46 ms | 50 ms | 28.1 ms |

Pickier's in-memory API is 22-39x faster than Prettier and orders of magnitude faster than tools that must spawn a process per call.

### Formatting — CLI

All four tools spawn a process and read the file from disk. Pickier uses its compiled native binary (`bun build --compile --minify`).

| File | Pickier | Biome | oxfmt | Prettier |
|------|--------:|------:|------:|---------:|
| Small (52 lines) | **37 ms** | 43 ms | 68 ms | 105 ms |
| Medium (419 lines) | **38 ms** | 53 ms | 71 ms | 143 ms |
| Large (1,279 lines) | **40 ms** | 90 ms | 73 ms | 187 ms |

Pickier's compiled binary beats Biome's native Rust binary across all file sizes — **37ms vs 43ms on small files**, and pulling further ahead on larger files. Prettier is 2.8-4.7x slower across all sizes.

### Formatting — CLI Batch (all fixtures sequential)

| Tool | Time |
|------|-----:|
| Pickier | **121 ms** |
| Biome | 187 ms |
| oxfmt | 216 ms |
| Prettier | 423 ms |

### Formatting — Throughput (large file x 20)

| Tool | Time |
|------|-----:|
| Pickier | **26 ms** |
| Prettier | 524 ms |
| Biome (stdin) | 957 ms |
| oxfmt (stdin) | 1,040 ms |

At scale, Pickier is 20x faster than Prettier and 37x faster than Biome/oxfmt.

### Linting — Pickier vs ESLint (programmatic)

From the `bench:lint` suite using the programmatic API.

| File | Pickier | ESLint |
|------|--------:|-------:|
| Small (52 lines) | 172 us | **34 us** |
| Medium (419 lines) | 824 us | — |

ESLint is faster for pure linting of small files since it specializes in this. Pickier's advantage is the integrated lint + format workflow — no need to run two separate tools.

### Combined — Lint + Format Workflow

From the `bench:combined` suite. Compares Pickier's single-tool workflow against ESLint + Prettier.

| File | Pickier | ESLint + Prettier |
|------|--------:|------------------:|
| Small (52 lines) | **653 us** | ~4.5 ms |

When you need both linting and formatting, Pickier's integrated approach avoids the overhead of coordinating two separate tools.

## Running

```bash
bun install

# All benchmarks
bun run bench

# Individual suites
bun run bench:lint        # Linting: Pickier vs ESLint
bun run bench:format      # Formatting: Pickier vs Prettier vs Biome
bun run bench:combined    # Combined lint + format workflows
bun run bench:format-comparison  # Pickier vs oxfmt vs Biome vs Prettier
bun run bench:memory      # Memory usage under repeated operations
bun run bench:parsing     # AST parsing: TypeScript vs Babel
bun run bench:rules       # Individual rule execution overhead
bun run bench:comparison  # Comparison tables with detailed output
bun run bench:breakdown   # Per-file-size analysis with code metrics
bun run bench:all         # lint + format + combined sequentially
```

## Benchmark Suites

### Linting (`bench:lint`)

Compares Pickier's programmatic linting API against ESLint across small (52 lines), medium (419 lines), and large (1,279 lines) TypeScript fixtures. Tests single-file linting, batch linting, and cold/warm performance.

### Formatting (`bench:format`)

Compares Pickier's formatting against Prettier and Biome. Covers single-file formatting, multi-file batches, in-memory string formatting, and parallel processing.

### Combined (`bench:combined`)

Tests real-world lint + format workflows. Compares Pickier's integrated approach against running ESLint + Prettier as separate tools, both sequential and parallel.

### Format Comparison (`bench:format-comparison`)

Head-to-head formatting comparison of Pickier, oxfmt, Biome, and Prettier. Includes in-memory API, CLI single-file, CLI batch, and throughput benchmarks. oxfmt and Biome are called via stdin since they have no JS formatting API.

### Memory (`bench:memory`)

Measures memory consumption under load: repeated operations (100x, 1000x), stability/leak detection, large batch processing, and concurrent processing.

### Parsing (`bench:parsing`)

Compares TypeScript's built-in parser against Babel for AST generation speed, traversal, repeated parsing, and error recovery.

### Rules (`bench:rules`)

Measures individual rule execution times, multi-rule overhead, scaling by file size, and plugin coordination costs.

### Comparison Report (`bench:comparison`)

Generates formatted comparison tables covering linting, formatting, combined workflows, throughput, and batch processing.

### Breakdown (`bench:breakdown`)

Per-file-size analysis with detailed code metrics (lines, code density, imports/exports, functions, classes, interfaces) and scaling characteristics.

## Fixtures

Three TypeScript files in `fixtures/` designed to cover different scales:

| Fixture | Lines | Size | Description |
|---------|------:|-----:|-------------|
| `small.ts` | 52 | 1 KB | Simple class with basic TypeScript patterns |
| `medium.ts` | 419 | 10 KB | Multiple classes, async/await, Express patterns |
| `large.ts` | 1,279 | 31 KB | Full application with services, repositories, and complex types |

## Environment Variables

```bash
PICKIER_CONCURRENCY=16       # Parallel file processing workers (default: 8)
PICKIER_NO_AUTO_CONFIG=1     # Skip config file loading
PICKIER_TIMEOUT_MS=8000      # Glob timeout in ms
PICKIER_RULE_TIMEOUT_MS=5000 # Per-rule timeout in ms
```

## Tips for Accurate Results

- Close other applications to reduce CPU noise
- Run multiple times for statistical significance
- First runs are often slower due to JIT warmup
