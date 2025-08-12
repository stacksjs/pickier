import { describe, expect, it } from 'bun:test'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runLint } from '../src/cli/run-lint'

function tmp(): string {
  return mkdtempSync(join(tmpdir(), 'pickier-lint-disable-next-line-'))
}

describe('disable-next-line directives', () => {
  it('suppresses core rule using eslint-disable-next-line', async () => {
    const dir = tmp()
    const file = 'a.ts'
    const src = [
      '// eslint-disable-next-line no-console',
      'console.log(1)',
      '',
    ].join('\n')
    writeFileSync(join(dir, file), src, 'utf8')

    const code = await runLint([dir], { reporter: 'json' })
    expect(code).toBe(0)
  })

  it('suppresses core rule using pickier-disable-next-line', async () => {
    const dir = tmp()
    const file = 'b.ts'
    const src = [
      '// pickier-disable-next-line no-console',
      'console.log(1)',
      '',
    ].join('\n')
    writeFileSync(join(dir, file), src, 'utf8')

    const code = await runLint([dir], { reporter: 'json' })
    expect(code).toBe(0)
  })

  it('suppresses plugin rule using pickier-disable-next-line for bare id', async () => {
    const dir = tmp()
    const file = 'c.ts'
    const src = [
      '// pickier-disable-next-line sort-objects',
      'const obj = { b: 1, a: 2 }',
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
      pluginRules: { 'sort-objects': 'warn' },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(0)
  })

  it('suppresses plugin rule using eslint-disable-next-line when rule is prefixed', async () => {
    const dir = tmp()
    const file = 'd.ts'
    const src = [
      '// eslint-disable-next-line pickier/sort-objects',
      'const obj = { b: 1, a: 2 }',
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
      pluginRules: { 'pickier/sort-objects': 'warn' },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(0)
  })

  it('suppresses ts/no-require-imports using pickier-disable-next-line', async () => {
    const dir = tmp()
    const file = 'e.ts'
    const src = [
      '// pickier-disable-next-line ts/no-require-imports',
      "const fs = require('fs')",
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
      pluginRules: { 'ts/no-require-imports': 'error' },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(0)
  })

  it('suppresses multiple rules with comma-separated list', async () => {
    const dir = tmp()
    const file = 'f.ts'
    const src = [
      '// eslint-disable-next-line no-console, quotes',
      'console.log("x")',
      '',
    ].join('\n')
    writeFileSync(join(dir, file), src, 'utf8')

    const code = await runLint([dir], { reporter: 'json' })
    expect(code).toBe(0)
  })
}) 