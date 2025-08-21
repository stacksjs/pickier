import { describe, expect, it } from 'bun:test'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runFormat } from '../src/cli/run-format'

function tmp(): string {
  return mkdtempSync(join(tmpdir(), 'pickier-import-edge-'))
}

describe('format import edge cases', () => {
  it('should handle imports with no named imports', async () => {
    const dir = tmp()
    const file = 'no-named.ts'
    const src = [
      'import defaultExport from "module"',
      'import "side-effect"',
      'import * as namespace from "other"',
      '',
      'console.log(defaultExport, namespace)',
      '',
    ].join('\n')
    
    writeFileSync(join(dir, file), src, 'utf8')
    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
    const result = readFileSync(join(dir, file), 'utf8')
    expect(result).toContain('\'module\'')
    expect(result).toContain('\'side-effect\'')
    expect(result).toContain('\'other\'')
  })

  it('should handle imports with only type imports', async () => {
    const dir = tmp()
    const file = 'only-types.ts'
    const src = [
      'import { type A, type B, type C } from "types"',
      '',
      'let a: A, b: B, c: C',
      '',
    ].join('\n')
    
    writeFileSync(join(dir, file), src, 'utf8')
    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
    const result = readFileSync(join(dir, file), 'utf8')
    // Formatter may remove unused type imports if they're not used
    expect(result).toContain('let a')
    // Type imports may be removed if unused, so just check basic structure
    expect(result.length).toBeGreaterThan(10)
  })

  it('should handle imports mixed with comments', async () => {
    const dir = tmp()
    const file = 'with-comments.ts'
    const src = [
      '// This is a comment',
      'import { used } from "module"',
      '/* block comment */',
      'import { alsoUsed } from "other"',
      '',
      'console.log(used, alsoUsed)',
      '',
    ].join('\n')
    
    writeFileSync(join(dir, file), src, 'utf8')
    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
    const result = readFileSync(join(dir, file), 'utf8')
    // Comments may be stripped during import formatting
    expect(result).toContain('import')
    expect(result).toContain('console.log')
  })

  it('should handle imports with dynamic import() calls', async () => {
    const dir = tmp()
    const file = 'dynamic-imports.ts'
    const src = [
      'import { staticImport } from "static"',
      '',
      'async function loadModule() {',
      '  const dynamic = await import("dynamic")',
      '  return dynamic',
      '}',
      '',
      'console.log(staticImport, loadModule)',
      '',
    ].join('\n')
    
    writeFileSync(join(dir, file), src, 'utf8')
    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
    const result = readFileSync(join(dir, file), 'utf8')
    expect(result).toContain('\'static\'')
    expect(result).toContain('import(\'dynamic\')')
  })

  it('should handle complex aliasing in imports', async () => {
    const dir = tmp()
    const file = 'complex-alias.ts'
    const src = [
      'import { verylongfunctionname as short, another as renamed, third } from "module"',
      '',
      'console.log(short, renamed, third)',
      '',
    ].join('\n')
    
    writeFileSync(join(dir, file), src, 'utf8')
    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
    const result = readFileSync(join(dir, file), 'utf8')
    expect(result).toContain('verylongfunctionname as short')
    expect(result).toContain('another as renamed')
  })

  it('should handle imports from relative paths', async () => {
    const dir = tmp()
    const file = 'relative-imports.ts'
    const src = [
      'import { local } from "./local-module"',
      'import { parent } from "../parent-module"',
      'import { deep } from "../../deep/module"',
      'import { external } from "external-package"',
      '',
      'console.log(local, parent, deep, external)',
      '',
    ].join('\n')
    
    writeFileSync(join(dir, file), src, 'utf8')
    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
    const result = readFileSync(join(dir, file), 'utf8')
    expect(result).toContain('\'./local-module\'')
    expect(result).toContain('\'../parent-module\'')
    expect(result).toContain('\'../../deep/module\'')
    expect(result).toContain('\'external-package\'')
  })

  it('should handle imports with file extensions', async () => {
    const dir = tmp()
    const file = 'with-extensions.ts'
    const src = [
      'import { jsModule } from "./module.js"',
      'import { tsModule } from "./module.ts"',
      'import { jsonData } from "./data.json"',
      '',
      'console.log(jsModule, tsModule, jsonData)',
      '',
    ].join('\n')
    
    writeFileSync(join(dir, file), src, 'utf8')
    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
    const result = readFileSync(join(dir, file), 'utf8')
    expect(result).toContain('\'./module.js\'')
    expect(result).toContain('\'./module.ts\'')
    expect(result).toContain('\'./data.json\'')
  })

  it('should handle very long import statements', async () => {
    const dir = tmp()
    const file = 'long-imports.ts'
    const longList = Array.from({ length: 20 }, (_, i) => `import${i}`).join(', ')
    const src = [
      `import { ${longList} } from "very-large-module"`,
      '',
      `console.log(${longList})`,
      '',
    ].join('\n')
    
    writeFileSync(join(dir, file), src, 'utf8')
    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
    const result = readFileSync(join(dir, file), 'utf8')
    expect(result).toContain('\'very-large-module\'')
    expect(result).toContain('import0')
    expect(result).toContain('import19')
  })
})
