import { describe, expect, it } from 'bun:test'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runLint } from '../../src/linter'
import { runFormat } from '../../src/formatter'

function tmp(): string {
  return mkdtempSync(join(tmpdir(), 'pickier-ast-edge-'))
}

describe('AST and parsing edge cases', () => {
  it('handles template literals correctly', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'const x = `hello ${name}`\n', 'utf8')

    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
  })

  it('handles tagged template literals', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'const x = html`<div>${content}</div>`\n', 'utf8')

    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
  })

  it('handles nested object destructuring', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'const { a: { b: { c } } } = obj\n', 'utf8')

    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
  })

  it('handles array destructuring with rest', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'const [first, ...rest] = arr\n', 'utf8')

    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
  })

  it('handles async/await correctly', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'async function test() {\n  await fetch(url)\n}\n', 'utf8')

    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
  })

  it('handles generator functions', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'function* gen() {\n  yield 1\n  yield 2\n}\n', 'utf8')

    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
  })

  it('handles arrow functions with single parameter', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'const fn = x => x * 2\n', 'utf8')

    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
  })

  it('handles arrow functions with object return', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'const fn = () => ({ a: 1 })\n', 'utf8')

    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
  })

  it('handles optional chaining', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'const x = obj?.prop?.nested\n', 'utf8')

    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
  })

  it('handles nullish coalescing', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'const x = value ?? defaultValue\n', 'utf8')

    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
  })

  it('handles spread operators in arrays', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'const arr = [...arr1, ...arr2]\n', 'utf8')

    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
  })

  it('handles spread operators in objects', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'const obj = { ...obj1, ...obj2 }\n', 'utf8')

    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
  })

  it('handles class properties', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'class Test {\n  prop = 1\n  method() {}\n}\n', 'utf8')

    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
  })

  it('handles static class members', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'class Test {\n  static prop = 1\n  static method() {}\n}\n', 'utf8')

    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
  })

  it('handles private class members', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'class Test {\n  #private = 1\n}\n', 'utf8')

    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
  })

  it('handles decorators', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, '@decorator\nclass Test {}\n', 'utf8')

    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
  })

  it('handles type annotations', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'const x: number = 1\n', 'utf8')

    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
  })

  it('handles interface declarations', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'interface Test {\n  prop: string\n}\n', 'utf8')

    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
  })

  it('handles type aliases', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'type Test = string | number\n', 'utf8')

    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
  })

  it('handles enum declarations', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'enum Color {\n  Red,\n  Green,\n  Blue\n}\n', 'utf8')

    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
  })

  it('handles namespace declarations', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'namespace Utils {\n  export function test() {}\n}\n', 'utf8')

    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
  })

  it('handles regex literals', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'const re = /test\\d+/gi\n', 'utf8')

    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
  })

  it('handles JSX syntax', async () => {
    const dir = tmp()
    const file = join(dir, 'test.tsx')
    writeFileSync(file, 'const elem = <div className="test">Hello</div>\n', 'utf8')

    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
  })

  it('handles import assertions', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'import data from "./data.json" assert { type: "json" }\n', 'utf8')

    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
  })

  it('handles dynamic imports', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'const module = await import("./module.js")\n', 'utf8')

    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
  })

  it('handles try-catch-finally', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'try {\n  test()\n}\ncatch (e) {\n  handle(e)\n}\nfinally {\n  cleanup()\n}\n', 'utf8')

    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
  })

  it('handles switch statements with multiple cases', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'switch (x) {\n  case 1:\n    break\n  case 2:\n    break\n  default:\n    break\n}\n', 'utf8')

    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
  })

  it('handles for-of loops', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'for (const item of items) {\n  process(item)\n}\n', 'utf8')

    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
  })

  it('handles for-in loops', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'for (const key in obj) {\n  process(key)\n}\n', 'utf8')

    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
  })

  it('handles while loops', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'while (condition) {\n  doSomething()\n}\n', 'utf8')

    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
  })

  it('handles do-while loops', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'do {\n  doSomething()\n}\nwhile (condition)\n', 'utf8')

    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
  })

  it('handles labeled statements', async () => {
    const dir = tmp()
    const file = join(dir, 'test.ts')
    writeFileSync(file, 'outer: for (let i = 0; i < 10; i++) {\n  if (i === 5)\n    break outer\n}\n', 'utf8')

    const code = await runFormat([dir], { write: true })
    expect(code).toBe(0)
  })
})
