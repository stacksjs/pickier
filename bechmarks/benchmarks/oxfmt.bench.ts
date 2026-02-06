/**
 * Pickier vs oxfmt vs Prettier — Formatting Benchmark
 *
 * All three tools compared in every group:
 *
 *   1. Programmatic / In-memory
 *      Pickier formatCode() — in-memory, no process spawn
 *      Prettier format()   — in-memory, no process spawn
 *      oxfmt               — piped via stdin (CLI), no JS API available
 *
 *   2. CLI (single file)
 *      All tools spawn a subprocess — fair real-world comparison.
 *
 *   3. CLI Batch (all fixtures sequentially)
 *
 *   4. Throughput — 20 iterations of the large file
 *      Pickier & Prettier in-memory, oxfmt via stdin
 *
 * Run: bun run bench:oxfmt
 */
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { bench, group, run } from 'mitata'
import { defaultConfig, formatCode } from 'pickier'
import * as prettier from 'prettier'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const fixturePaths = {
  small: resolve(__dirname, '../fixtures/small.ts'),
  medium: resolve(__dirname, '../fixtures/medium.ts'),
  large: resolve(__dirname, '../fixtures/large.ts'),
}

const content = {
  small: readFileSync(fixturePaths.small, 'utf-8'),
  medium: readFileSync(fixturePaths.medium, 'utf-8'),
  large: readFileSync(fixturePaths.large, 'utf-8'),
}

const stats = Object.fromEntries(
  Object.entries(content).map(([k, v]) => [k, {
    lines: v.split('\n').length,
    bytes: Buffer.byteLength(v, 'utf8'),
  }]),
) as Record<keyof typeof content, { lines: number, bytes: number }>

// ---------------------------------------------------------------------------
// Resolve CLI binaries once, outside the hot loop
// ---------------------------------------------------------------------------
function which(bin: string): string | null {
  try {
    return execSync(`which ${bin}`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim()
  }
  catch {
    return null
  }
}

const oxfmtGlobal = which('oxfmt')
const oxfmtCmd = oxfmtGlobal ?? 'npx --yes oxfmt'
const prettierGlobal = which('prettier')
const prettierCmd = prettierGlobal ?? 'npx --yes prettier'
const pickierBin = resolve(__dirname, '../../packages/pickier/bin/cli.ts')

// Warm up npx cache so the first bench iteration isn't penalised
try { execSync(`${oxfmtCmd} --version`, { stdio: 'ignore' }) } catch { /* ignore */ }
try { execSync(`${prettierCmd} --version`, { stdio: 'ignore' }) } catch { /* ignore */ }

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const cfg = { ...defaultConfig }

const prettierOpts = {
  parser: 'typescript' as const,
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  printWidth: 100,
}

/** oxfmt via stdin — the only way to call it since it has no JS API */
function stdinOxfmt(src: string): void {
  try {
    execSync(`${oxfmtCmd} format --stdin-filepath bench.ts`, {
      input: src,
      stdio: ['pipe', 'ignore', 'ignore'],
    })
  }
  catch { /* non-zero exit expected */ }
}

function cliOxfmt(filePath: string): void {
  try { execSync(`${oxfmtCmd} format --check ${filePath}`, { stdio: 'ignore' }) }
  catch { /* non-zero exit expected */ }
}

function cliPrettier(filePath: string): void {
  try { execSync(`${prettierCmd} --check ${filePath}`, { stdio: 'ignore' }) }
  catch { /* non-zero exit expected */ }
}

function cliPickier(filePath: string): void {
  try {
    execSync(`bun ${pickierBin} run ${filePath} --mode format --check`, {
      stdio: 'ignore',
      env: { ...process.env, PICKIER_NO_AUTO_CONFIG: '1' },
    })
  }
  catch { /* non-zero exit expected */ }
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------
console.log(`\n${'='.repeat(80)}`)
console.log('         PICKIER vs OXFMT vs PRETTIER — Formatting Benchmark')
console.log('='.repeat(80))
console.log('\nFixtures:')
console.log(`  Small:  ${stats.small.lines} lines  (${(stats.small.bytes / 1024).toFixed(1)} KB)`)
console.log(`  Medium: ${stats.medium.lines} lines  (${(stats.medium.bytes / 1024).toFixed(1)} KB)`)
console.log(`  Large:  ${stats.large.lines} lines  (${(stats.large.bytes / 1024).toFixed(1)} KB)`)
console.log()
console.log('Tools:')
console.log(`  Pickier:   formatCode() in-memory  +  bun CLI`)
console.log(`  oxfmt:     ${oxfmtGlobal ?? `(via npx)`}  — stdin pipe + CLI  (no JS API)`)
console.log(`  Prettier:  format() in-memory  +  ${prettierGlobal ?? 'npx'} CLI`)
console.log(`${'='.repeat(80)}\n`)

// ===================================================================
// 1. Programmatic — Pickier & Prettier in-memory, oxfmt via stdin
// ===================================================================

for (const [label, size] of [['Small', 'small'], ['Medium', 'medium'], ['Large', 'large']] as const) {
  group(`In-memory — ${label} File (${stats[size].lines} lines)`, () => {
    bench('Pickier', () => {
      formatCode(content[size], cfg, 'bench.ts')
    })

    bench('oxfmt (stdin)', () => {
      stdinOxfmt(content[size])
    })

    bench('Prettier', async () => {
      await prettier.format(content[size], prettierOpts)
    })
  })
}

// ===================================================================
// 2. CLI — every tool spawns a process and reads the file
// ===================================================================

for (const [label, size] of [['Small', 'small'], ['Medium', 'medium'], ['Large', 'large']] as const) {
  group(`CLI — ${label} File (${stats[size].lines} lines)`, () => {
    bench('Pickier', () => {
      cliPickier(fixturePaths[size])
    })

    bench('oxfmt', () => {
      cliOxfmt(fixturePaths[size])
    })

    bench('Prettier', () => {
      cliPrettier(fixturePaths[size])
    })
  })
}

// ===================================================================
// 3. CLI Batch — format all three fixtures sequentially
// ===================================================================

group('CLI Batch — All Files', () => {
  bench('Pickier', () => {
    for (const fp of Object.values(fixturePaths)) cliPickier(fp)
  })

  bench('oxfmt', () => {
    for (const fp of Object.values(fixturePaths)) cliOxfmt(fp)
  })

  bench('Prettier', () => {
    for (const fp of Object.values(fixturePaths)) cliPrettier(fp)
  })
})

// ===================================================================
// 4. Throughput — 20 iterations of the large file
//    Pickier & Prettier in-memory, oxfmt via stdin
// ===================================================================

group('Throughput — Large File x 20', () => {
  bench('Pickier', () => {
    for (let i = 0; i < 20; i++) formatCode(content.large, cfg, 'bench.ts')
  })

  bench('oxfmt (stdin)', () => {
    for (let i = 0; i < 20; i++) stdinOxfmt(content.large)
  })

  bench('Prettier', async () => {
    for (let i = 0; i < 20; i++) await prettier.format(content.large, prettierOpts)
  })
})

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
await run({ colors: true })

console.log(`\n${'='.repeat(80)}`)
console.log('Done.')
console.log(`${'='.repeat(80)}\n`)
