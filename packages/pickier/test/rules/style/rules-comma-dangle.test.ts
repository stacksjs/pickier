import { describe, expect, it } from 'bun:test'
import { lintText } from '../../../src/linter'
import { defaultConfig } from '../../../src/config'
import type { PickierConfig, RuleContext } from '../../../src/types'
import { commaDangleRule } from '../../../src/rules/style/comma-dangle'

function configWith(ruleId: string, severity: 'warn' | 'error' = 'warn'): PickierConfig {
  return {
    ...defaultConfig,
    rules: { noDebugger: 'off', noConsole: 'off' },
    pluginRules: { ...defaultConfig.pluginRules, [ruleId]: severity },
  }
}

const ctx: RuleContext = { filePath: 'test.ts', config: defaultConfig }

describe('style/comma-dangle', () => {
  it('should flag missing trailing comma in multiline object', async () => {
    const code = `const obj = {\n  a: 1,\n  b: 2\n}\n`
    const cfg = configWith('style/comma-dangle')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/comma-dangle')
    expect(ruleIssues.length).toBeGreaterThan(0)
    expect(ruleIssues[0].message).toBe('Missing trailing comma')
  })

  it('should flag missing trailing comma in multiline array', async () => {
    const code = `const arr = [\n  1,\n  2\n]\n`
    const cfg = configWith('style/comma-dangle')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/comma-dangle')
    expect(ruleIssues.length).toBeGreaterThan(0)
  })

  it('should flag missing trailing comma in multiline tuple/params', async () => {
    const code = `const x = [\n  a,\n  b\n]\n`
    const cfg = configWith('style/comma-dangle')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/comma-dangle')
    expect(ruleIssues.length).toBeGreaterThan(0)
  })

  it('should not flag when trailing comma present', async () => {
    const code = `const obj = {\n  a: 1,\n  b: 2,\n}\n`
    const cfg = configWith('style/comma-dangle')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/comma-dangle')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should not flag single-line constructs', async () => {
    const code = `const obj = { a: 1, b: 2 }\n`
    const cfg = configWith('style/comma-dangle')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/comma-dangle')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should not flag empty objects', async () => {
    const code = `const obj = {\n}\n`
    const cfg = configWith('style/comma-dangle')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/comma-dangle')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should skip comment lines before closing bracket', async () => {
    const code = `const obj = {\n  a: 1,\n  // comment\n}\n`
    const cfg = configWith('style/comma-dangle')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/comma-dangle')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should fix missing trailing comma', () => {
    const input = `const obj = {\n  a: 1,\n  b: 2\n}\n`
    const result = commaDangleRule.fix!(input, ctx)
    expect(result).toContain('b: 2,')
  })

  it('should not add duplicate trailing comma', () => {
    const input = `const obj = {\n  a: 1,\n  b: 2,\n}\n`
    const result = commaDangleRule.fix!(input, ctx)
    expect(result).toBe(input)
  })
})
