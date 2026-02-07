import { describe, expect, it } from 'bun:test'
import { lintText } from '../../../src/linter'
import { defaultConfig } from '../../../src/config'
import type { PickierConfig, RuleContext } from '../../../src/types'
import { blockSpacingRule } from '../../../src/rules/style/block-spacing'
import { spaceBeforeBlocksRule } from '../../../src/rules/style/space-before-blocks'
import { objectCurlySpacingRule } from '../../../src/rules/style/object-curly-spacing'
import { paddedBlocksRule } from '../../../src/rules/style/padded-blocks'
import { spacedCommentRule } from '../../../src/rules/style/spaced-comment'

function configWith(ruleId: string, severity: 'warn' | 'error' = 'warn'): PickierConfig {
  return {
    ...defaultConfig,
    rules: { noDebugger: 'off', noConsole: 'off' },
    pluginRules: { ...defaultConfig.pluginRules, [ruleId]: severity },
  }
}

const ctx: RuleContext = { filePath: 'test.ts', config: defaultConfig }

// ---------------------------------------------------------------------------
// style/block-spacing
// ---------------------------------------------------------------------------
describe('style/block-spacing', () => {
  // -- detection -----------------------------------------------------------

  it('should flag missing space after { in single-line block', async () => {
    const code = `if (x) {return 1}\n`
    const cfg = configWith('style/block-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/block-spacing')
    expect(ruleIssues.length).toBeGreaterThan(0)
    expect(ruleIssues.some(i => i.message.includes('after'))).toBe(true)
  })

  it('should flag missing space before } in single-line block', async () => {
    const code = `function foo() {return x}\n`
    const cfg = configWith('style/block-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/block-spacing')
    expect(ruleIssues.length).toBeGreaterThan(0)
    expect(ruleIssues.some(i => i.message.includes('before'))).toBe(true)
  })

  it('should flag both missing spaces in {return x}', async () => {
    const code = `const fn = () => {return x}\n`
    const cfg = configWith('style/block-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/block-spacing')
    // Should report both after { and before }
    expect(ruleIssues.length).toBe(2)
  })

  // -- no false positives --------------------------------------------------

  it('should not flag properly spaced single-line block', async () => {
    const code = `if (x) { return 1 }\n`
    const cfg = configWith('style/block-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/block-spacing')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should not flag empty braces', async () => {
    const code = `const obj = {}\n`
    const cfg = configWith('style/block-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/block-spacing')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should not flag template literal ${}', async () => {
    const code = 'const msg = `hello ${name}`\n'
    const cfg = configWith('style/block-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/block-spacing')
    expect(ruleIssues).toHaveLength(0)
  })

  // -- fixer ---------------------------------------------------------------

  it('should fix missing spaces in single-line block', () => {
    const input = `if (x) {return x}\n`
    const result = blockSpacingRule.fix!(input, ctx)
    expect(result).toContain('{ return x }')
  })

  it('should not alter already-correct blocks', () => {
    const input = `if (x) { return x }\n`
    const result = blockSpacingRule.fix!(input, ctx)
    expect(result).toBe(input)
  })
})

