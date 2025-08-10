import { describe, expect, it } from 'bun:test'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runFormat } from '../src/cli/run-format'

function tmp(): string {
  return mkdtempSync(join(tmpdir(), 'pickier-imports-'))
}

describe('format imports', () => {
  it('sorts, splits type imports, and removes unused', async () => {
    const dir = tmp()
    const file = 'imports-a.ts'
    const root = join(import.meta.dir, 'fixtures')
    const expected = join(import.meta.dir, 'output')

    writeFileSync(join(dir, file), readFileSync(join(root, file), 'utf8'), 'utf8')
    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
    const got = readFileSync(join(dir, file), 'utf8')
    const want = readFileSync(join(expected, file), 'utf8')
    expect(got).toBe(want)
  })

  it('handles leading comments/blank lines and relative vs external ordering', async () => {
    const dir = tmp()
    const file = 'imports-b.ts'
    const root = join(import.meta.dir, 'fixtures')
    const expected = join(import.meta.dir, 'output')

    writeFileSync(join(dir, file), readFileSync(join(root, file), 'utf8'), 'utf8')
    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
    const got = readFileSync(join(dir, file), 'utf8')
    const want = readFileSync(join(expected, file), 'utf8')
    expect(got).toBe(want)
  })
})
