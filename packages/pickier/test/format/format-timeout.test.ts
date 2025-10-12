import { describe, expect, it } from 'bun:test'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runFormat } from '../../src/formatter'

function tmp(): string {
  return mkdtempSync(join(tmpdir(), 'pickier-format-timeout-'))
}

describe('formatter timeout and error handling', () => {
  it('handles format with PICKIER_TIMEOUT_MS environment variable', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'const x = 1', 'utf8')

    // Set a reasonable timeout
    process.env.PICKIER_TIMEOUT_MS = '5000'
    const code = await runFormat([dir], { write: true })
    delete process.env.PICKIER_TIMEOUT_MS

    expect(code).toBe(0)
  })

  it('handles deeply nested directory structures', async () => {
    const dir = tmp()
    let currentDir = dir
    // Create 10 levels of nested directories
    for (let i = 0; i < 10; i++) {
      currentDir = join(currentDir, `level${i}`)
      mkdirSync(currentDir, { recursive: true })
    }
    writeFileSync(join(currentDir, 'test.ts'), 'const x = 1\n', 'utf8')

    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
  })

  it('handles files without extensions', async () => {
    const dir = tmp()
    const file = join(dir, 'Makefile')
    writeFileSync(file, 'all:\n\techo test\n', 'utf8')

    // Should not crash on files without extensions
    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
  })

  it('handles empty directories', async () => {
    const dir = tmp()
    mkdirSync(join(dir, 'empty-dir'))

    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
  })

  it('handles verbose mode output', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'const x=1', 'utf8')

    const code = await runFormat([dir], { write: true, verbose: true })
    expect(code).toBe(0)
  })

  it('handles check mode correctly', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'const x=1\n', 'utf8')

    // First check should return 1 (needs formatting)
    const code1 = await runFormat([dir], { check: true })
    expect(code1).toBe(1)

    // Format the file
    await runFormat([dir], { write: true })

    // Second check should return 0 (properly formatted)
    const code2 = await runFormat([dir], { check: true })
    expect(code2).toBe(0)
  })

  it('handles default mode (no flags) as check mode', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'const x=1', 'utf8') // No newline, so formatting is needed

    // When neither check nor write is specified, it runs check logic but returns 0
    // (only explicit check: true returns 1 on changes)
    const code = await runFormat([dir], {})
    expect(code).toBe(0)
  })

  it('handles custom file extensions via ext option', async () => {
    const dir = tmp()
    const file1 = join(dir, 'test.tsx')
    const file2 = join(dir, 'test.vue')
    writeFileSync(file1, 'const x = 1\n', 'utf8')
    writeFileSync(file2, '<template>test</template>\n', 'utf8')

    const code = await runFormat([dir], { ext: 'tsx,vue', write: true })
    expect(code).toBe(0)
  })

  it('respects ignored paths from config', async () => {
    const dir = tmp()
    const normalFile = join(dir, 'src.ts')
    const ignoredFile = join(dir, 'node_modules', 'test.ts')

    mkdirSync(join(dir, 'node_modules'))
    writeFileSync(normalFile, 'const x=1', 'utf8')
    writeFileSync(ignoredFile, 'const y=2', 'utf8')

    // node_modules should be ignored by default
    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
  })

  it('handles multiple glob patterns', async () => {
    const dir = tmp()
    mkdirSync(join(dir, 'src'))
    mkdirSync(join(dir, 'test'))

    writeFileSync(join(dir, 'src', 'file1.ts'), 'const x=1\n', 'utf8')
    writeFileSync(join(dir, 'test', 'file2.ts'), 'const y=2\n', 'utf8')

    const code = await runFormat([join(dir, 'src'), join(dir, 'test')], { write: true })
    expect(code).toBe(0)
  })
})
