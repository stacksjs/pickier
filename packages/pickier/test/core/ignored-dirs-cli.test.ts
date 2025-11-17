import { describe, expect, it } from 'bun:test'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runLint } from '../../src/linter'

function tmpdirPickier(): string {
  return mkdtempSync(join(tmpdir(), 'pickier-ignore-cli-'))
}

describe('ignored directories are not scanned (CLI path runLint)', () => {
  it('does not scan node_modules', async () => {
    const dir = tmpdirPickier()
    try {
      const nmFile = join(dir, 'node_modules', 'pako', 'index.ts')
      mkdirSync(join(dir, 'node_modules', 'pako'), { recursive: true })
      writeFileSync(nmFile, 'console.log(1)\ndebugger\n', 'utf8')

      // nothing else; if node_modules were scanned, code would be 1 due to debugger
      const code = await runLint([dir], { reporter: 'json', maxWarnings: -1 })
      expect(code).toBe(0)
    }
    finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('does not scan dist', async () => {
    const dir = tmpdirPickier()
    try {
      const distFile = join(dir, 'dist', 'x.ts')
      mkdirSync(join(dir, 'dist'), { recursive: true })
      writeFileSync(distFile, 'console.log(1)\ndebugger\n', 'utf8')

      const code = await runLint([dir], { reporter: 'json', maxWarnings: -1 })
      expect(code).toBe(0)
    }
    finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
