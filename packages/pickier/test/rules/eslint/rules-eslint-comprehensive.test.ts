import { describe, expect, it } from 'bun:test'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runLint } from '../../../src/linter'

function tmp(): string {
  return mkdtempSync(join(tmpdir(), 'pickier-eslint-comprehensive-'))
}

describe('eslint plugin - comprehensive tests', () => {
  it('detects multiple error patterns in single file', async () => {
    const dir = tmp()
    const file = 'errors.ts'
    const src = [
      '// Multiple ESLint rule violations',
      'var oldStyle = 1  // no-var',
      'if (x == 5) {}  // eqeqeq',
      'if (x === x) {}  // no-self-compare',
      'if (x === NaN) {}  // use-isnan',
      'const arr = [1, , 3]  // no-sparse-arrays',
      'eval("code")  // no-eval',
      'with (obj) {}  // no-with',
      '',
    ].join('\n')
    writeFileSync(join(dir, file), src, 'utf8')

    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'json', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'off', noConsole: 'off' },
      pluginRules: {
        'eslint/no-var': 'error',
        'eslint/eqeqeq': 'error',
        'eslint/no-self-compare': 'error',
        'eslint/use-isnan': 'error',
        'eslint/no-sparse-arrays': 'error',
        'eslint/no-eval': 'error',
        'eslint/no-with': 'error',
        'prefer-const': 'off',
        'no-unused-vars': 'off',
        'quotes': 'off',
      },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(1) // Should fail with multiple errors
  })

  it('passes clean code with no violations', async () => {
    const dir = tmp()
    const file = 'clean.ts'
    const src = [
      'const x = 5',
      'let y = 10',
      'if (x === 5) {',
      '  console.log("clean")',
      '}',
      'if (isNaN(y)) {',
      '  console.log("not a number")',
      '}',
      'const arr = [1, 2, 3]',
      '',
    ].join('\n')
    writeFileSync(join(dir, file), src, 'utf8')

    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'json', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'off', noConsole: 'off' },
      pluginRules: {
        'eslint/no-var': 'error',
        'eslint/eqeqeq': 'error',
        'eslint/no-self-compare': 'error',
        'eslint/use-isnan': 'error',
        'eslint/no-sparse-arrays': 'error',
        'eslint/no-eval': 'error',
        'prefer-const': 'off',
        'no-unused-vars': 'off',
        'quotes': 'off',
      },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(0)
  })

  it('detects object literal issues', async () => {
    const dir = tmp()
    const file = 'objects.ts'
    const src = [
      'const obj1 = {',
      '  name: "Alice",',
      '  age: 30,',
      '  name: "Bob"  // no-dupe-keys',
      '}',
      '',
      'switch (x) {',
      '  case 1:',
      '    break',
      '  case 1:  // no-duplicate-case',
      '    break',
      '}',
      '',
    ].join('\n')
    writeFileSync(join(dir, file), src, 'utf8')

    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'json', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'off', noConsole: 'off' },
      pluginRules: {
        'eslint/no-dupe-keys': 'error',
        'eslint/no-duplicate-case': 'error',
        'no-unused-vars': 'off',
        'quotes': 'off',
      },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(1)
  })

  it('detects dangerous patterns', async () => {
    const dir = tmp()
    const file = 'dangerous.ts'
    const src = [
      'eval("code")  // no-eval',
      'new Function("return 1")  // no-new-func',
      'setTimeout("alert(1)", 1000)  // no-implied-eval',
      'const str = new String("test")  // no-new-wrappers',
      'const proto = obj.__proto__  // no-proto',
      'const iter = obj.__iterator__  // no-iterator',
      '',
    ].join('\n')
    writeFileSync(join(dir, file), src, 'utf8')

    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'json', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'off', noConsole: 'off' },
      pluginRules: {
        'eslint/no-eval': 'error',
        'eslint/no-new-func': 'error',
        'eslint/no-implied-eval': 'error',
        'eslint/no-new-wrappers': 'error',
        'eslint/no-proto': 'error',
        'eslint/no-iterator': 'error',
        'no-unused-vars': 'off',
        'quotes': 'off',
      },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(1)
  })

  it('detects control flow issues', async () => {
    const dir = tmp()
    const file = 'control-flow.ts'
    const src = [
      'function test1() {',
      '  return 1',
      '  console.log("unreachable")  // no-unreachable',
      '}',
      '',
      'function test2() {',
      '  if (x = 5) {}  // no-cond-assign',
      '}',
      '',
      'function test3() {',
      '  if (true) {}  // no-constant-condition',
      '}',
      '',
    ].join('\n')
    writeFileSync(join(dir, file), src, 'utf8')

    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'json', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'off', noConsole: 'off' },
      pluginRules: {
        'eslint/no-unreachable': 'error',
        'eslint/no-cond-assign': 'error',
        'eslint/no-constant-condition': 'error',
        'no-unused-vars': 'off',
        'quotes': 'off',
      },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(1)
  })

  it('detects code quality issues', async () => {
    const dir = tmp()
    const file = 'quality.ts'
    const src = [
      'if (Boolean(condition)) {}  // no-extra-boolean-cast',
      'const concat = "a" + "b"  // no-useless-concat',
      'function test() { return }  // no-useless-return',
      'import { x as x } from "mod"  // no-useless-rename',
      '',
    ].join('\n')
    writeFileSync(join(dir, file), src, 'utf8')

    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify({
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'json', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'off', noConsole: 'off' },
      pluginRules: {
        'eslint/no-extra-boolean-cast': 'error',
        'eslint/no-useless-concat': 'warn',
        'eslint/no-useless-return': 'warn',
        'eslint/no-useless-rename': 'error',
        'no-unused-vars': 'off',
        'quotes': 'off',
      },
    }, null, 2), 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(1) // Has errors
  })
})
