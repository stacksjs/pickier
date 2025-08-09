import { describe, expect, it } from 'bun:test'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runLint } from '../src/cli/run-lint'

function tmp(): string {
  return mkdtempSync(join(tmpdir(), 'pickier-lint-'))
}

describe('runLint', () => {
  it('returns 0 when no issues', async () => {
    const dir = tmp()
    writeFileSync(join(dir, 'a.ts'), 'const a = 1\n', 'utf8')
    const code = await runLint([dir], { reporter: 'json' })
    expect(code).toBe(0)
  })

  it('detects debugger as error and console as warning', async () => {
    const dir = tmp()
    writeFileSync(join(dir, 'a.ts'), 'console.log(1)\ndebugger\n', 'utf8')
    const code = await runLint([dir], { reporter: 'compact', maxWarnings: 99 })
    expect(code).toBe(1)
  })

  it('fix removes debugger when --fix', async () => {
    const dir = tmp()
    const file = join(dir, 'a.ts')
    writeFileSync(file, 'debugger\nlet x=1\n', 'utf8')
    const code = await runLint([dir], { fix: true })
    expect(code).toBe(0)
    const out = readFileSync(file, 'utf8')
    expect(out.includes('debugger')).toBe(false)
  })

  it('dry-run simulates fix without writing', async () => {
    const dir = tmp()
    const file = join(dir, 'a.ts')
    const src = 'debugger\nlet x=1\n'
    writeFileSync(file, src, 'utf8')
    const code = await runLint([dir], { fix: true, dryRun: true })
    expect(code).toBe(0)
    const out = readFileSync(file, 'utf8')
    expect(out).toBe(src)
  })

  it('does not remove "debugger" inside strings', async () => {
    const dir = tmp()
    const file = join(dir, 'a.ts')
    const src = 'const s = "debugger"\n'
    writeFileSync(file, src, 'utf8')
    const code = await runLint([dir], { fix: true })
    expect(code).toBe(0)
    const out = readFileSync(file, 'utf8')
    expect(out).toBe(src)
  })

  it('does not remove "debugger" in comments', async () => {
    const dir = tmp()
    const file = join(dir, 'a.ts')
    const src = '// debugger\n/* debugger */\nconst x = 1\n'
    writeFileSync(file, src, 'utf8')
    const code = await runLint([dir], { fix: true })
    expect(code).toBe(0)
    const out = readFileSync(file, 'utf8')
    expect(out).toBe(src)
  })

  it('fails when warnings exceed max-warnings', async () => {
    const dir = tmp()
    writeFileSync(join(dir, 'a.ts'), 'console.log(1)\n', 'utf8')
    const code = await runLint([dir], { reporter: 'json', maxWarnings: 0 })
    expect(code).toBe(1)
  })

  it('supports stylish reporter and verbose output', async () => {
    const dir = tmp()
    writeFileSync(join(dir, 'a.ts'), 'console.log(1)\n', 'utf8')
    const code = await runLint([dir], { reporter: 'stylish', verbose: true })
    expect(code).toBe(0)
  })
})
