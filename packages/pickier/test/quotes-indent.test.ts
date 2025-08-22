import { describe, expect, it } from 'bun:test'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runFormat } from '../src/formatter'
import { runLint } from '../src/linter'

function tmp(): string {
  return mkdtempSync(join(tmpdir(), 'pickier-quotes-indent-'))
}

const badCode = `const x = "hi"\n\n\tif (true) {\n   console.log("a")\n}\n`
const fixedCode = `const x = 'hi'\n\nif (true) {\n  console.log('a')\n}\n`

describe('quotes and indent rules', () => {
  it('lint flags incorrect quotes/indent (as warnings) and formatter fixes them', async () => {
    const dir = tmp()
    const file = join(dir, 'a.ts')
    writeFileSync(file, badCode, 'utf8')

    const lintExit = await runLint([dir], { reporter: 'json' })
    // quote/indent are warnings, so exit code remains 0 unless maxWarnings breached
    expect(lintExit).toBe(0)

    // formatter fixes
    const fmtExit = await runFormat([dir], { write: true })
    expect(fmtExit).toBe(0)
    const out = readFileSync(file, 'utf8')
    expect(out).toBe(fixedCode)
  })

  it('formatter alone fixes quotes & indent to match config', async () => {
    const dir = tmp()
    const file = join(dir, 'b.ts')
    writeFileSync(file, badCode, 'utf8')
    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
    const out = readFileSync(file, 'utf8')
    expect(out).toBe(fixedCode)
  })
})
