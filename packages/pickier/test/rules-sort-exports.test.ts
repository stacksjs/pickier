import { describe, expect, it } from 'bun:test'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runLint } from '../src/linter'

function tmp(): string {
  return mkdtempSync(join(tmpdir(), 'pickier-rule-sort-exports-'))
}

describe('pickier/sort-exports', () => {
  it('flags unsorted export statements (alphabetical asc)', async () => {
    const dir = tmp()
    const file = 'a.ts'
    const src = [
      'export { MainContent } from \'./components/MainContent\'',
      'export { calculateAge } from \'./utils/calculateAge\'',
      'export { Sidebar } from \'./components/Sidebar\'',
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
      plugins: [{ name: 'pickier', rules: {} }],
      pluginRules: { 'pickier/sort-exports': ['warn', { type: 'alphabetical', order: 'asc' }] },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(0)
  })

  it('respects partitionByNewLine by treating separated blocks independently', async () => {
    const dir = tmp()
    const file = 'b.ts'
    const src = [
      'export { B } from \'./b\'',
      'export { A } from \'./a\'',
      '',
      'export { D } from \'./d\'',
      'export { C } from \'./c\'',
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
      plugins: [{ name: 'pickier', rules: {} }],
      pluginRules: { 'pickier/sort-exports': ['warn', { partitionByNewLine: true }] },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(0)
  })
})
