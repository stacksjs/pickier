import { describe, expect, it } from 'bun:test'
import { lintText } from '../../../src/linter'
import { defaultConfig } from '../../../src/config'
import type { PickierConfig, RuleContext } from '../../../src/types'
import { generatorStarSpacingRule } from '../../../src/rules/style/generator-star-spacing'
import { yieldStarSpacingRule } from '../../../src/rules/style/yield-star-spacing'
import { functionCallSpacingRule } from '../../../src/rules/style/function-call-spacing'
import { templateTagSpacingRule } from '../../../src/rules/style/template-tag-spacing'
import { noWhitespaceBeforePropertyRule } from '../../../src/rules/style/no-whitespace-before-property'

function configWith(ruleId: string, severity: 'warn' | 'error' = 'warn'): PickierConfig {
  return {
    ...defaultConfig,
    rules: { noDebugger: 'off', noConsole: 'off' },
    pluginRules: { ...defaultConfig.pluginRules, [ruleId]: severity },
  }
}

const ctx: RuleContext = { filePath: 'test.ts', config: defaultConfig }

describe('style/generator-star-spacing', () => {
  it('should flag space before * in generator function', async () => {
    const code = 'function *foo() {}\n'
    const cfg = configWith('style/generator-star-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/generator-star-spacing')
    expect(ruleIssues.length).toBeGreaterThan(0)
    expect(ruleIssues[0].message).toContain('Unexpected space before *')
  })

  it('should not flag correct generator spacing (function* foo)', async () => {
    const code = 'function* foo() {}\n'
    const cfg = configWith('style/generator-star-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/generator-star-spacing')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should flag missing space after * when name directly follows', async () => {
    const code = 'function*foo() {}\n'
    const cfg = configWith('style/generator-star-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/generator-star-spacing')
    expect(ruleIssues.length).toBeGreaterThan(0)
    expect(ruleIssues[0].message).toContain('Missing space after *')
  })

  it('should fix space before * and missing space after *', () => {
    const input = 'function *foo() {}\n'
    const result = generatorStarSpacingRule.fix!(input, ctx)
    expect(result).toContain('function* foo()')
  })

  it('should fix missing space after * in function*name', () => {
    const input = 'function*foo() {}\n'
    const result = generatorStarSpacingRule.fix!(input, ctx)
    expect(result).toContain('function* foo()')
  })
})

describe('style/yield-star-spacing', () => {
  it('should flag space before * in yield expression', async () => {
    const code = 'function* gen() {\n  yield *other()\n}\n'
    const cfg = configWith('style/yield-star-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/yield-star-spacing')
    expect(ruleIssues.length).toBeGreaterThan(0)
    expect(ruleIssues[0].message).toContain('Unexpected space before *')
  })

  it('should flag missing space after * in yield*expr', async () => {
    const code = 'function* gen() {\n  yield*other()\n}\n'
    const cfg = configWith('style/yield-star-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/yield-star-spacing')
    expect(ruleIssues.length).toBeGreaterThan(0)
    expect(ruleIssues[0].message).toContain('Missing space after *')
  })

  it('should not flag correct yield* spacing', async () => {
    const code = 'function* gen() {\n  yield* other()\n}\n'
    const cfg = configWith('style/yield-star-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/yield-star-spacing')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should fix space before * and missing space after *', () => {
    const input = 'yield *other()\n'
    const result = yieldStarSpacingRule.fix!(input, ctx)
    expect(result).toContain('yield* other()')
  })

  it('should fix missing space after * in yield*expr', () => {
    const input = 'yield*other()\n'
    const result = yieldStarSpacingRule.fix!(input, ctx)
    expect(result).toContain('yield* other()')
  })
})

describe('style/function-call-spacing', () => {
  it('should flag space before paren in function call', async () => {
    const code = 'foo ()\n'
    const cfg = configWith('style/function-call-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/function-call-spacing')
    expect(ruleIssues.length).toBeGreaterThan(0)
    expect(ruleIssues[0].message).toContain('Unexpected space between function name and parenthesis')
  })

  it('should not flag keyword followed by paren (if)', async () => {
    const code = 'if (x) {}\n'
    const cfg = configWith('style/function-call-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/function-call-spacing')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should not flag function declaration', async () => {
    const code = 'function foo () {}\n'
    const cfg = configWith('style/function-call-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/function-call-spacing')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should not flag normal function call without space', async () => {
    const code = 'foo()\n'
    const cfg = configWith('style/function-call-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/function-call-spacing')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should fix by removing space before paren', () => {
    const input = 'foo ()\n'
    const result = functionCallSpacingRule.fix!(input, ctx)
    expect(result).toContain('foo()')
    expect(result).not.toContain('foo ()')
  })
})

describe('style/template-tag-spacing', () => {
  it('should flag space between tag and template literal', async () => {
    const code = 'const x = html `str`\n'
    const cfg = configWith('style/template-tag-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/template-tag-spacing')
    expect(ruleIssues.length).toBeGreaterThan(0)
    expect(ruleIssues[0].message).toContain('Unexpected space between tag function and template literal')
  })

  it('should not flag tag directly followed by template literal', async () => {
    const code = 'const x = html`str`\n'
    const cfg = configWith('style/template-tag-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/template-tag-spacing')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should not flag keyword before template literal', async () => {
    const code = 'return `str`\n'
    const cfg = configWith('style/template-tag-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/template-tag-spacing')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should fix by removing space between tag and template', () => {
    const input = 'const x = html `str`\n'
    const result = templateTagSpacingRule.fix!(input, ctx)
    expect(result).toContain('html`str`')
    expect(result).not.toContain('html `str`')
  })
})

describe('style/no-whitespace-before-property', () => {
  it('should flag space before dot in property access', async () => {
    const code = 'foo .bar\n'
    const cfg = configWith('style/no-whitespace-before-property')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/no-whitespace-before-property')
    expect(ruleIssues.length).toBeGreaterThan(0)
    expect(ruleIssues[0].message).toContain('Unexpected whitespace before property access dot')
  })

  it('should flag space before optional chaining', async () => {
    const code = 'foo ?.bar\n'
    const cfg = configWith('style/no-whitespace-before-property')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/no-whitespace-before-property')
    expect(ruleIssues.length).toBeGreaterThan(0)
    expect(ruleIssues[0].message).toContain('Unexpected whitespace before optional chaining operator')
  })

  it('should not flag normal property access without space', async () => {
    const code = 'foo.bar\n'
    const cfg = configWith('style/no-whitespace-before-property')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/no-whitespace-before-property')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should not flag dot at start of line (method chaining)', async () => {
    const code = 'foo\n  .bar()\n'
    const cfg = configWith('style/no-whitespace-before-property')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/no-whitespace-before-property')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should fix by removing space before dot', () => {
    const input = 'foo .bar\n'
    const result = noWhitespaceBeforePropertyRule.fix!(input, ctx)
    expect(result).toContain('foo.bar')
    expect(result).not.toContain('foo .bar')
  })

  it('should fix by removing space before optional chaining', () => {
    const input = 'foo ?.bar\n'
    const result = noWhitespaceBeforePropertyRule.fix!(input, ctx)
    expect(result).toContain('foo?.bar')
    expect(result).not.toContain('foo ?.bar')
  })
})
