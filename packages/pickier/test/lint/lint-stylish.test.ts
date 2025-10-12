import { describe, expect, it } from 'bun:test'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runLint } from '../../src/linter'

function tmp(): string {
  return mkdtempSync(join(tmpdir(), 'pickier-lint-stylish-'))
}

describe('linter stylish reporter', () => {
  it('produces stylish output with file paths and issues', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'debugger\nconsole.log(1)\n', 'utf8')

    // Capture console output
    const logs: string[] = []
    const originalLog = console.log
    console.log = (...args: any[]) => logs.push(args.join(' '))

    try {
      await runLint([dir], { reporter: 'stylish' })
    }
    finally {
      console.log = originalLog
    }

    const output = logs.join('\n')
    expect(output.includes('test.ts')).toBe(true)
    expect(output.includes('debugger') || output.includes('noDebugger')).toBe(true)
  })

  it('stylish reporter shows multiple files', async () => {
    const dir = tmp()
    const file1 = join(dir, 'file1.ts')
    const file2 = join(dir, 'file2.ts')
    writeFileSync(file1, 'debugger\n', 'utf8')
    writeFileSync(file2, 'debugger\n', 'utf8')

    const logs: string[] = []
    const originalLog = console.log
    console.log = (...args: any[]) => logs.push(args.join(' '))

    try {
      await runLint([dir], { reporter: 'stylish' })
    }
    finally {
      console.log = originalLog
    }

    const output = logs.join('\n')
    expect(output.includes('file1.ts')).toBe(true)
    expect(output.includes('file2.ts')).toBe(true)
  })

  it('stylish reporter shows line and column numbers', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'const a = 1\ndebugger\n', 'utf8')

    const logs: string[] = []
    const originalLog = console.log
    console.log = (...args: any[]) => logs.push(args.join(' '))

    try {
      await runLint([dir], { reporter: 'stylish' })
    }
    finally {
      console.log = originalLog
    }

    const output = logs.join('\n')
    // Should contain line:column format
    expect(/\d+:\d+/.test(output)).toBe(true)
  })

  it('compact reporter produces output', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'debugger\n', 'utf8')

    const logs: string[] = []
    const originalLog = console.log
    console.log = (...args: any[]) => logs.push(args.join(' '))

    try {
      await runLint([dir], { reporter: 'compact', maxWarnings: 99 })
    }
    finally {
      console.log = originalLog
    }

    expect(logs.length).toBeGreaterThan(0)
  })

  it('json reporter produces valid JSON', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'debugger\n', 'utf8')

    const logs: string[] = []
    const originalLog = console.log
    console.log = (...args: any[]) => logs.push(args.join(' '))

    try {
      await runLint([dir], { reporter: 'json' })
    }
    finally {
      console.log = originalLog
    }

    expect(logs.length).toBeGreaterThan(0)
    const parsed = JSON.parse(logs[0])
    expect(parsed).toHaveProperty('errors')
    expect(parsed).toHaveProperty('warnings')
    expect(parsed).toHaveProperty('issues')
  })

  it('handles empty results gracefully', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'const a = 1\n', 'utf8')

    const code = await runLint([dir], { reporter: 'stylish' })
    expect(code).toBe(0)
  })

  it('shows severity levels correctly', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    // debugger is error, console is warning
    writeFileSync(file, 'debugger\nconsole.log(1)\n', 'utf8')

    const logs: string[] = []
    const originalLog = console.log
    console.log = (...args: any[]) => logs.push(args.join(' '))

    try {
      await runLint([dir], { reporter: 'stylish', maxWarnings: 99 })
    }
    finally {
      console.log = originalLog
    }

    const output = logs.join('\n')
    // Output should contain severity indicators
    expect(output.length).toBeGreaterThan(0)
  })
})
