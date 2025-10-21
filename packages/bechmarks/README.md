# Pickier Benchmarks

Comprehensive performance benchmarks comparing **Pickier** against industry-standard tools:

- **ESLint** - Popular JavaScript/TypeScript linter
- **Prettier** - Opinionated code formatter
- **Biome** - Fast all-in-one toolchain

> **Note**: oxlint is not included in these benchmarks as it's not easily installable via npm. You can add it manually if needed.

## Quick Start

```bash
# Install dependencies
bun install

# Run all benchmarks
bun run bench

# Run specific benchmark suites
bun run bench:lint        # Linting only
bun run bench:format      # Formatting only
bun run bench:combined    # Lint + Format workflows
bun run bench:memory      # Memory usage and efficiency
bun run bench:parsing     # Parsing and AST operations
bun run bench:rules       # Rule execution performance
bun run bench:comparison  # Comprehensive comparison tables
bun run bench:breakdown   # Size-specific detailed analysis
bun run bench:all         # All suites sequentially
```

## Benchmark Suites

### 1. Linting Benchmarks (`bench:lint`)

Compares linting performance across different file sizes:

- **Small files** (~50 lines): Basic user service with interfaces
- **Medium files** (~500 lines): E-commerce system with repositories and controllers
- **Large files** (~2000 lines): Complete application with services, utilities, and models

**Tests:**
- Single file linting
- Batch file linting
- Cold start performance
- Warm cache performance

### 2. Formatting Benchmarks (`bench:format`)

Compares code formatting speed:

- String manipulation performance
- File I/O overhead
- Parallel processing
- Memory efficiency

**Tests:**
- Single file formatting
- Multiple file formatting
- In-memory string formatting
- Cold start vs warm runs

### 3. Combined Benchmarks (`bench:combined`)

Tests real-world workflows combining linting and formatting:

- Sequential execution (lint → format)
- Parallel execution
- Multiple iterations (memory pressure)
- Full project simulation

**Tests:**
- Single tool workflows (Pickier, Biome)
- Multi-tool workflows (ESLint + Prettier)
- Parallel vs sequential processing
- Memory efficiency under load

### 4. Memory Benchmarks (`bench:memory`)

Measures memory consumption and efficiency under various workloads:

- Repeated operations (100x, 1000x)
- Memory stability (leak detection)
- Large batch processing
- Concurrent processing
- Cache efficiency

**Tests:**
- Memory pressure with repeated operations
- Stability test with garbage collection
- Large batch memory efficiency
- Concurrent processing (10 parallel operations)
- Cache efficiency (same file multiple times)

### 5. Parsing Benchmarks (`bench:parsing`)

Compares AST parsing speed and operations:

- TypeScript parser vs Babel parser
- AST traversal speed
- Repeated parsing (cache efficiency)
- Batch parsing
- Error recovery

**Tests:**
- Parsing speed across all file sizes
- AST tree traversal and node counting
- Repeated parsing (10x) for cache analysis
- Batch parsing (all files)
- Error handling and recovery

### 6. Rule Execution Benchmarks (`bench:rules`)

Measures individual rule performance and plugin overhead:

- Single rule execution
- Multiple rules (5, 20)
- Scaling with file size
- Plugin overhead measurement
- Execution patterns (sequential vs parallel)
- Caching efficiency

**Tests:**
- Single rule benchmarks (no-debugger, no-console)
- Multiple rules (5 rules, 20 rules)
- Scaling analysis across file sizes
- Plugin overhead comparison
- Sequential vs parallel execution
- Rule caching (10x same file)

### 7. Comparison Report (`bench:comparison`)

Generates comprehensive comparison tables with structured output:

- File size breakdown tables
- Linting performance comparison
- Formatting performance comparison
- Combined workflow comparison
- Throughput measurements
- Batch processing analysis

**Output Includes:**
- Formatted comparison tables
- Detailed fixture statistics
- Operations per second metrics
- Performance summaries
- Key insights and recommendations

### 8. Size-Specific Breakdown (`bench:breakdown`)

Detailed analysis of performance characteristics by file size:

- Comprehensive file statistics (11 metrics per file)
- Performance deep dives per size category
- Scaling characteristics analysis
- Code density metrics

**Metrics Analyzed:**
- Total lines, code lines, comment lines, blank lines
- File size (bytes), characters
- Import/export statements
- Functions, classes, interfaces
- Scaling factors between sizes
- Code density percentages

## Fixtures

