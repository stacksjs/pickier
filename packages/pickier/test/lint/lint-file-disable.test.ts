import { describe, expect, it } from 'bun:test'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runLint } from '../../src/linter'

function tmp(): string {
  return mkdtempSync(join(tmpdir(), 'pickier-lint-file-disable-'))
}

describe('file-level disable directives', () => {
  it('suppresses no-console with /* pickier-disable no-console */', async () => {
    const dir = tmp()
    const file = 'a.ts'
    const src = [
      '/* pickier-disable no-console */',
      '// Test file',
      'function test() {',
      '  console.log(\'This should be suppressed\')',
      '}',
      '',
    ].join('\n')
    writeFileSync(join(dir, file), src, 'utf8')

    const code = await runLint([dir], { reporter: 'json' })
    expect(code).toBe(0)
  })

  it('suppresses no-console with /* eslint-disable no-console */', async () => {
    const dir = tmp()
    const file = 'b.ts'
    const src = [
      '/* eslint-disable no-console */',
      'console.log(1)',
      'console.log(2)',
      '',
    ].join('\n')
    writeFileSync(join(dir, file), src, 'utf8')

    const code = await runLint([dir], { reporter: 'json' })
    expect(code).toBe(0)
  })

  it('suppresses all rules with /* pickier-disable */', async () => {
    const dir = tmp()
    const file = 'c.ts'
    const src = [
      '/* pickier-disable */',
      'debugger',
      'console.log(1)',
      '',
    ].join('\n')
    writeFileSync(join(dir, file), src, 'utf8')

    const code = await runLint([dir], { reporter: 'json' })
    expect(code).toBe(0)
  })

  it('suppresses with // pickier-disable inline comment', async () => {
    const dir = tmp()
    const file = 'd.ts'
    const src = [
      '// pickier-disable no-console',
      'console.log(1)',
      'console.log(2)',
      '',
    ].join('\n')
    writeFileSync(join(dir, file), src, 'utf8')

    const code = await runLint([dir], { reporter: 'json' })
    expect(code).toBe(0)
  })

  it('inline disable only affects lines after it', async () => {
    const dir = tmp()
    const file = 'e.ts'
    const src = [
      'console.log(0) // line 1 - should warn',
      '// pickier-disable no-console',
      'console.log(1) // line 3 - suppressed',
      '',
    ].join('\n')
    writeFileSync(join(dir, file), src, 'utf8')

    const code = await runLint([dir], { reporter: 'json', maxWarnings: 0 })
    expect(code).toBe(1) // should have 1 warning for line 1
  })

  it('can re-enable rules after disable', async () => {
    const dir = tmp()
    const file = 'e2.ts'
    const src = [
      '// pickier-disable no-console',
      'console.log(1) // suppressed',
      '// pickier-enable no-console',
      'console.log(2) // not suppressed',
      '',
    ].join('\n')
    writeFileSync(join(dir, file), src, 'utf8')

    const code = await runLint([dir], { reporter: 'json', maxWarnings: 0 })
    expect(code).toBe(1) // should have 1 warning for line 4
  })

  it('suppresses plugin rules with file-level disable', async () => {
    const dir = tmp()
    const file = 'f.ts'
    const src = [
      '/* pickier-disable sort-objects */',
      'const _obj = { b: 1, a: 2 }',
      '',
    ].join('\n')
    writeFileSync(join(dir, file), src, 'utf8')

    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'json', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'off', noConsole: 'off' },
      pluginRules: { 'sort-objects': 'warn', 'pickier/no-unused-vars': 'off' },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(0)
  })
})
