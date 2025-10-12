import { describe, expect, it } from 'bun:test'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runLint } from '../../src/linter'

function tmpDir(): string {
  return mkdtempSync(join(tmpdir(), 'pickier-lint-cfg-'))
}

describe('runLint with config file', () => {
  it('uses a specific config path to disable noConsole', async () => {
    const dir = tmpDir()
    const cfg = join(dir, 'pickier.config.json')
    writeFileSync(cfg, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['.ts'], reporter: 'json', cache: false, maxWarnings: -1 },
      format: { extensions: ['.ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one' },
      rules: { noDebugger: 'error', noConsole: 'off' },
    }), 'utf8')

    const file = join(dir, 'a.ts')
    writeFileSync(file, 'console.log(1)\n', 'utf8')
    const code = await runLint([dir], { config: cfg, reporter: 'json' })
    expect(code).toBe(0)
  })

  it('respects maxWarnings from config (fails on warning)', async () => {
    const dir = tmpDir()
    const cfg = join(dir, 'pickier.config.json')
    writeFileSync(cfg, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['.ts'], reporter: 'stylish', cache: false, maxWarnings: 0 },
      format: { extensions: ['.ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one' },
      rules: { noDebugger: 'off', noConsole: 'warn' },
    }), 'utf8')

    const file = join(dir, 'a.ts')
    writeFileSync(file, 'console.log(1)\n', 'utf8')
    const code = await runLint([dir], { config: cfg })
    expect(code).toBe(1)
  })

  it('supports reporter from config when not provided', async () => {
    const dir = tmpDir()
    const cfg = join(dir, 'pickier.config.json')
    writeFileSync(cfg, JSON.stringify({
      verbose: true,
      ignores: [],
      lint: { extensions: ['.ts'], reporter: 'compact', cache: false, maxWarnings: -1 },
      format: { extensions: ['.ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one' },
      rules: { noDebugger: 'error', noConsole: 'warn' },
    }), 'utf8')

    const file = join(dir, 'a.ts')
    writeFileSync(file, 'console.log(1)\ndebugger\n', 'utf8')
    const code = await runLint([dir], { config: cfg })
    expect(code).toBe(1)
  })
})
