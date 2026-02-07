import { describe, expect, it } from 'bun:test'
import { lintText } from '../../../src/linter'
import { defaultConfig } from '../../../src/config'
import type { PickierConfig, RuleContext } from '../../../src/types'
import { noTabsRule } from '../../../src/rules/style/no-tabs'
import { noFloatingDecimalRule } from '../../../src/rules/style/no-floating-decimal'
import { newParensRule } from '../../../src/rules/style/new-parens'

function configWith(ruleId: string, severity: 'warn' | 'error' = 'warn'): PickierConfig {
  return {
    ...defaultConfig,
    rules: { noDebugger: 'off', noConsole: 'off' },
    pluginRules: { ...defaultConfig.pluginRules, [ruleId]: severity },
  }
}

const ctx: RuleContext = { filePath: 'test.ts', config: defaultConfig }

describe('style/no-tabs', () => {
  it('should flag tab characters when using spaces indent', async () => {
    const code = '\tconst x = 1\n'
    const cfg = configWith('style/no-tabs')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/no-tabs')
    expect(ruleIssues.length).toBeGreaterThan(0)
    expect(ruleIssues[0].message).toBe('Unexpected tab character')
  })

  it('should not flag tabs when indent style is tabs', async () => {
    const code = '\tconst x = 1\n'
    const cfg: PickierConfig = {
      ...configWith('style/no-tabs'),
      format: { ...defaultConfig.format, indentStyle: 'tabs' },
    }
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/no-tabs')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should not flag spaces indentation', async () => {
    const code = '  const x = 1\n'
    const cfg = configWith('style/no-tabs')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/no-tabs')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should fix tabs to spaces', () => {
    const input = '\tconst x = 1\n'
    const result = noTabsRule.fix!(input, ctx)
    expect(result).toBe('  const x = 1\n')
    expect(result).not.toContain('\t')
  })
})

describe('style/no-floating-decimal', () => {
  it('should flag leading decimal point', async () => {
    const code = 'const x = .5\n'
    const cfg = configWith('style/no-floating-decimal')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/no-floating-decimal')
    expect(ruleIssues.length).toBeGreaterThan(0)
    expect(ruleIssues[0].message).toBe('Unexpected leading decimal point')
  })

  it('should flag trailing decimal point', async () => {
    const code = 'const x = 2.\n'
    const cfg = configWith('style/no-floating-decimal')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/no-floating-decimal')
    expect(ruleIssues.length).toBeGreaterThan(0)
    expect(ruleIssues[0].message).toBe('Unexpected trailing decimal point')
  })

  it('should not flag normal decimals', async () => {
    const code = 'const x = 0.5\nconst y = 2.0\n'
    const cfg = configWith('style/no-floating-decimal')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/no-floating-decimal')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should not flag property access', async () => {
    const code = 'const x = obj.prop\n'
    const cfg = configWith('style/no-floating-decimal')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/no-floating-decimal')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should fix leading decimal', () => {
    const input = 'const x = .5\n'
    const result = noFloatingDecimalRule.fix!(input, ctx)
    expect(result).toContain('0.5')
  })

  it('should fix trailing decimal', () => {
    const input = 'const x = 2.\n'
    const result = noFloatingDecimalRule.fix!(input, ctx)
    expect(result).toContain('2.0')
  })
})

describe('style/new-parens', () => {
  it('should flag constructor without parens', async () => {
    const code = 'const x = new Date\n'
    const cfg = configWith('style/new-parens')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/new-parens')
    expect(ruleIssues.length).toBeGreaterThan(0)
  })

  it('should not flag constructor with parens', async () => {
    const code = 'const x = new Date()\n'
    const cfg = configWith('style/new-parens')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/new-parens')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should not flag constructor with arguments', async () => {
    const code = 'const x = new Map([[1, 2]])\n'
    const cfg = configWith('style/new-parens')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/new-parens')
    expect(ruleIssues).toHaveLength(0)
  })
})
