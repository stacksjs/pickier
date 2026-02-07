import { describe, expect, it } from 'bun:test'
import { lintText } from '../../../src/linter'
import { defaultConfig } from '../../../src/config'
import type { PickierConfig, RuleContext } from '../../../src/types'
import { linesBetweenClassMembersRule } from '../../../src/rules/style/lines-between-class-members'

function configWith(ruleId: string, severity: 'warn' | 'error' = 'warn'): PickierConfig {
  return {
    ...defaultConfig,
    rules: { noDebugger: 'off', noConsole: 'off' },
    pluginRules: { ...defaultConfig.pluginRules, [ruleId]: severity },
  }
}

const ctx: RuleContext = { filePath: 'test.ts', config: defaultConfig }

describe('style/lines-between-class-members', () => {
  it('should flag missing blank line between methods', async () => {
    const code = `class Foo {
  method1() {
    return 1
  }
  method2() {
    return 2
  }
}
`
    const cfg = configWith('style/lines-between-class-members')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/lines-between-class-members')
    expect(ruleIssues.length).toBeGreaterThan(0)
    expect(ruleIssues[0].message).toBe('Missing blank line between class members')
  })

  it('should not flag when blank line exists between methods', async () => {
    const code = `class Foo {
  method1() {
    return 1
  }

  method2() {
    return 2
  }
}
`
    const cfg = configWith('style/lines-between-class-members')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'style/lines-between-class-members')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should fix by adding blank line between methods', () => {
    const input = `class Foo {
  method1() {
    return 1
  }
  method2() {
    return 2
  }
}
`
    const result = linesBetweenClassMembersRule.fix!(input, ctx)
    // Should have blank line between the methods
    expect(result).toContain('}\n\n  method2')
  })
})
