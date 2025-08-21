import { describe, expect, it } from 'bun:test'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runFormat } from '../src/cli/run-format'

function tmp(): string {
  return mkdtempSync(join(tmpdir(), 'pickier-format-edge-'))
}

describe('format edge cases and uncovered paths', () => {
  it('should handle double quote conversion to single quotes', async () => {
    const dir = tmp()
    const file = 'quotes.ts'
    const src = [
      'const str = "hello world"',
      'const escaped = "with \\"nested\\" quotes"',
      'const single = \'already single\'',
      '',
    ].join('\n')
    const expected = [
      'const str = \'hello world\'',
      'const escaped = \'with "nested" quotes\'',
      'const single = \'already single\'',
      '',
    ].join('\n')
    
    writeFileSync(join(dir, file), src, 'utf8')
    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
    const result = readFileSync(join(dir, file), 'utf8')
    expect(result).toBe(expected)
  })

  it('should handle single quote conversion to double quotes', async () => {
    const dir = tmp()
    const file = 'double-quotes.ts'
    const src = [
      'const str = \'hello world\'',
      'const escaped = \'with \\\'nested\\\' quotes\'',
      'const double = "already double"',
      '',
    ].join('\n')
    
    writeFileSync(join(dir, file), src, 'utf8')
    
    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'stylish', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'double', semi: false },
      rules: { noDebugger: 'error', noConsole: 'warn' },
    }, null, 2), 'utf8')

    const code = await runFormat([dir], { write: true, config: cfgPath })
    expect(code).toBe(0)
    const result = readFileSync(join(dir, file), 'utf8')
    expect(result).toContain('"hello world"')
    expect(result).toContain('"with \'nested\' quotes"')
  })

  it('should not modify quotes in non-code files', async () => {
    const dir = tmp()
    const file = 'data.json'
    const src = '{"name": "value", \'invalid\': true}'
    
    writeFileSync(join(dir, file), src, 'utf8')
    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
    const result = readFileSync(join(dir, file), 'utf8')
    // JSON files get final newline added
    expect(result).toBe(src + '\n')
  })

  it('should handle mixed indentation with tabs and spaces', async () => {
    const dir = tmp()
    const file = 'mixed-indent.ts'
    const src = [
      'function test() {',
      '\tif (true) {',
      '    \tconsole.log("mixed")',
      '\t}',
      '}',
      '',
    ].join('\n')
    
    writeFileSync(join(dir, file), src, 'utf8')
    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
    const result = readFileSync(join(dir, file), 'utf8')
    // Should normalize to consistent spacing
    expect(result).not.toContain('\t')
  })

  it('should handle files with no extension', async () => {
    const dir = tmp()
    const file = 'no-extension'
    const src = 'console.log("test");\n'
    
    writeFileSync(join(dir, file), src, 'utf8')
    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
    const result = readFileSync(join(dir, file), 'utf8')
    // Files without extension get formatted but quotes may not change for non-code files
    expect(result).toContain('console.log')
    expect(result).toContain('test')
  })

  it('should handle empty files', async () => {
    const dir = tmp()
    const file = 'empty.ts'
    const src = ''
    
    writeFileSync(join(dir, file), src, 'utf8')
    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
    const result = readFileSync(join(dir, file), 'utf8')
    expect(result).toBe('')
  })

  it('should handle files with only whitespace', async () => {
    const dir = tmp()
    const file = 'whitespace.ts'
    const src = '   \n\t\n   \n'
    
    writeFileSync(join(dir, file), src, 'utf8')
    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
    const result = readFileSync(join(dir, file), 'utf8')
    expect(result).toBe('\n') // Should be cleaned up with final newline
  })

  it('should handle very long lines', async () => {
    const dir = tmp()
    const file = 'long-line.ts'
    const longString = 'a'.repeat(200)
    const src = `const veryLongString = "${longString}"\n`
    
    writeFileSync(join(dir, file), src, 'utf8')
    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
    const result = readFileSync(join(dir, file), 'utf8')
    expect(result).toContain('\'') // Should convert to single quotes
    expect(result).toContain(longString)
  })

  it('should handle complex nested structures', async () => {
    const dir = tmp()
    const file = 'complex.ts'
    const src = [
      'const complexObject = {',
      '  nested: {',
      '    array: [1,2,3],',
      '    func: function() {',
      '      return "value"',
      '    }',
      '  }',
      '}',
      '',
    ].join('\n')
    
    writeFileSync(join(dir, file), src, 'utf8')
    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
    const result = readFileSync(join(dir, file), 'utf8')
    expect(result).toContain('\'value\'') // Should convert quotes
    expect(result).toContain('[1, 2, 3]') // Should format spacing
  })

  it('should handle imports with complex destructuring', async () => {
    const dir = tmp()
    const file = 'imports.ts'
    const src = [
      'import { a,b,c,type D,type E as F } from "module"',
      'import * as Utils from "utils"',
      'import Default, { named } from "other"',
      '',
      'console.log(a, b, c, Utils, Default, named)',
      '',
    ].join('\n')
    
    writeFileSync(join(dir, file), src, 'utf8')
    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
    const result = readFileSync(join(dir, file), 'utf8')
    // Should format and organize imports
    expect(result).toContain('import')
    expect(result).toContain('console.log')
    expect(result).toContain('\'module\'') // Convert to single quotes
  })
})
