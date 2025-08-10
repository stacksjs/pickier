import { describe, expect, it } from 'bun:test'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runFormat } from '../src/cli/run-format'

function tmp(): string {
  return mkdtempSync(join(tmpdir(), 'pickier-format-'))
}

describe('runFormat', () => {
  it('check mode returns 1 when file needs formatting', async () => {
    const dir = tmp()
    const file = join(dir, 'a.ts')
    writeFileSync(file, 'const a = 1; \n\n\n', 'utf8')
    const code = await runFormat([dir], { check: true })
    expect(code).toBe(1)
  })

  it('write mode formats file and returns 0', async () => {
    const dir = tmp()
    const file = join(dir, 'a.ts')
    writeFileSync(file, 'const a = 1; \n\n\n', 'utf8')
    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
    const out = readFileSync(file, 'utf8')
    expect(out).toBe('const a = 1;\n')
  })
})