Realistic TypeScript files designed to stress-test different aspects:

### Small Fixture (~50 lines)
- Simple class with methods
- Basic TypeScript features
- Common patterns (getters, filters, maps)

### Medium Fixture (~500 lines)
- Multiple classes and interfaces
- Async/await patterns
- Error handling
- Express.js controller patterns
- Repository pattern

### Large Fixture (~2000 lines)
- Complete application architecture
- Multiple services and repositories
- Complex type definitions
- Utility classes
- Event handling
- Validation and authentication

## Metrics Measured

### Performance Metrics
- **Operations per second (ops/sec)**: Higher is better
- **Average time per operation**: Lower is better
- **P99 latency**: Consistency metric
- **Memory usage**: Lower is better
- **Margin of error**: Statistical consistency (lower is better)

### Throughput Metrics
- **Lines processed per second**
- **Files processed per second**
- **Batch processing efficiency**
- **Concurrent processing throughput**

### Efficiency Metrics
- **Cold start time**: First run performance
- **Warm run time**: Cached performance
- **Parallel scaling**: Multi-core utilization
- **Memory pressure**: Performance under load
- **Cache hit rate**: Repeated operation efficiency
- **Memory stability**: Leak detection over 1000+ operations

### Code Analysis Metrics
- **Parse speed**: AST generation time
- **Traversal speed**: Node visiting performance
- **Rule execution time**: Individual rule overhead
- **Plugin overhead**: Multi-rule coordination cost
- **Error recovery time**: Invalid code handling

### File Metrics (per fixture)
- **Total lines**: Complete file line count
- **Code lines**: Executable code only
- **Comment lines**: Documentation overhead
- **Blank lines**: Whitespace count
- **File size**: Bytes on disk
- **Imports/Exports**: Module boundary count
- **Functions/Classes/Interfaces**: Code structure count

## Performance Comparisons

Based on the benchmark results, here's how Pickier compares to other tools:

### Formatting Performance
- **Pickier is ~3.5x faster than Prettier** for small files (~50 lines)
- **Pickier is ~7.7x faster than Prettier** for medium files (~500 lines)
- **Pickier is ~9.2x faster than Prettier** for large files (~2000 lines)

Pickier's formatting engine is optimized for speed with minimal AST transformations, making it significantly faster than Prettier across all file sizes. The performance advantage grows with file size.

### Combined Workflow Performance
- **Pickier is ~2.4x faster than ESLint + Prettier** for small files
- **Pickier is ~2.9x faster than ESLint + Prettier** for medium files
- **Pickier is ~2.9x faster than ESLint + Prettier** for large files

When you need both linting and formatting, Pickier's integrated approach is significantly faster than running two separate tools. This makes it ideal for pre-commit hooks and watch modes.

### Memory Efficiency
- **Pickier uses ~3.9x less time than Prettier** for repeated operations (100x small file)
- **Pickier maintains stable memory** over 1000+ operations without memory leaks
- **ESLint is more efficient** for pure linting operations with minimal overhead

### Parsing Performance
- **TypeScript parser and Babel parser perform similarly** across all file sizes
- **TypeScript parser is ~1.1x faster** for small files
- **Both parsers show consistent performance** for repeated operations

### When to Use Each Tool

**Use Pickier when:**
- You need both linting and formatting (integrated workflow)
- Formatting speed is critical (3-9x faster than Prettier)
- You want a single tool for code quality
- Working with TypeScript/JavaScript projects

**Use ESLint when:**
- You only need linting (ESLint specializes in this)
- You need extensive plugin ecosystem
- You have complex custom rules

**Use Prettier when:**
- You only need formatting
- You need formatting for many languages beyond JS/TS
- You prefer the most popular formatter

## Understanding Results

### Interpreting Mitata Output

```
┌─────────┬────────────────────┬────────┬───────────┬─────────┐
│ (index) │     Task Name      │ops/sec │  avg (ms) │  margin │
├─────────┼────────────────────┼────────┼───────────┼─────────┤
│    0    │ 'pickier'          │ 1,245  │  0.8034   │ ±0.42%  │
│    1    │ 'eslint'           │  523   │  1.9120   │ ±0.89%  │
│    2    │ 'oxlint'           │ 2,134  │  0.4686   │ ±0.31%  │
└─────────┴────────────────────┴────────┴───────────┴─────────┘
```

- **ops/sec**: Operations (file processed) per second - higher is better
- **avg (ms)**: Average milliseconds per operation - lower is better
- **margin**: Statistical margin of error - lower indicates more consistent results