// ---------------------------------------------------------------------------
// style/space-before-blocks
// ---------------------------------------------------------------------------
describe('style/space-before-blocks', () => {
  // -- detection -----------------------------------------------------------

  it('should flag missing space before { after closing paren', async () => {
    const code = `if (x){\n  return 1\n}\n`
    const cfg = configWith('style/space-before-blocks')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/space-before-blocks')
    expect(ruleIssues.length).toBeGreaterThan(0)
    expect(ruleIssues[0].message).toBe('Missing space before \'{\'')
  })

  it('should flag missing space before { in function declaration', async () => {
    const code = `function foo(){\n  return 1\n}\n`
    const cfg = configWith('style/space-before-blocks')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/space-before-blocks')
    expect(ruleIssues.length).toBeGreaterThan(0)
  })

  it('should flag missing space before { after class name', async () => {
    const code = `class Foo{\n  bar() {}\n}\n`
    const cfg = configWith('style/space-before-blocks')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/space-before-blocks')
    expect(ruleIssues.length).toBeGreaterThan(0)
  })

  // -- no false positives --------------------------------------------------

  it('should not flag when space exists before {', async () => {
    const code = `if (x) {\n  return 1\n}\n`
    const cfg = configWith('style/space-before-blocks')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/space-before-blocks')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should not flag object literal assignment', async () => {
    const code = `const x = {\n  a: 1,\n}\n`
    const cfg = configWith('style/space-before-blocks')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/space-before-blocks')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should not flag type annotation with {', async () => {
    const code = `const x: { a: number } = { a: 1 }\n`
    const cfg = configWith('style/space-before-blocks')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/space-before-blocks')
    expect(ruleIssues).toHaveLength(0)
  })

  // -- fixer ---------------------------------------------------------------

  it('should fix missing space before { after )', () => {
    const input = `if (x){\n  return 1\n}\n`
    const result = spaceBeforeBlocksRule.fix!(input, ctx)
    expect(result).toContain('if (x) {')
  })

  it('should fix missing space before { after keyword', () => {
    const input = `class Foo{\n  bar() {}\n}\n`
    const result = spaceBeforeBlocksRule.fix!(input, ctx)
    expect(result).toContain('class Foo {')
  })
})

// ---------------------------------------------------------------------------
// style/object-curly-spacing
// ---------------------------------------------------------------------------
describe('style/object-curly-spacing', () => {
  // -- detection -----------------------------------------------------------

  it('should flag missing space after { in object literal', async () => {
    const code = `const obj = {a: 1}\n`
    const cfg = configWith('style/object-curly-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/object-curly-spacing')
    expect(ruleIssues.length).toBeGreaterThan(0)
    expect(ruleIssues.some(i => i.message.includes('after'))).toBe(true)
  })

  it('should flag missing space before } in object literal', async () => {
    const code = `const obj = {a: 1}\n`
    const cfg = configWith('style/object-curly-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/object-curly-spacing')
    expect(ruleIssues.some(i => i.message.includes('before'))).toBe(true)
  })

  it('should flag missing spaces in destructuring', async () => {
    const code = `const {a} = x\n`
    const cfg = configWith('style/object-curly-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/object-curly-spacing')
    expect(ruleIssues.length).toBeGreaterThan(0)
  })

  // -- no false positives --------------------------------------------------

  it('should not flag properly spaced object', async () => {
    const code = `const obj = { a: 1 }\n`
    const cfg = configWith('style/object-curly-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/object-curly-spacing')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should not flag empty braces', async () => {
    const code = `const obj = {}\n`
    const cfg = configWith('style/object-curly-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/object-curly-spacing')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should not flag template literal ${expr}', async () => {
    const code = 'const msg = `value: ${expr}`\n'
    const cfg = configWith('style/object-curly-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/object-curly-spacing')
    expect(ruleIssues).toHaveLength(0)
  })

  // -- fixer ---------------------------------------------------------------

  it('should fix missing spaces in object literal', () => {
    const input = `const obj = {a: 1}\n`
    const result = objectCurlySpacingRule.fix!(input, ctx)
    expect(result).toContain('{ a: 1 }')
  })

  it('should fix missing spaces in destructuring', () => {
    const input = `const {a, b} = x\n`
    const result = objectCurlySpacingRule.fix!(input, ctx)
    expect(result).toContain('{ a, b }')
  })
})

// ---------------------------------------------------------------------------
// style/padded-blocks
// ---------------------------------------------------------------------------
describe('style/padded-blocks', () => {
  // -- detection -----------------------------------------------------------

  it('should flag empty line after opening brace', async () => {
    const code = `if (x) {\n\n  foo()\n}\n`
    const cfg = configWith('style/padded-blocks')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/padded-blocks')
    expect(ruleIssues.length).toBeGreaterThan(0)
    expect(ruleIssues.some(i => i.message.includes('after opening brace'))).toBe(true)
  })

  it('should flag empty line before closing brace', async () => {
    const code = `if (x) {\n  foo()\n\n}\n`
    const cfg = configWith('style/padded-blocks')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/padded-blocks')
    expect(ruleIssues.length).toBeGreaterThan(0)
    expect(ruleIssues.some(i => i.message.includes('before closing brace'))).toBe(true)
  })

  it('should flag both padding lines', async () => {
    const code = `function foo() {\n\n  bar()\n\n}\n`
    const cfg = configWith('style/padded-blocks')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/padded-blocks')
    expect(ruleIssues.length).toBe(2)
  })

  // -- no false positives --------------------------------------------------

  it('should not flag blocks without padding', async () => {
    const code = `if (x) {\n  foo()\n}\n`
    const cfg = configWith('style/padded-blocks')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/padded-blocks')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should not flag blocks with multiple statements and no padding', async () => {
    const code = `function foo() {\n  const a = 1\n  return a\n}\n`
    const cfg = configWith('style/padded-blocks')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/padded-blocks')
    expect(ruleIssues).toHaveLength(0)
  })

  // -- fixer ---------------------------------------------------------------

  it('should remove empty line after opening brace', () => {
    const input = `if (x) {\n\n  foo()\n}\n`
    const result = paddedBlocksRule.fix!(input, ctx)
    expect(result).toBe(`if (x) {\n  foo()\n}\n`)
  })

  it('should remove empty line before closing brace', () => {
    const input = `if (x) {\n  foo()\n\n}\n`
    const result = paddedBlocksRule.fix!(input, ctx)
    expect(result).toBe(`if (x) {\n  foo()\n}\n`)
  })

  it('should remove both padding lines at once', () => {
    const input = `function foo() {\n\n  bar()\n\n}\n`
    const result = paddedBlocksRule.fix!(input, ctx)
    expect(result).toBe(`function foo() {\n  bar()\n}\n`)
  })
})

// ---------------------------------------------------------------------------
// style/spaced-comment
// ---------------------------------------------------------------------------
describe('style/spaced-comment', () => {
  // -- detection -----------------------------------------------------------

  it('should flag line comment without space after //', async () => {
    const code = `//comment\n`
    const cfg = configWith('style/spaced-comment')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/spaced-comment')
    expect(ruleIssues.length).toBeGreaterThan(0)
    expect(ruleIssues[0].message).toBe('Missing space after \'//\'')
  })

  it('should flag block comment without space after /*', async () => {
    const code = `/*comment*/\n`
    const cfg = configWith('style/spaced-comment')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/spaced-comment')
    expect(ruleIssues.length).toBeGreaterThan(0)
    expect(ruleIssues[0].message).toBe('Missing space after \'/*\'')
  })

  it('should flag inline comment without space', async () => {
    const code = `const x = 1 //inline\n`
    const cfg = configWith('style/spaced-comment')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/spaced-comment')
    expect(ruleIssues.length).toBeGreaterThan(0)
  })

  // -- no false positives --------------------------------------------------

  it('should not flag properly spaced line comment', async () => {
    const code = `// comment\n`
    const cfg = configWith('style/spaced-comment')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/spaced-comment')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should not flag properly spaced block comment', async () => {
    const code = `/* comment */\n`
    const cfg = configWith('style/spaced-comment')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/spaced-comment')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should not flag triple-slash directives', async () => {
    const code = `/// <reference types="bun" />\n`
    const cfg = configWith('style/spaced-comment')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/spaced-comment')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should not flag //! comments', async () => {
    const code = `//! important note\n`
    const cfg = configWith('style/spaced-comment')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/spaced-comment')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should not flag URLs containing //', async () => {
    const code = `const url = 'https://example.com'\n`
    const cfg = configWith('style/spaced-comment')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/spaced-comment')
    expect(ruleIssues).toHaveLength(0)
  })

  // -- fixer ---------------------------------------------------------------

  it('should fix line comment by adding space after //', () => {
    const input = `//comment\n`
    const result = spacedCommentRule.fix!(input, ctx)
    expect(result).toBe(`// comment\n`)
  })

  it('should fix block comment by adding space after /*', () => {
    const input = `/*comment*/\n`
    const result = spacedCommentRule.fix!(input, ctx)
    expect(result).toBe(`/* comment*/\n`)
  })

  it('should not alter already-spaced comments', () => {
    const input = `// already good\n`
    const result = spacedCommentRule.fix!(input, ctx)
    expect(result).toBe(input)
  })
})
