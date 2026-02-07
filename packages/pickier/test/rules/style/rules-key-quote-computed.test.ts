import { describe, expect, it } from 'bun:test'
import { lintText } from '../../../src/linter'
import { defaultConfig } from '../../../src/config'
import type { PickierConfig, RuleContext } from '../../../src/types'
import { keySpacingRule } from '../../../src/rules/style/key-spacing'
import { quotePropsRule } from '../../../src/rules/style/quote-props'
import { computedPropertySpacingRule } from '../../../src/rules/style/computed-property-spacing'
import { arrayBracketSpacingRule } from '../../../src/rules/style/array-bracket-spacing'
import { spaceInParensRule } from '../../../src/rules/style/space-in-parens'

function configWith(ruleId: string, severity: 'warn' | 'error' = 'warn'): PickierConfig {
  return {
    ...defaultConfig,
    rules: { noDebugger: 'off', noConsole: 'off' },
    pluginRules: { ...defaultConfig.pluginRules, [ruleId]: severity },
  }
}

const ctx: RuleContext = { filePath: 'test.ts', config: defaultConfig }

describe('style/key-spacing', () => {
  it('should flag missing space after colon in object property', async () => {
    const code = 'const obj = {\n  name:value\n}\n'
    const cfg = configWith('style/key-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/key-spacing')
    expect(ruleIssues.length).toBeGreaterThan(0)
    expect(ruleIssues[0].message).toContain('Missing space after colon')
  })

  it('should not flag properly spaced property', async () => {
    const code = 'const obj = {\n  name: value\n}\n'
    const cfg = configWith('style/key-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/key-spacing')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should fix missing space after colon', () => {
    const input = '  name:value\n'
    const result = keySpacingRule.fix!(input, ctx)
    expect(result).toContain('name: value')
  })
})

describe('style/quote-props', () => {
  it('should flag unnecessarily quoted property', async () => {
    const code = 'const obj = {\n  \'name\': 1\n}\n'
    const cfg = configWith('style/quote-props')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/quote-props')
    expect(ruleIssues.length).toBeGreaterThan(0)
    expect(ruleIssues[0].message).toContain('Unnecessarily quoted')
  })

  it('should not flag property that needs quotes', async () => {
    const code = 'const obj = {\n  \'data-id\': 1\n}\n'
    const cfg = configWith('style/quote-props')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/quote-props')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should not flag unquoted property', async () => {
    const code = 'const obj = {\n  name: 1\n}\n'
    const cfg = configWith('style/quote-props')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/quote-props')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should fix by removing quotes', () => {
    const input = '  \'name\': 1\n'
    const result = quotePropsRule.fix!(input, ctx)
    expect(result).toContain('name:')
    expect(result).not.toContain('\'name\'')
  })
})

describe('style/computed-property-spacing', () => {
  it('should flag space inside computed property brackets', async () => {
    const code = 'const val = obj[ key ]\n'
    const cfg = configWith('style/computed-property-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/computed-property-spacing')
    expect(ruleIssues.length).toBeGreaterThan(0)
  })

  it('should not flag computed property without spaces', async () => {
    const code = 'const val = obj[key]\n'
    const cfg = configWith('style/computed-property-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/computed-property-spacing')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should fix by removing spaces', () => {
    const input = 'const val = obj[ key ]\n'
    const result = computedPropertySpacingRule.fix!(input, ctx)
    expect(result).toContain('obj[key]')
  })
})

describe('style/array-bracket-spacing', () => {
  it('should flag space inside array brackets', async () => {
    const code = 'const arr = [ 1, 2, 3 ]\n'
    const cfg = configWith('style/array-bracket-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/array-bracket-spacing')
    expect(ruleIssues.length).toBeGreaterThan(0)
  })

  it('should not flag array without inner spaces', async () => {
    const code = 'const arr = [1, 2, 3]\n'
    const cfg = configWith('style/array-bracket-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/array-bracket-spacing')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should not flag empty array', async () => {
    const code = 'const arr = []\n'
    const cfg = configWith('style/array-bracket-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/array-bracket-spacing')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should fix by removing spaces', () => {
    const input = 'const arr = [ 1, 2, 3 ]\n'
    const result = arrayBracketSpacingRule.fix!(input, ctx)
    expect(result).toContain('[1, 2, 3]')
  })
})

describe('style/space-in-parens', () => {
  it('should flag space inside parentheses', async () => {
    const code = 'foo( a, b )\n'
    const cfg = configWith('style/space-in-parens')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/space-in-parens')
    expect(ruleIssues.length).toBeGreaterThan(0)
  })

  it('should not flag parens without spaces', async () => {
    const code = 'foo(a, b)\n'
    const cfg = configWith('style/space-in-parens')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/space-in-parens')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should not flag empty parens', async () => {
    const code = 'foo()\n'
    const cfg = configWith('style/space-in-parens')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/space-in-parens')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should fix by removing spaces', () => {
    const input = 'foo( a, b )\n'
    const result = spaceInParensRule.fix!(input, ctx)
    expect(result).toContain('foo(a, b)')
  })
})