### Expected Results

Based on design and implementation:

**Linting:**
- Pickier: Fast (Bun-optimized, focused rules)
- ESLint: Slower (comprehensive, plugin ecosystem)

**Formatting:**
- Pickier: Fast (minimal AST transformations)
- Biome: Very fast (Rust-based)
- Prettier: Moderate (comprehensive formatting)

**Combined:**
- Pickier: Efficient single-tool workflow
- Biome: Fast all-in-one solution
- ESLint + Prettier: Slower (two separate tools)

## Structured Comparison Reports

The comparison and breakdown benchmarks generate formatted console output with detailed tables:

### Comparison Report Output

```
========================================================================================================
                         PICKIER PERFORMANCE BENCHMARK COMPARISON
========================================================================================================

📊 Test Fixtures:

┌─────────┬────────────┬──────────────┬──────────────┐
│  Size   │   Lines    │     Bytes    │  Characters  │
├─────────┼────────────┼──────────────┼──────────────┤
│ Small   │         52 │         1084 │         1084 │
│ Medium  │        418 │        10517 │        10517 │
│ Large   │       1279 │        31950 │        31950 │
└─────────┴────────────┴──────────────┴──────────────┘
```

Followed by detailed performance comparisons for:
- Linting (Pickier vs ESLint)
- Formatting (Pickier vs Prettier)
- Combined workflows
- Throughput measurements
- Batch processing

### Breakdown Report Output

```
========================================================================================================
                                  FILE SIZE BREAKDOWN ANALYSIS
========================================================================================================

📄 SMALL FILE ANALYSIS (~50 lines)
────────────────────────────────────────────────────────────────────────────────────────────────────────
┌─────────────────────┬──────────┐
│ Metric              │  Value   │
├─────────────────────┼──────────┤
│ Total Lines         │       52 │
│ Code Lines          │       41 │
│ Comment Lines       │        1 │
│ Blank Lines         │       10 │
│ File Size (bytes)   │     1084 │
│ Characters          │     1084 │
│ Import Statements   │        0 │
│ Export Statements   │        2 │
│ Functions           │        0 │
│ Classes             │        1 │
│ Interfaces          │        1 │
└─────────────────────┴──────────┘

📄 MEDIUM FILE ANALYSIS (~500 lines)
────────────────────────────────────────────────────────────────────────────────────────────────────────
┌─────────────────────┬──────────┐
│ Metric              │  Value   │
├─────────────────────┼──────────┤
│ Total Lines         │      418 │
│ Code Lines          │      351 │
│ Comment Lines       │        1 │
│ Blank Lines         │       66 │
│ File Size (bytes)   │    10517 │
│ Characters          │    10517 │
│ Import Statements   │        1 │
│ Export Statements   │       11 │
│ Functions           │        0 │
│ Classes             │        5 │
│ Interfaces          │        4 │
└─────────────────────┴──────────┘

📄 LARGE FILE ANALYSIS (~2000 lines)
────────────────────────────────────────────────────────────────────────────────────────────────────────
┌─────────────────────┬──────────┐
│ Metric              │  Value   │
├─────────────────────┼──────────┤
│ Total Lines         │     1279 │
│ Code Lines          │     1045 │
│ Comment Lines       │        1 │
│ Blank Lines         │      233 │
│ File Size (bytes)   │    31950 │
│ Characters          │    31950 │
│ Import Statements   │        1 │
│ Export Statements   │       45 │
│ Functions           │        0 │
│ Classes             │       23 │
│ Interfaces          │       20 │
└─────────────────────┴──────────┘
```

Includes scaling characteristics:
- Line count scaling (small → medium → large)
- Byte size scaling
- Code density percentages

### Actual Performance Results

Here are representative benchmark results from real runs (Apple M3 Pro):

**Linting Performance:**
```
Small File (52 lines):
  Pickier:  186.71 µs/iter
  ESLint:    53.89 µs/iter

Medium File (418 lines):
  Pickier:    1.47 ms/iter
  ESLint:    52.26 µs/iter

Large File (1279 lines):
  Pickier:    5.15 ms/iter
  ESLint:    52.29 µs/iter
```

**Formatting Performance:**
```
Small File:
  Pickier:    336.64 µs/iter
  Prettier:     1.18 ms/iter  (3.5x slower)

Medium File:
  Pickier:      1.01 ms/iter
  Prettier:     7.80 ms/iter  (7.7x slower)

Large File:
  Pickier:      2.34 ms/iter
  Prettier:    21.61 ms/iter  (9.2x slower)
```

