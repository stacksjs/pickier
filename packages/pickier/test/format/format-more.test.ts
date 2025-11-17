import { describe, expect, it } from 'bun:test'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runFormat } from '../../src/formatter'

function tmp(): string {
  return mkdtempSync(join(tmpdir(), 'pickier-format-more-'))
}

describe('runFormat (more cases)', () => {
  it('default mode (no flags) logs needed changes and returns 0', async () => {
    const dir = tmp()
    const file = join(dir, 'a.ts')
    writeFileSync(file, 'const a = 1;  \n\n\n', 'utf8')
    const code = await runFormat([dir], {})
    expect(code).toBe(0)
  })

  it('empty file with write true stays unchanged', async () => {
    const dir = tmp()
    const file = join(dir, 'empty.ts')
    writeFileSync(file, '', 'utf8')
    const code = await runFormat([dir], { write: true, verbose: true })
    expect(code).toBe(0)
    const out = readFileSync(file, 'utf8')
    expect(out).toBe('')
  })

  it('verbose path triggers summary output', async () => {
    const dir = tmp()
    const file = join(dir, 'a.ts')
    writeFileSync(file, 'const a = 1;\n\n', 'utf8')
    const code = await runFormat([dir], { verbose: true })
    expect(code).toBe(0)
  })
})
