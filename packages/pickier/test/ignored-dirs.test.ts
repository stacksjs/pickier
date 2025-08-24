import { describe, expect, it } from 'bun:test'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runLintProgrammatic } from '../src/index'

function tmpdirPickier(): string {
  return mkdtempSync(join(tmpdir(), 'pickier-ignore-'))
}

describe('ignored directories are not scanned', () => {
  it('excludes node_modules in runLintProgrammatic', async () => {
    const dir = tmpdirPickier()
    try {
      // create a normal source file
      const srcFile = join(dir, 'src', 'a.ts')
      mkdirSync(join(dir, 'src'), { recursive: true })
      writeFileSync(srcFile, 'console.log(1)\n', 'utf8')

      // create an ignored file inside node_modules
      const nmFile = join(dir, 'node_modules', 'pako', 'index.ts')
      mkdirSync(join(dir, 'node_modules', 'pako'), { recursive: true })
      writeFileSync(nmFile, 'console.log("ignored")\n', 'utf8')

      const res = await runLintProgrammatic([dir], { reporter: 'json', maxWarnings: -1 })

      // ensure no issue references node_modules
      expect(res.issues.some(i => i.filePath.includes('/node_modules/'))).toBe(false)

      // ensure the src file is actually linted (sanity check)
      expect(res.issues.some(i => i.filePath === srcFile)).toBe(true)
    }
    finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('excludes other default ignored directories like dist', async () => {
    const dir = tmpdirPickier()
    try {
      const srcFile = join(dir, 'src', 'b.ts')
      mkdirSync(join(dir, 'src'), { recursive: true })
      writeFileSync(srcFile, 'console.log(2)\n', 'utf8')

      const distFile = join(dir, 'dist', 'c.ts')
      mkdirSync(join(dir, 'dist'), { recursive: true })
      writeFileSync(distFile, 'console.log("dist")\n', 'utf8')

      const res = await runLintProgrammatic([dir], { reporter: 'json', maxWarnings: -1 })

      expect(res.issues.some(i => i.filePath.includes('/dist/'))).toBe(false)
      expect(res.issues.some(i => i.filePath === srcFile)).toBe(true)
    }
    finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
