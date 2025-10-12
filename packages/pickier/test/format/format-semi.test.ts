import { describe, expect, it } from 'bun:test'
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runFormat } from '../../src/formatter'

function tmp(): string {
  return mkdtempSync(join(tmpdir(), 'pickier-semi-'))
}

function _list(dir: string): string[] {
  return readdirSync(dir).filter(f => !f.startsWith('.'))
}

describe('format semi option', () => {
  it('keeps semicolons by default (semi: false)', async () => {
    const dir = tmp()
    const root = join(import.meta.dir, '../fixtures')
    const expected = join(import.meta.dir, '../output')
    const file = 'semi-keep.ts'
    writeFileSync(join(dir, file), readFileSync(join(root, file), 'utf8'), 'utf8')
    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
    const got = readFileSync(join(dir, file), 'utf8')
    const want = readFileSync(join(expected, file), 'utf8')
    expect(got).toBe(want)
  })

  it('removes stylistic semicolons when semi: true', async () => {
    const dir = tmp()
    const root = join(import.meta.dir, '../fixtures')
    const expected = join(import.meta.dir, '../output')
    const file = 'semi-remove.ts'
    writeFileSync(join(dir, file), readFileSync(join(root, file), 'utf8'), 'utf8')

    // Create a config file in temp dir enabling semi removal
    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['.ts'], reporter: 'stylish', cache: false, maxWarnings: -1 },
      format: { extensions: ['.ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: true },
      rules: { noDebugger: 'error', noConsole: 'warn' },
    }, null, 2), 'utf8')

    const code = await runFormat([dir], { write: true, config: cfgPath })
    expect(code).toBe(0)
    const got = readFileSync(join(dir, file), 'utf8')
    const want = readFileSync(join(expected, file), 'utf8')
    expect(got).toBe(want)
  })
})
