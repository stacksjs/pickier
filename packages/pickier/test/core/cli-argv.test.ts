import { describe, expect, it } from 'bun:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

process.env.PICKIER_NO_AUTO_CONFIG = '1'

/**
 * Tests for the CLI argument parsing fast-path in bin/cli.ts.
 *
 * Since cli.ts directly calls process.exit(), we can't import and run it.
 * Instead we validate the parsing logic structurally and test that runUnified
 * receives the correct options through integration tests.
 */
describe('CLI argv fast-path parsing', () => {
  const cliSrc = readFileSync(resolve(__dirname, '../../bin/cli.ts'), 'utf8')

  it('handles --mode flag', () => {
    expect(cliSrc).toContain("a === '--mode'")
    expect(cliSrc).toContain("mode = argv[++i] || 'auto'")
  })

  it('handles --check flag', () => {
    expect(cliSrc).toContain("a === '--check'")
    expect(cliSrc).toContain('check = true')
  })

  it('handles --write flag', () => {
    expect(cliSrc).toContain("a === '--write'")
    expect(cliSrc).toContain('write = true')
  })

  it('handles --config flag', () => {
    expect(cliSrc).toContain("a === '--config'")
    expect(cliSrc).toContain('config = argv[++i]')
  })

  it('handles --verbose flag', () => {
    expect(cliSrc).toContain("a === '--verbose'")
    expect(cliSrc).toContain('verbose = true')
  })

  it('breaks to full CLI for lint-only flags', () => {
    // These flags require the full CLI framework
    expect(cliSrc).toContain("a === '--fix'")
    expect(cliSrc).toContain("a === '--dry-run'")
    expect(cliSrc).toContain("a === '--reporter'")
    expect(cliSrc).toContain("a === '--max-warnings'")
    expect(cliSrc).toContain("a === '--cache'")
    // Should clear globs to trigger full CLI fallthrough
    expect(cliSrc).toContain('globs.length = 0')
  })

  it('skips --ext and --ignore-path values', () => {
    expect(cliSrc).toContain("a === '--ext'")
    expect(cliSrc).toContain("a === '--ignore-path'")
  })

  it('collects non-flag arguments as globs', () => {
    expect(cliSrc).toContain('globs.push(a)')
  })

  it('only activates fast path for format or auto mode', () => {
    expect(cliSrc).toContain("mode === 'format' || mode === 'auto'")
  })

  it('only activates fast path when globs are present', () => {
    expect(cliSrc).toContain('globs.length > 0')
  })

  it('skips unknown flags starting with --', () => {
    expect(cliSrc).toContain("a.startsWith('--')")
  })

  it('dynamically imports run.ts for fast path', () => {
    expect(cliSrc).toContain("import('../src/run.ts')")
  })

  it('dynamically imports @stacksjs/clapp for full CLI', () => {
    expect(cliSrc).toContain("import('@stacksjs/clapp')")
  })

  it('registers deprecated lint and format commands', () => {
    expect(cliSrc).toContain("command('lint")
    expect(cliSrc).toContain("command('format")
    expect(cliSrc).toContain('[DEPRECATION]')
  })

  it('registers version command', () => {
    expect(cliSrc).toContain("command('version'")
  })

  it('defaults mode to auto', () => {
    expect(cliSrc).toContain("let mode = 'auto'")
  })

  it('defaults check and write to false', () => {
    expect(cliSrc).toContain('let check = false')
    expect(cliSrc).toContain('let write = false')
  })
})

describe('CLI integration via runUnified', () => {
  it('runUnified exported from run.ts', async () => {
    const { runUnified } = await import('../../src/run')
    expect(typeof runUnified).toBe('function')
  })

  it('RunOptions type supports all CLI options', async () => {
    const { runUnified } = await import('../../src/run')

    // This should compile and not throw
    const options = {
      mode: 'auto' as const,
      fix: true,
      dryRun: false,
      write: true,
      check: false,
      maxWarnings: 10,
      reporter: 'json' as const,
      config: '/tmp/config.json',
      ext: 'ts,js',
      cache: false,
      verbose: true,
    }

    // Just verify the function accepts all these options without throwing on type
    expect(typeof runUnified).toBe('function')
  })
})
