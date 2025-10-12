import { describe, expect, it } from 'bun:test'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runLint } from '../../src/linter'

function tmp(): string {
  return mkdtempSync(join(tmpdir(), 'pickier-lint-'))
}

describe('triple-slash directives', () => {
  it('does not flag TypeScript reference directives for quote style', async () => {
    const dir = tmp()
    const file = join(dir, 'types.ts')
    // TypeScript triple-slash directives MUST use double quotes per spec
    // Even when project config prefers single quotes
    const src = `/// <reference types="vite/client" />
/// <reference path="../types/global.d.ts" />
/// <reference lib="es2015" />

const _x = 'hello'
`
    writeFileSync(file, src, 'utf8')
    const code = await runLint([dir], { reporter: 'json' })
    // Should pass with no quote-style warnings for directives
    expect(code).toBe(0)
  })

  it('still flags regular double quotes when single quotes preferred', async () => {
    const dir = tmp()
    const file = join(dir, 'quotes.ts')
    const src = `/// <reference types="vite/client" />

const _msg = "hello world"
`
    writeFileSync(file, src, 'utf8')
    const code = await runLint([dir], { reporter: 'json', maxWarnings: 0 })
    // Should fail because of the regular double-quoted string
    expect(code).toBe(1)
  })

  it('handles multiple triple-slash directives correctly', async () => {
    const dir = tmp()
    const file = join(dir, 'multi.ts')
    const src = `/// <reference types="node" />
/// <reference types="bun-types" />
/// <reference lib="webworker" />

export const config = { name: 'test' }
`
    writeFileSync(file, src, 'utf8')
    const code = await runLint([dir], { reporter: 'json' })
    // Should pass - all triple-slash directives should be ignored
    expect(code).toBe(0)
  })

  it('handles triple-slash directives with whitespace variations', async () => {
    const dir = tmp()
    const file = join(dir, 'spaces.ts')
    const src = `  /// <reference types="vite/client" />
    /// <reference path="../types.d.ts" />
///   <reference lib="dom" />

const _value = 'test'
`
    writeFileSync(file, src, 'utf8')
    const code = await runLint([dir], { reporter: 'json' })
    // Should pass - directives with leading/trailing spaces should be ignored
    expect(code).toBe(0)
  })
})
