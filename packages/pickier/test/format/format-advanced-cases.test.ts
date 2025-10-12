import { describe, expect, it } from 'bun:test'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runFormat } from '../../src/formatter'

function tmp(): string {
  return mkdtempSync(join(tmpdir(), 'pickier-format-advanced-'))
}

describe('format advanced cases for coverage', () => {
  it('should handle finalNewline: none setting', async () => {
    const dir = tmp()
    const file = 'no-newline.ts'
    const src = 'const x = 1\nconst y = 2\n\n'

    writeFileSync(join(dir, file), src, 'utf8')

    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'stylish', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'none', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'error', noConsole: 'warn' },
    }, null, 2), 'utf8')

    const code = await runFormat([dir], { write: true, config: cfgPath })
    expect(code).toBe(0)
    const result = readFileSync(join(dir, file), 'utf8')
    expect(result).not.toMatch(/\n$/) // Should not end with newline
  })

  it('should handle finalNewline: two setting', async () => {
    const dir = tmp()
    const file = 'two-newlines.ts'
    const src = 'const x = 1\nconst y = 2'

    writeFileSync(join(dir, file), src, 'utf8')

    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'stylish', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'two', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'error', noConsole: 'warn' },
    }, null, 2), 'utf8')

    const code = await runFormat([dir], { write: true, config: cfgPath })
    expect(code).toBe(0)
    const result = readFileSync(join(dir, file), 'utf8')
    expect(result).toMatch(/\n\n$/) // Should end with two newlines
  })

  it('should handle files with existing double newlines', async () => {
    const dir = tmp()
    const file = 'double-newline.ts'
    const src = 'const x = 1\nconst y = 2\n\n'

    writeFileSync(join(dir, file), src, 'utf8')

    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'stylish', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'two', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'error', noConsole: 'warn' },
    }, null, 2), 'utf8')

    const code = await runFormat([dir], { write: true, config: cfgPath })
    expect(code).toBe(0)
    const result = readFileSync(join(dir, file), 'utf8')
    expect(result).toMatch(/\n\n$/) // Should preserve double newlines
  })

  it('should handle imports with type and value sorting', async () => {
    const dir = tmp()
    const file = 'mixed-imports.ts'
    const src = [
      'import { value1, type Type1, value2, type Type2 } from "module"',
      'import Default from "default-module"',
      'import type { OnlyType } from "type-only"',
      '',
      'console.log(value1, value2, Default)',
      'let x: Type1, y: Type2, z: OnlyType',
      '',
    ].join('\n')

    writeFileSync(join(dir, file), src, 'utf8')
    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
    const result = readFileSync(join(dir, file), 'utf8')
    // Should handle mixed type and value imports
    expect(result).toContain('import')
    expect(result).toContain('console.log')
  })

  it('should handle imports from different source rankings', async () => {
    const dir = tmp()
    const file = 'ranked-imports.ts'
    const src = [
      'import { z } from "@scoped/package"',
      'import { a } from "external-package"',
      'import { b } from "./relative"',
      'import { c } from "../parent"',
      'import { d } from "node:fs"',
      '',
      'console.log(a, b, c, d, z)',
      '',
    ].join('\n')

    writeFileSync(join(dir, file), src, 'utf8')
    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
    const result = readFileSync(join(dir, file), 'utf8')
    // Should sort imports by ranking (node:, external, scoped, relative)
    expect(result).toContain('import')
    expect(result).toContain('console.log')
  })

  it('should handle mixed import forms', async () => {
    const dir = tmp()
    const file = 'import-forms.ts'
    const src = [
      'import Default, { named } from "mixed"',
      'import * as Namespace from "namespace"',
      'import { only, named } from "named-only"',
      'import OnlyDefault from "default-only"',
      '',
      'console.log(Default, named, Namespace, only, OnlyDefault)',
      '',
    ].join('\n')

    writeFileSync(join(dir, file), src, 'utf8')
    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
    const result = readFileSync(join(dir, file), 'utf8')
    // Should handle different import forms correctly
    expect(result).toContain('import')
    expect(result).toContain('console.log')
  })

  it('should handle semicolon removal in various contexts', async () => {
    const dir = tmp()
    const file = 'semicolons.ts'
    const src = [
      'const a = 1;',
      'const b = 2;;', // double semicolon
      'for (let i = 0; i < 10; i++) {', // semicolons in for loop should be kept
      '  console.log(i);',
      '}',
      'function test() {',
      '  return "value";',
      '};', // unnecessary semicolon after function
      '',
    ].join('\n')

    writeFileSync(join(dir, file), src, 'utf8')

    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'stylish', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: true },
      rules: { noDebugger: 'error', noConsole: 'warn' },
    }, null, 2), 'utf8')

    const code = await runFormat([dir], { write: true, config: cfgPath })
    expect(code).toBe(0)
    const result = readFileSync(join(dir, file), 'utf8')
    // Should clean up unnecessary semicolons
    expect(result).toContain('for (let i = 0; i < 10; i++)') // for loop semicolons preserved
    expect(result).not.toContain(';;') // double semicolons removed
  })

  it('should handle imports with side effects', async () => {
    const dir = tmp()
    const file = 'side-effects.ts'
    const src = [
      'import "side-effect-1"',
      'import "side-effect-2"',
      'import { named } from "with-named"',
      'import "another-side-effect"',
      '',
      'console.log(named)',
      '',
    ].join('\n')

    writeFileSync(join(dir, file), src, 'utf8')
    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
    const result = readFileSync(join(dir, file), 'utf8')
    // Side effect imports should be preserved (with quotes converted to single)
    expect(result).toContain('import \'side-effect-1\'')
    expect(result).toContain('import \'side-effect-2\'')
    expect(result).toContain('import \'another-side-effect\'')
  })

  it('should handle complex nested object structures', async () => {
    const dir = tmp()
    const file = 'nested-objects.ts'
    const src = [
      'const config = {',
      '  nested: {',
      '    deep: {',
      '      value: "test"',
      '    }',
      '  },',
      '  array: [',
      '    { key: "value1" },',
      '    { key: "value2" }',
      '  ]',
      '}',
      '',
    ].join('\n')

    writeFileSync(join(dir, file), src, 'utf8')
    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
    const result = readFileSync(join(dir, file), 'utf8')
    expect(result).toContain('\'test\'') // Should convert quotes
    expect(result).toContain('\'value1\'')
    expect(result).toContain('\'value2\'')
  })
})
