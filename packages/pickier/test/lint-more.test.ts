import { describe, expect, it } from 'bun:test'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runLint } from '../src/linter'

function tmp(): string {
  return mkdtempSync(join(tmpdir(), 'pickier-lint-more-'))
}

describe('runLint (more cases)', () => {
  it('compact reporter outputs single-line diagnostics', async () => {
    const dir = tmp()
    const file = join(dir, 'a.ts')
    writeFileSync(file, 'console.log(1)\ndebugger\n', 'utf8')
    const code = await runLint([dir], { reporter: 'compact' })
    expect(code).toBe(1)
  })

  it('skips files with non-matching extensions', async () => {
    const dir = tmp()
    const file = join(dir, 'a.unknownext')
    writeFileSync(file, 'debugger\n', 'utf8')
    const code = await runLint([dir], { ext: '.ts', reporter: 'json' })
    expect(code).toBe(0)
  })
})
