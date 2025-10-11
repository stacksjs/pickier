import { describe, expect, it } from 'bun:test'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runFormat } from '../src/formatter'

function tmp(): string {
  return mkdtempSync(join(tmpdir(), 'pickier-imports-edge-'))
}

describe('format imports (edge cases)', () => {
  it('splits type specifiers and keeps defaults/namespaces', async () => {
    const dir = tmp()
    const file = 'a.ts'
    const src = [
      'import def, { type T, A, type U as UU } from \'lib\'',
      'import * as NS from \'lib\'',
      'import { type X, Y } from \'./local\'',
      '',
      'const n = NS && Y',
      'export { n }',
      '',
    ].join('\n')
    const want = [
      'import type { T, U as UU } from \'lib\'',
      'import type { X } from \'./local\'',
      'import def, * as NS from \'lib\'',
      'import { Y } from \'./local\'',
      '',
      'const n = NS && Y',
      'export { n }',
      '',
    ].join('\n')
    writeFileSync(join(dir, file), src, 'utf8')
    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
    const got = readFileSync(join(dir, file), 'utf8')
    expect(got).toBe(want)
  })

  it('removes unused named without alias but keeps aliased', async () => {
    const dir = tmp()
    const file = 'b.ts'
    const src = [
      'import { Used, Unused, A as AA } from \'pkg\'',
      '',
      'console.log(Used)',
      '',
    ].join('\n')
    const want = [
      'import { A as AA, Used } from \'pkg\'',
      '',
      'console.log(Used)',
      '',
    ].join('\n')
    writeFileSync(join(dir, file), src, 'utf8')
    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
    const got = readFileSync(join(dir, file), 'utf8')
    expect(got).toBe(want)
  })

  it('keeps side-effect imports and preserves a blank line after imports', async () => {
    const dir = tmp()
    const file = 'c.ts'
    const src = [
      'import \'polyfill\'',
      'import { B } from \'lib\'',
      '',
      'export const x = B',
      '',
    ].join('\n')
    const want = [
      'import \'polyfill\'',
      'import { B } from \'lib\'',
      '',
      'export const x = B',
      '',
    ].join('\n')
    writeFileSync(join(dir, file), src, 'utf8')
    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
    const got = readFileSync(join(dir, file), 'utf8')
    expect(got).toBe(want)
  })
})
