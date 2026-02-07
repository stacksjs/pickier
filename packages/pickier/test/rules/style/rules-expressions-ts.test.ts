import { describe, expect, it } from 'bun:test'
import { lintText } from '../../../src/linter'
import { defaultConfig } from '../../../src/config'
import type { PickierConfig, RuleContext } from '../../../src/types'
import { noMixedOperatorsRule } from '../../../src/rules/style/no-mixed-operators'
import { indentBinaryOpsRule } from '../../../src/rules/style/indent-binary-ops'
import { typeGenericSpacingRule } from '../../../src/rules/ts/type-generic-spacing'
import { typeNamedTupleSpacingRule } from '../../../src/rules/ts/type-named-tuple-spacing'

function configWith(ruleId: string, severity: 'warn' | 'error' = 'warn'): PickierConfig {
  return {
    ...defaultConfig,
    rules: { noDebugger: 'off', noConsole: 'off' },
    pluginRules: { ...defaultConfig.pluginRules, [ruleId]: severity },
  }
}

const ctx: RuleContext = { filePath: 'test.ts', config: defaultConfig }

// ---------------------------------------------------------------------------
// style/no-mixed-operators
// ---------------------------------------------------------------------------
describe('style/no-mixed-operators', () => {
  it('should flag mixed && and || without parentheses', async () => {
    const cfg = configWith('style/no-mixed-operators')
    const issues = await lintText('const x = a && b || c\n', cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/no-mixed-operators')
    expect(ruleIssues.length).toBeGreaterThan(0)
    expect(ruleIssues.some(i => i.message.includes('&&') && i.message.includes('||'))).toBe(true)
  })

  it('should not flag parenthesized mixed operators', async () => {
    const cfg = configWith('style/no-mixed-operators')
    const issues = await lintText('const x = (a && b) || c\n', cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/no-mixed-operators')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should not flag same operator repeated (&&)', async () => {
    const cfg = configWith('style/no-mixed-operators')
    const issues = await lintText('const x = a && b && c\n', cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/no-mixed-operators')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should not flag same operator repeated (||)', async () => {
    const cfg = configWith('style/no-mixed-operators')
    const issues = await lintText('const x = a || b || c\n', cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/no-mixed-operators')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should have no fixer', () => {
    expect(noMixedOperatorsRule.fix).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// style/indent-binary-ops
// ---------------------------------------------------------------------------
describe('style/indent-binary-ops', () => {
  it('should flag wrong indentation for binary operator continuation line', async () => {
    const cfg = configWith('style/indent-binary-ops')
    const code = 'const x = a\n&& b\n'
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/indent-binary-ops')
    expect(ruleIssues.length).toBeGreaterThan(0)
    expect(ruleIssues[0].message).toContain('2')
    expect(ruleIssues[0].message).toContain('0')
  })

  it('should not flag correctly indented binary operator continuation', async () => {
    const cfg = configWith('style/indent-binary-ops')
    const code = 'const x = a\n  && b\n'
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/indent-binary-ops')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should fix indentation for binary operator continuation line', () => {
    const code = 'const x = a\n&& b\n'
    const result = indentBinaryOpsRule.fix!(code, ctx)
    expect(result).toBe('const x = a\n  && b\n')
  })

  it('should not change already correct indentation', () => {
    const code = 'const x = a\n  && b\n'
    const result = indentBinaryOpsRule.fix!(code, ctx)
    expect(result).toBe(code)
  })
})

// ---------------------------------------------------------------------------
// ts/type-generic-spacing
// ---------------------------------------------------------------------------
describe('ts/type-generic-spacing', () => {
  it('should flag spaces inside generic angle brackets', async () => {
    const cfg = configWith('ts/type-generic-spacing')
    const code = 'const x: Array< string > = []\n'
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'ts/type-generic-spacing')
    expect(ruleIssues.length).toBeGreaterThan(0)
  })

  it('should not flag generic without spaces', async () => {
    const cfg = configWith('ts/type-generic-spacing')
    const code = 'const x: Array<string> = []\n'
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'ts/type-generic-spacing')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should not flag arrow function (=> is not generic close)', async () => {
    const cfg = configWith('ts/type-generic-spacing')
    const code = 'const fn = (a: number) => b\n'
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'ts/type-generic-spacing')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should fix spaces inside generic angle brackets', () => {
    const code = 'const x: Array< string > = []\n'
    const result = typeGenericSpacingRule.fix!(code, ctx)
    expect(result).toContain('Array<string>')
    expect(result).not.toContain('< ')
    expect(result).not.toContain(' >')
  })
})

// ---------------------------------------------------------------------------
// ts/type-named-tuple-spacing
// ---------------------------------------------------------------------------
describe('ts/type-named-tuple-spacing', () => {
  it('should flag missing space after colon in named tuple', async () => {
    const cfg = configWith('ts/type-named-tuple-spacing')
    const code = 'type T = [name:string]\n'
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'ts/type-named-tuple-spacing')
    expect(ruleIssues.length).toBeGreaterThan(0)
    expect(ruleIssues[0].message).toContain('space after colon')
  })

  it('should not flag correctly spaced named tuple', async () => {
    const cfg = configWith('ts/type-named-tuple-spacing')
    const code = 'type T = [name: string]\n'
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'ts/type-named-tuple-spacing')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should not flag non-type context array literal', async () => {
    const cfg = configWith('ts/type-named-tuple-spacing')
    const code = 'const arr = [1, 2, 3]\n'
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'ts/type-named-tuple-spacing')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should fix missing space after colon in named tuple', () => {
    const code = 'type T = [name:string]\n'
    const result = typeNamedTupleSpacingRule.fix!(code, ctx)
    expect(result).toContain('[name: string]')
  })
})
