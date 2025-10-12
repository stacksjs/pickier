import { describe, expect, it } from 'bun:test'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runFormat } from '../../src/formatter'

function tmp(): string {
  return mkdtempSync(join(tmpdir(), 'pickier-semi-edge-'))
}

describe('format semi option (edge cases)', () => {
  it('does not strip normal statement semicolons even when semi: true', async () => {
    const dir = tmp()
    const file = 'a.ts'
    const input = [
      'function f() {',
      '  const x = \'a\' + \'b\';',
      '  return x;',
      '}',
      '',
    ].join('\n')
    writeFileSync(join(dir, file), input, 'utf8')

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
    expect(got).toBe(input)
  })

  it('removes empty statement lines and collapses duplicate trailing semicolons', async () => {
    const dir = tmp()
    const file = 'b.ts'
    const src = [
      'const a = 1;;',
      ';',
      'console.log(a);',
      '',
    ].join('\n')
    const want = [
      'const a = 1;',
      '',
      'console.log(a);',
      '',
    ].join('\n')
    writeFileSync(join(dir, file), src, 'utf8')

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
    expect(got).toBe(want)
  })

  it('keeps semicolons inside for(;;) headers', async () => {
    const dir = tmp()
    const file = 'c.ts'
    const src = [
      'for (let i = 0; i < 2; i++) {',
      '  console.log(i);',
      '}',
      '',
    ].join('\n')
    writeFileSync(join(dir, file), src, 'utf8')

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
    expect(got).toBe(src)
  })
})
