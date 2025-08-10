import { describe, expect, it } from 'bun:test'
import { mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runFormat } from '../src/cli/run-format'

function tmp(): string {
  return mkdtempSync(join(tmpdir(), 'pickier-fixtures-'))
}

function listFiles(dir: string): string[] {
  return readdirSync(dir).filter(f => !f.startsWith('.'))
}

describe('formatter fixture snapshots', () => {
  it('formats fixtures to expected outputs', async () => {
    const root = join(import.meta.dir, 'fixtures')
    const expected = join(import.meta.dir, 'output')
    const dir = tmp()

    // copy all fixtures into temp dir
    for (const f of listFiles(root)) {
      const src = readFileSync(join(root, f), 'utf8')
      writeFileSync(join(dir, f), src, 'utf8')
    }

    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)

    for (const f of listFiles(expected)) {
      const got = readFileSync(join(dir, f), 'utf8').replace(/\r\n/g, '\n').replace(/\n+$/g, '\n')
      const want = readFileSync(join(expected, f), 'utf8').replace(/\r\n/g, '\n').replace(/\n+$/g, '\n')
      expect({ file: f, content: got }).toEqual({ file: f, content: want })
    }
  })
})
