import { describe, expect, it } from 'bun:test'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runFormat } from '../../src/formatter'
import { runLint } from '../../src/linter'

function tmp(): string {
  return mkdtempSync(join(tmpdir(), 'pickier-config-'))
}

describe('configuration handling', () => {
  it('loads custom config file path', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    const configFile = join(dir, 'custom.config.json')

    writeFileSync(file, 'const x = 1', 'utf8')
    writeFileSync(configFile, JSON.stringify({
      format: {
        extensions: ['ts'],
        indent: 4, // Custom indent
        quotes: 'single',
        semi: false,
        trimTrailingWhitespace: true,
        maxConsecutiveBlankLines: 1,
        finalNewline: 'one',
      },
    }, null, 2), 'utf8')

    const code = await runFormat([dir], { config: configFile, write: true })
    expect(code).toBe(0)
  })

  it('handles config with custom ignore patterns', async () => {
    const dir = tmp()
    const file1 = join(dir, 'src.ts')
    const file2 = join(dir, 'test.spec.ts')
    const configFile = join(dir, 'pickier.config.json')

    writeFileSync(file1, 'const x=1', 'utf8')
    writeFileSync(file2, 'const y=2', 'utf8')
    writeFileSync(configFile, JSON.stringify({
      ignores: ['*.spec.ts'],
      format: {
        extensions: ['ts'],
        indent: 2,
        quotes: 'single',
        semi: false,
        trimTrailingWhitespace: true,
        maxConsecutiveBlankLines: 1,
        finalNewline: 'one',
      },
    }, null, 2), 'utf8')

    const code = await runFormat([dir], { config: configFile, write: true })
    expect(code).toBe(0)
  })

  it('handles different indent styles (tabs vs spaces)', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    const configFile = join(dir, 'pickier.config.json')

    writeFileSync(file, 'function test() {\n  return 1\n}\n', 'utf8')
    writeFileSync(configFile, JSON.stringify({
      format: {
        extensions: ['ts'],
        indent: 2,
        indentStyle: 'tabs',
        quotes: 'single',
        semi: false,
        trimTrailingWhitespace: true,
        maxConsecutiveBlankLines: 1,
        finalNewline: 'one',
      },
    }, null, 2), 'utf8')

    const code = await runFormat([dir], { config: configFile, write: true })
    expect(code).toBe(0)
  })

  it('handles config with different finalNewline options', async () => {
    const dir = tmp()

    // Test 'none'
    const file1 = join(dir, 'test1.ts')
    const config1 = join(dir, 'config1.json')
    writeFileSync(file1, 'const x = 1\n', 'utf8')
    writeFileSync(config1, JSON.stringify({
      format: {
        extensions: ['ts'],
        indent: 2,
        quotes: 'single',
        semi: false,
        trimTrailingWhitespace: true,
        maxConsecutiveBlankLines: 1,
        finalNewline: 'none',
      },
    }), 'utf8')

    await runFormat([file1], { config: config1, write: true })

    // Test 'two'
    const file2 = join(dir, 'test2.ts')
    const config2 = join(dir, 'config2.json')
    writeFileSync(file2, 'const x = 1', 'utf8')
    writeFileSync(config2, JSON.stringify({
      format: {
        extensions: ['ts'],
        indent: 2,
        quotes: 'single',
        semi: false,
        trimTrailingWhitespace: true,
        maxConsecutiveBlankLines: 1,
        finalNewline: 'two',
      },
    }), 'utf8')

    await runFormat([file2], { config: config2, write: true })

    expect(true).toBe(true) // Should not crash
  })

  it('handles config with plugin rules enabled/disabled', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    const configFile = join(dir, 'pickier.config.json')

    writeFileSync(file, 'const obj = {c: 3, b: 2, a: 1}\n', 'utf8')
    writeFileSync(configFile, JSON.stringify({
      lint: {
        extensions: ['ts'],
        reporter: 'json',
        cache: false,
        maxWarnings: -1,
      },
      format: {
        extensions: ['ts'],
        indent: 2,
        quotes: 'single',
        semi: false,
        trimTrailingWhitespace: true,
        maxConsecutiveBlankLines: 1,
        finalNewline: 'one',
      },
      rules: { noDebugger: 'off', noConsole: 'off' },
      pluginRules: {
        'pickier/sort-objects': 'off', // Disabled
      },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: configFile, reporter: 'json' })
    expect(code).toBe(0)
  })

  it('handles different quote preferences', async () => {
    const dir = tmp()

    // Test double quotes
    const file1 = join(dir, 'double.ts')
    const config1 = join(dir, 'config-double.json')
    writeFileSync(file1, "const x = 'test'\n", 'utf8')
    writeFileSync(config1, JSON.stringify({
      format: {
        extensions: ['ts'],
        indent: 2,
        quotes: 'double',
        semi: false,
        trimTrailingWhitespace: true,
        maxConsecutiveBlankLines: 1,
        finalNewline: 'one',
      },
    }), 'utf8')

    await runFormat([file1], { config: config1, write: true })

    // Test single quotes
    const file2 = join(dir, 'single.ts')
    const config2 = join(dir, 'config-single.json')
    writeFileSync(file2, 'const x = "test"\n', 'utf8')
    writeFileSync(config2, JSON.stringify({
      format: {
        extensions: ['ts'],
        indent: 2,
        quotes: 'single',
        semi: false,
        trimTrailingWhitespace: true,
        maxConsecutiveBlankLines: 1,
        finalNewline: 'one',
      },
    }), 'utf8')

    await runFormat([file2], { config: config2, write: true })

    expect(true).toBe(true) // Should not crash
  })

  it('handles config with custom extensions', async () => {
    const dir = tmp()
    const file = join(dir, 'test.jsx')
    const configFile = join(dir, 'pickier.config.json')

    writeFileSync(file, 'const x=1', 'utf8')
    writeFileSync(configFile, JSON.stringify({
      format: {
        extensions: ['jsx', 'tsx'],
        indent: 2,
        quotes: 'single',
        semi: false,
        trimTrailingWhitespace: true,
        maxConsecutiveBlankLines: 1,
        finalNewline: 'one',
      },
    }, null, 2), 'utf8')

    const code = await runFormat([dir], { config: configFile, write: true })
    expect(code).toBe(0)
  })

  it('handles config with verbose option', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'const x = 1\n', 'utf8')

    const code = await runFormat([dir], { verbose: true, write: true })
    expect(code).toBe(0)
  })

  it('handles config with cache disabled', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    const configFile = join(dir, 'pickier.config.json')

    writeFileSync(file, 'const x = 1\n', 'utf8')
    writeFileSync(configFile, JSON.stringify({
      lint: {
        extensions: ['ts'],
        reporter: 'json',
        cache: false,
        maxWarnings: -1,
      },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: configFile, reporter: 'json' })
    expect(code).toBe(0)
  })
})
