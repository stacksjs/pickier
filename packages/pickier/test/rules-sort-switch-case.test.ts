import { describe, expect, it } from 'bun:test'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runLint } from '../src/cli/run-lint'

function tmp(): string {
  return mkdtempSync(join(tmpdir(), 'pickier-rule-sort-switch-case-'))
}

describe('pickier/sort-switch-case', () => {
  it('flags unsorted switch cases', async () => {
    const dir = tmp()
    const file = 'a.ts'
    const src = [
      'function f(x: string){',
      '  switch (x) { case \'b\': break; case \'a\': break; default: break }',
      '}',
      '',
    ].join('\\n')
    writeFileSync(join(dir, file), src, 'utf8')

    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'json', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'off', noConsole: 'off' },
      pluginRules: { 'sort-switch-case': 'warn' },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(0)
  })

  it('passes when cases are sorted', async () => {
    const dir = tmp()
    const file = 'b.ts'
    const src = [
      'function f(x: string){',
      '  switch (x) { case \'a\': break; case \'b\': break; default: break }',
      '}',
      '',
    ].join('\\n')
    writeFileSync(join(dir, file), src, 'utf8')

    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'json', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'off', noConsole: 'off' },
      pluginRules: { 'sort-switch-case': 'warn' },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(0)
  })

  it('handles numeric natural ordering when enabled', async () => {
    const dir = tmp()
    const file = 'c.ts'
    const src = [
      'function f(x: string){',
      '  switch (x) { case \'v10\': break; case \'v2\': break; default: break }',
      '}',
      '',
    ].join('\\n')
    writeFileSync(join(dir, file), src, 'utf8')

    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'json', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'off', noConsole: 'off' },
      pluginRules: { 'sort-switch-case': ['warn', { type: 'natural' }] },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(0)
  })

  it('supports custom alphabet ordering', async () => {
    const dir = tmp()
    const file = 'd.ts'
    const src = [
      'function f(x: string){',
      '  switch (x) { case \'b\': break; case \'a\': break; default: break }',
      '}',
      '',
    ].join('\\n')
    writeFileSync(join(dir, file), src, 'utf8')

    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'json', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'off', noConsole: 'off' },
      pluginRules: { 'sort-switch-case': ['warn', { type: 'custom', alphabet: 'ba' }] },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(0)
  })
})
