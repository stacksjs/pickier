import { describe, expect, it } from 'bun:test'
import { lintText } from '../../../src/linter'
import { defaultConfig } from '../../../src/config'
import type { PickierConfig, RuleContext } from '../../../src/types'
import { spaceUnaryOpsRule } from '../../../src/rules/style/space-unary-ops'
import { wrapIifeRule } from '../../../src/rules/style/wrap-iife'
import { noExtraParensRule } from '../../../src/rules/style/no-extra-parens'
import { noMixedSpacesAndTabsRule } from '../../../src/rules/style/no-mixed-spaces-and-tabs'

function configWith(ruleId: string, severity: 'warn' | 'error' = 'warn'): PickierConfig {
  return {
    ...defaultConfig,
    rules: { noDebugger: 'off', noConsole: 'off' },
    pluginRules: { ...defaultConfig.pluginRules, [ruleId]: severity },
  }
}

const ctx: RuleContext = { filePath: 'test.ts', config: defaultConfig }

describe('style/space-unary-ops', () => {
  it('should flag missing space after typeof', async () => {
    const code = 'const x = typeof(y)\n'
    const cfg = configWith('style/space-unary-ops')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/space-unary-ops')
    expect(ruleIssues.length).toBeGreaterThan(0)
  })

  it('should not flag space after typeof', async () => {
    const code = 'const x = typeof y\n'
    const cfg = configWith('style/space-unary-ops')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/space-unary-ops')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should flag space after !', async () => {
    const code = 'const x = ! y\n'
    const cfg = configWith('style/space-unary-ops')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/space-unary-ops')
    expect(ruleIssues.length).toBeGreaterThan(0)
    expect(ruleIssues[0].message).toContain('Unexpected space after')
  })

  it('should not flag ! without space', async () => {
    const code = 'const x = !y\n'
    const cfg = configWith('style/space-unary-ops')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/space-unary-ops')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should fix by adding/removing space', () => {
    const input = 'const x = typeof(y)\nconst z = ! a\n'
    const result = spaceUnaryOpsRule.fix!(input, ctx)
    expect(result).toContain('typeof (y)')
    expect(result).toContain('!a')
  })
})

describe('style/wrap-iife', () => {
  it('should not flag wrapped IIFE', async () => {
    const code = 'const x = (function() { return 1 })()\n'
    const cfg = configWith('style/wrap-iife')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/wrap-iife')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should not flag regular function call', async () => {
    const code = 'function foo() { return 1 }\nfoo()\n'
    const cfg = configWith('style/wrap-iife')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/wrap-iife')
    expect(ruleIssues).toHaveLength(0)
  })
})

describe('style/no-extra-parens', () => {
  it('should flag return with redundant parens on simple expression', async () => {
    const code = 'function foo() {\n  return (x)\n}\n'
    const cfg = configWith('style/no-extra-parens')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/no-extra-parens')
    expect(ruleIssues.length).toBeGreaterThan(0)
    expect(ruleIssues[0].message).toContain('Unnecessary parentheses')
  })

  it('should flag return with redundant parens on literal', async () => {
    const code = 'function foo() {\n  return (true)\n}\n'
    const cfg = configWith('style/no-extra-parens')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/no-extra-parens')
    expect(ruleIssues.length).toBeGreaterThan(0)
  })

  it('should not flag return without parens', async () => {
    const code = 'function foo() {\n  return x\n}\n'
    const cfg = configWith('style/no-extra-parens')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/no-extra-parens')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should not flag return with complex expression in parens', async () => {
    const code = 'function foo() {\n  return (a + b)\n}\n'
    const cfg = configWith('style/no-extra-parens')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/no-extra-parens')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should fix by removing redundant parens', () => {
    const input = '  return (x)\n'
    const result = noExtraParensRule.fix!(input, ctx)
    expect(result).toContain('return x')
    expect(result).not.toContain('(x)')
  })

  it('should fix return with literal', () => {
    const input = '  return (true)\n'
    const result = noExtraParensRule.fix!(input, ctx)
    expect(result).toContain('return true')
  })
})

describe('style/no-mixed-spaces-and-tabs', () => {
  it('should flag mixed spaces and tabs in indentation', async () => {
    const code = ' \tconst x = 1\n'
    const cfg = configWith('style/no-mixed-spaces-and-tabs')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/no-mixed-spaces-and-tabs')
    expect(ruleIssues.length).toBeGreaterThan(0)
    expect(ruleIssues[0].message).toBe('Mixed spaces and tabs in indentation')
  })

  it('should not flag spaces-only indentation', async () => {
    const code = '  const x = 1\n'
    const cfg = configWith('style/no-mixed-spaces-and-tabs')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/no-mixed-spaces-and-tabs')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should not flag tabs-only indentation', async () => {
    const code = '\t\tconst x = 1\n'
    const cfg = configWith('style/no-mixed-spaces-and-tabs')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/no-mixed-spaces-and-tabs')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should not flag lines without indentation', async () => {
    const code = 'const x = 1\n'
    const cfg = configWith('style/no-mixed-spaces-and-tabs')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/no-mixed-spaces-and-tabs')
    expect(ruleIssues).toHaveLength(0)
  })
})
