import { describe, expect, it } from 'bun:test'
import { lintText } from '../../../src/linter'
import { defaultConfig } from '../../../src/config'
import type { PickierConfig, RuleContext } from '../../../src/types'
import { arrowParensRule } from '../../../src/rules/style/arrow-parens'
import { spaceBeforeFunctionParenRule } from '../../../src/rules/style/space-before-function-paren'
import { templateCurlySpacingRule } from '../../../src/rules/style/template-curly-spacing'

function configWith(ruleId: string, severity: 'warn' | 'error' = 'warn'): PickierConfig {
  return {
    ...defaultConfig,
    rules: { noDebugger: 'off', noConsole: 'off' },
    pluginRules: { ...defaultConfig.pluginRules, [ruleId]: severity },
  }
}

const ctx: RuleContext = { filePath: 'test.ts', config: defaultConfig }

describe('style/arrow-parens', () => {
  it('should flag arrow function without parens around single param', async () => {
    const code = 'const fn = x => x + 1\n'
    const cfg = configWith('style/arrow-parens')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/arrow-parens')
    expect(ruleIssues.length).toBeGreaterThan(0)
  })

  it('should not flag arrow function with parens', async () => {
    const code = 'const fn = (x) => x + 1\n'
    const cfg = configWith('style/arrow-parens')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/arrow-parens')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should not flag multi-param arrow function', async () => {
    const code = 'const fn = (x, y) => x + y\n'
    const cfg = configWith('style/arrow-parens')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/arrow-parens')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should not flag async keyword', async () => {
    const code = 'const fn = async () => {}\n'
    const cfg = configWith('style/arrow-parens')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/arrow-parens')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should fix by adding parens', () => {
    const input = 'const fn = x => x + 1\n'
    const result = arrowParensRule.fix!(input, ctx)
    expect(result).toContain('(x)')
  })
})

describe('style/space-before-function-paren', () => {
  it('should flag named function with space before paren', async () => {
    const code = 'function foo () {}\n'
    const cfg = configWith('style/space-before-function-paren')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/space-before-function-paren')
    expect(ruleIssues.length).toBeGreaterThan(0)
    expect(ruleIssues[0].message).toBe('Unexpected space before function parentheses')
  })

  it('should flag anonymous function without space before paren', async () => {
    const code = 'const fn = function() {}\n'
    const cfg = configWith('style/space-before-function-paren')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/space-before-function-paren')
    expect(ruleIssues.length).toBeGreaterThan(0)
    expect(ruleIssues[0].message).toBe('Missing space before function parentheses')
  })

  it('should not flag correct named function', async () => {
    const code = 'function foo() {}\n'
    const cfg = configWith('style/space-before-function-paren')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/space-before-function-paren')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should not flag correct anonymous function', async () => {
    const code = 'const fn = function () {}\n'
    const cfg = configWith('style/space-before-function-paren')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/space-before-function-paren')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should fix named function spacing', () => {
    const input = 'function foo () {}\n'
    const result = spaceBeforeFunctionParenRule.fix!(input, ctx)
    expect(result).toContain('function foo()')
  })

  it('should fix anonymous function spacing', () => {
    const input = 'const fn = function() {}\n'
    const result = spaceBeforeFunctionParenRule.fix!(input, ctx)
    expect(result).toContain('function ()')
  })
})

describe('style/template-curly-spacing', () => {
  it('should flag space inside template literal interpolation', async () => {
    const code = 'const x = `hello ${ name }`\n'
    const cfg = configWith('style/template-curly-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/template-curly-spacing')
    expect(ruleIssues.length).toBeGreaterThan(0)
  })

  it('should not flag template literal without spaces', async () => {
    const code = 'const x = `hello ${name}`\n'
    const cfg = configWith('style/template-curly-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/template-curly-spacing')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should fix by removing spaces', () => {
    const input = 'const x = `hello ${ name }`\n'
    const result = templateCurlySpacingRule.fix!(input, ctx)
    expect(result).toContain('${name}')
  })
})
