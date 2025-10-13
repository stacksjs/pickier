import { describe, expect, it } from 'bun:test'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runLint } from '../../../src/linter'

function tmp(): string {
  return mkdtempSync(join(tmpdir(), 'pickier-rule-unused-vars-'))
}

describe('pickier/no-unused-vars', () => {
  it('flags unused variable with default pattern ^_', async () => {
    const dir = tmp()
    const file = 'a.ts'
    const src = 'const conds = 1; console.log(1)'
    writeFileSync(join(dir, file), src, 'utf8')

    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'json', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'off', noConsole: 'off' },
      plugins: [{ name: 'pickier', rules: {} }],
      pluginRules: { 'pickier/no-unused-vars': 'error' },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(1)
  })

  it('does not flag variables matching ignore pattern', async () => {
    const dir = tmp()
    const file = 'b.ts'
    const src = 'const _conds = 1;'
    writeFileSync(join(dir, file), src, 'utf8')

    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'json', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'off', noConsole: 'off' },
      plugins: [{ name: 'pickier', rules: {} }],
      pluginRules: { 'pickier/no-unused-vars': ['error', { varsIgnorePattern: '^_' }] },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(0)
  })

  it('flags unused function parameters unless ignored by pattern', async () => {
    const dir = tmp()
    const file = 'c.ts'
    const src = 'function f(conds, _ignored){ return 1 }\nconst g = (_a,b)=>{ return b }\nconst h=(x)=>x'
    writeFileSync(join(dir, file), src, 'utf8')

    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'json', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'off', noConsole: 'off' },
      plugins: [{ name: 'pickier', rules: {} }],
      pluginRules: { 'pickier/no-unused-vars': ['error', { argsIgnorePattern: '^_' }] },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(1)
  })

  it('does not flag single-parameter arrow function when parameter is used', async () => {
    const dir = tmp()
    const file = 'd.ts'
    const src = 'const f = x => x + 1\n;f(1)\n'
    writeFileSync(join(dir, file), src, 'utf8')

    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'json', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'off', noConsole: 'off' },
      plugins: [{ name: 'pickier', rules: {} }],
      pluginRules: { 'pickier/no-unused-vars': 'error' },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(0)
  })

  it('flags single-parameter arrow function when parameter is unused', async () => {
    const dir = tmp()
    const file = 'e.ts'
    const src = 'const f = x => 42\n;f(1)\n'
    writeFileSync(join(dir, file), src, 'utf8')

    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'json', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'off', noConsole: 'off' },
      plugins: [{ name: 'pickier', rules: {} }],
      pluginRules: { 'pickier/no-unused-vars': 'error' },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(1)
  })

  it('respects argsIgnorePattern for single-parameter arrow functions', async () => {
    const dir = tmp()
    const file = 'f.ts'
    const src = 'const f = _x => 1\n;f(1)\n'
    writeFileSync(join(dir, file), src, 'utf8')

    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'json', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'off', noConsole: 'off' },
      plugins: [{ name: 'pickier', rules: {} }],
      pluginRules: { 'pickier/no-unused-vars': ['error', { argsIgnorePattern: '^_' }] },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(0)
  })

  it('does not flag TypeScript generic type parameters as unused variables', async () => {
    const dir = tmp()
    const file = 'g.ts'
    // Test case: commas inside generic type parameters should not be treated as variable separators
    const src = 'const timers = new Map<string, NodeJS.Timeout>()\nsetTimeout(() => timers.clear(), 100)\n'
    writeFileSync(join(dir, file), src, 'utf8')

    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'json', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'off', noConsole: 'off' },
      plugins: [{ name: 'pickier', rules: {} }],
      pluginRules: { 'pickier/no-unused-vars': 'error' },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(0) // Should pass - NodeJS is a type, not an unused variable
  })

  it('does not flag variables when commas appear inside string literals', async () => {
    const dir = tmp()
    const file = 'h.ts'
    // Test case: commas inside strings should not be treated as variable separators
    const src = 'const description = \'Format, lint, and more\'\nconsole.log(description)\n'
    writeFileSync(join(dir, file), src, 'utf8')

    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'json', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'off', noConsole: 'off' },
      plugins: [{ name: 'pickier', rules: {} }],
      pluginRules: { 'pickier/no-unused-vars': 'error' },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(0)
  })

  it('does not flag parameters when braces appear inside string literals', async () => {
    const dir = tmp()
    const file = 'i.ts'
    // Test case: braces inside strings should not confuse function body detection
    const src = 'function check(line: string) {\n  if (line.includes(\'{\')) return true\n  return false\n}\ncheck("test")\n'
    writeFileSync(join(dir, file), src, 'utf8')

    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'json', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'off', noConsole: 'off' },
      plugins: [{ name: 'pickier', rules: {} }],
      pluginRules: { 'pickier/no-unused-vars': 'error' },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(0)
  })

  it('handles TypeScript return type annotations in arrow functions', async () => {
    const dir = tmp()
    const file = 'j.ts'
    // Test case: return type annotations should not break arrow function detection
    const src = 'const getName = (obj: any): string => obj.name\nconsole.log(getName({name: "test"}))\n'
    writeFileSync(join(dir, file), src, 'utf8')

    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'json', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'off', noConsole: 'off' },
      plugins: [{ name: 'pickier', rules: {} }],
      pluginRules: { 'pickier/no-unused-vars': 'error' },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(0)
  })

  it('distinguishes object literals from function bodies in arrow functions', async () => {
    const dir = tmp()
    const file = 'k.ts'
    // Test case: object literal braces should not be confused with function body braces
    const src = 'const makeObj = (a: number, b: number) => ({ sum: a + b })\nconsole.log(makeObj(1, 2))\n'
    writeFileSync(join(dir, file), src, 'utf8')

    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'json', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'off', noConsole: 'off' },
      plugins: [{ name: 'pickier', rules: {} }],
      pluginRules: { 'pickier/no-unused-vars': 'error' },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(0)
  })

  it('ignores arrow functions in comments', async () => {
    const dir = tmp()
    const file = 'l.ts'
    // Test case: arrow functions in comments should not be detected
    const src = '// Example: const fn = (a, b) => a + b\nconst realFn = (x: number) => x * 2\nconsole.log(realFn(5))\n'
    writeFileSync(join(dir, file), src, 'utf8')

    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'json', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'off', noConsole: 'off' },
      plugins: [{ name: 'pickier', rules: {} }],
      pluginRules: { 'pickier/no-unused-vars': 'error' },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(0)
  })

  it('ignores arrow operators in regex literals', async () => {
    const dir = tmp()
    const file = 'm.ts'
    // Test case: => inside regex should not be matched as arrow function
    const src = 'function check(text: string) {\n  if (/^\\(?[A-Z_$,]*(?:\\)\\s*)?=>/i.test(text)) return true\n  return false\n}\ncheck("test")\n'
    writeFileSync(join(dir, file), src, 'utf8')

    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'json', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'off', noConsole: 'off' },
      plugins: [{ name: 'pickier', rules: {} }],
      pluginRules: { 'pickier/no-unused-vars': 'error' },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(0)
  })

  it('handles TypeScript generic type annotations with braces in function signatures', async () => {
    const dir = tmp()
    const file = 'n.ts'
    // Test case: braces inside generic type annotations should not confuse body detection
    const src = 'function validate(data: Array<{ line: number, message: string }>) {\n  return data.length > 0\n}\nvalidate([])\n'
    writeFileSync(join(dir, file), src, 'utf8')

    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'json', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'off', noConsole: 'off' },
      plugins: [{ name: 'pickier', rules: {} }],
      pluginRules: { 'pickier/no-unused-vars': 'error' },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(0)
  })

  it('handles default parameter values with strings containing special chars', async () => {
    const dir = tmp()
    const file = 'o.ts'
    // Test case: default values with strings containing hyphens should not create false positives
    const src = 'function createDir(prefix = \'pickier-test-\') {\n  return prefix + Date.now()\n}\ncreateDir()\n'
    writeFileSync(join(dir, file), src, 'utf8')

    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'json', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'off', noConsole: 'off' },
      plugins: [{ name: 'pickier', rules: {} }],
      pluginRules: { 'pickier/no-unused-vars': 'error' },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(0)
  })

  it('handles default parameter values with objects', async () => {
    const dir = tmp()
    const file = 'p.ts'
    // Test case: default object values should be properly stripped
    const src = 'function init(opts = { key: \'value\', nested: { a: 1 } }) {\n  return opts.key\n}\ninit()\n'
    writeFileSync(join(dir, file), src, 'utf8')

    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'json', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'off', noConsole: 'off' },
      plugins: [{ name: 'pickier', rules: {} }],
      pluginRules: { 'pickier/no-unused-vars': 'error' },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(0)
  })

  it('handles default parameter values with arrays', async () => {
    const dir = tmp()
    const file = 'q.ts'
    // Test case: default array values should be properly stripped
    const src = 'function process(items = [1, 2, 3]) {\n  return items.length\n}\nprocess()\n'
    writeFileSync(join(dir, file), src, 'utf8')

    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'json', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'off', noConsole: 'off' },
      plugins: [{ name: 'pickier', rules: {} }],
      pluginRules: { 'pickier/no-unused-vars': 'error' },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(0)
  })

  it('handles default parameter values with arrow functions', async () => {
    const dir = tmp()
    const file = 'r.ts'
    // Test case: default function values should be properly stripped
    const src = 'function execute(fn = () => \'default\') {\n  return fn()\n}\nexecute()\n'
    writeFileSync(join(dir, file), src, 'utf8')

    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'json', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'off', noConsole: 'off' },
      plugins: [{ name: 'pickier', rules: {} }],
      pluginRules: { 'pickier/no-unused-vars': 'error' },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(0)
  })

  it('handles object shorthand properties', async () => {
    const dir = tmp()
    const file = 's.ts'
    // Test case: object shorthand properties should correctly use the parameter
    const src = 'export function test(filePath: string): any {\n  const issues: any[] = []\n  issues.push({ filePath, line: 1 })\n  return issues\n}\ntest("file.ts")\n'
    writeFileSync(join(dir, file), src, 'utf8')

    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'json', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'off', noConsole: 'off' },
      plugins: [{ name: 'pickier', rules: {} }],
      pluginRules: { 'pickier/no-unused-vars': 'error' },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(0)
  })

  it('does not flag type signature parameters in object type definitions', async () => {
    const dir = tmp()
    const file = 'u.ts'
    // Test case: type signatures should not be checked as function parameters
    const src = 'export const colors: {\n  green: (text: string) => string\n  red: (text: string) => string\n} = {\n  green: (t) => t,\n  red: (t) => t,\n}\ncolors.green("hi")\n'
    writeFileSync(join(dir, file), src, 'utf8')

    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'json', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'off', noConsole: 'off' },
      plugins: [{ name: 'pickier', rules: {} }],
      pluginRules: { 'pickier/no-unused-vars': 'error' },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(0)
  })
})
