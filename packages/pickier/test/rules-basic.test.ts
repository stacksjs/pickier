import { describe, expect, it } from 'bun:test'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runLint } from '../src/cli/run-lint'

function tmp(): string {
  return mkdtempSync(join(tmpdir(), 'pickier-rule-basic-'))
}

describe('built-in rules', () => {
  it('noDebugger removes on --fix', async () => {
    const dir = tmp()
    const file = 'a.ts'
    writeFileSync(join(dir, file), 'debugger\nconsole.log(1)\n', 'utf8')
    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'stylish', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'error', noConsole: 'warn' },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'stylish', fix: true })
    expect(code).toBe(0)
    const got = readFileSync(join(dir, file), 'utf8')
    expect(got.startsWith('console.log')).toBe(true)
  })
})