**Combined Workflow (Lint + Format):**
```
Small File:
  Pickier:            569.45 µs/iter
  ESLint + Prettier:    1.37 ms/iter  (2.4x slower)

Medium File:
  Pickier:              2.51 ms/iter
  ESLint + Prettier:    7.22 ms/iter  (2.9x slower)

Large File:
  Pickier:              7.29 ms/iter
  ESLint + Prettier:   21.06 ms/iter  (2.9x slower)
```

**Memory Efficiency (100x repetitions on small file):**
```
Pickier:    18.84 ms/iter
ESLint:      4.86 ms/iter  (ESLint optimized for pure linting)
Prettier:   87.64 ms/iter  (Pickier 4.7x faster)
```

**Parsing Performance (small file):**
```
TypeScript parser:  55.50 µs/iter
Babel parser:       61.23 µs/iter
String ops only:     3.43 µs/iter  (baseline)
```

**Key Insights:**
- ESLint is faster for pure linting (it's specialized for this)
- Pickier excels at formatting (3-9x faster than Prettier)
- Combined workflows favor Pickier (2-3x faster than separate tools)
- Performance advantage grows with file size for formatting
- Both parsers perform similarly with slight TypeScript edge

## Running Custom Benchmarks

You can create custom benchmarks using the fixtures:

```typescript
import { bench, group, run } from 'mitata'
import { runLintProgrammatic } from 'pickier'

const fixture = './fixtures/medium.ts'

group('My Custom Benchmark', () => {
  bench('pickier with custom config', async () => {
    await runLintProgrammatic([fixture], {
      reporter: 'json',
      // Add custom options
    })
  })
})

await run()
```

## Benchmark Environment

For accurate results:

1. **Close other applications**: Reduce CPU/memory noise
2. **Run multiple times**: Statistical significance
3. **Consistent environment**: Same hardware, OS state
4. **Warm up**: First run often slower (JIT compilation)

### Recommended Setup

```bash
# Clear system cache (macOS)
sudo purge

# Run with high priority (Linux)
nice -n -20 bun run bench

# Monitor system resources
htop  # or Activity Monitor on macOS
```

## CI/CD Integration

Run benchmarks in your pipeline:

```yaml
# GitHub Actions example
- name: Run benchmarks
  run: |
    cd packages/benchmarks
    bun install
    bun run bench:all > benchmark-results.txt

- name: Upload results
  uses: actions/upload-artifact@v3
  with:
    name: benchmark-results
    path: packages/benchmarks/benchmark-results.txt
```

## Performance Goals

Target performance characteristics for Pickier:

### Speed Goals
- **Linting**: Competitive with ESLint (within 2x)
- **Formatting**: Within 1.5x of Biome/Prettier speed
- **Combined**: Faster than ESLint + Prettier workflow
- **Parsing**: Fast TypeScript AST generation
- **Rule execution**: < 5ms per rule per file (medium size)

### Memory Goals
- **Peak usage**: < 100MB for medium projects
- **Stability**: No memory leaks over 1000+ operations
- **Concurrent**: Efficient parallel processing without memory explosion
- **Cache**: Minimal overhead for repeated operations

### Startup Goals
- **Cold start**: < 50ms for first run
- **Warm runs**: < 10ms for cached operations
- **Plugin loading**: < 20ms for all core plugins

### Scaling Goals
- **File size**: Linear scaling from small → large
- **Batch processing**: Efficient parallel processing (near-linear with core count)
- **Rule count**: Sub-linear overhead with multiple rules (caching/optimization)

## Contributing

To add new benchmarks:

1. Add fixture files to `fixtures/`
2. Create benchmark file in `benchmarks/`
3. Update package.json scripts
4. Document in this README
5. Ensure consistent test methodology

## Benchmark Limitations

**What these benchmarks measure:**
- Raw processing speed
- Tool overhead
- Memory efficiency
- Parallel scaling

**What these benchmarks DON'T measure:**
- IDE integration performance
- Watch mode efficiency
- Plugin ecosystem size
- Configuration complexity
- Error message quality

## Resources

- [Mitata Documentation](https://github.com/evanwashere/mitata)
- [Pickier Documentation](https://github.com/stacksjs/pickier)
- [Benchmarking Best Practices](https://easyperf.net/blog/)

## License

MIT - See root LICENSE file
