import { describe, expect, it } from 'bun:test'
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runFormat } from '../../src/formatter'
import { runLint } from '../../src/linter'

function tmp(): string {
  return mkdtempSync(join(tmpdir(), 'pickier-disable-fixtures-'))
}

function listFiles(dir: string): string[] {
  return readdirSync(dir).filter(f => !f.startsWith('.') && f.startsWith('disable-'))
}

describe('disable-next-line fixtures', () => {
  it('respects disable-next-line comments with eslint/pickier prefixes', async () => {
    const root = join(import.meta.dir, '../fixtures')
    const expected = join(import.meta.dir, '../output')
    const dir = tmp()

    const fixtures = listFiles(root)
    for (const f of fixtures) {
      const src = readFileSync(join(root, f), 'utf8')
      writeFileSync(join(dir, f), src, 'utf8')
    }

    // Use a config file in temp enabling relevant plugin rules
    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts', 'js'], reporter: 'json', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts', 'js'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'error', noConsole: 'warn' },
      pluginRules: { 'sort-objects': 'warn', 'ts/no-require-imports': 'error' },
    }, null, 2), 'utf8')

    const fmtCode = await runFormat([dir], { write: true, config: cfgPath })
    expect(fmtCode).toBe(0)

    for (const f of fixtures) {
      const got = readFileSync(join(dir, f), 'utf8').replace(/\r\n/g, '\n').replace(/\n+$/g, '\n')
      const want = readFileSync(join(expected, f), 'utf8').replace(/\r\n/g, '\n').replace(/\n+$/g, '\n')
      expect({ file: f, content: got }).toEqual({ file: f, content: want })
    }

    const lintCode = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(lintCode).toBe(0)
  })
})
