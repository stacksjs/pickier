import { describe, expect, it } from 'bun:test'
import { lintText } from '../../../src/linter'
import { defaultConfig } from '../../../src/config'
import type { PickierConfig, RuleContext } from '../../../src/types'
import { memberDelimiterStyleRule } from '../../../src/rules/ts/member-delimiter-style'
import { typeAnnotationSpacingRule } from '../../../src/rules/ts/type-annotation-spacing'

function configWith(ruleId: string, severity: 'warn' | 'error' = 'warn'): PickierConfig {
  return {
    ...defaultConfig,
    rules: { noDebugger: 'off', noConsole: 'off' },
    pluginRules: { ...defaultConfig.pluginRules, [ruleId]: severity },
  }
}

const ctx: RuleContext = { filePath: 'test.ts', config: defaultConfig }

describe('ts/member-delimiter-style', () => {
  it('should flag comma delimiter in interface', async () => {
    const code = `interface Foo {
  name: string,
  age: number,
}
`
    const cfg = configWith('ts/member-delimiter-style')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'ts/member-delimiter-style')
    expect(ruleIssues.length).toBeGreaterThan(0)
    expect(ruleIssues[0].message).toContain('Expected semicolon')
  })

  it('should not flag semicolon delimiter in interface', async () => {
    const code = `interface Foo {
  name: string;
  age: number;
}
`
    const cfg = configWith('ts/member-delimiter-style')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'ts/member-delimiter-style')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should flag missing delimiter in interface', async () => {
    const code = `interface Foo {
  name: string
  age: number
}
`
    const cfg = configWith('ts/member-delimiter-style')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'ts/member-delimiter-style')
    expect(ruleIssues.length).toBeGreaterThan(0)
    expect(ruleIssues[0].message).toContain('Missing semicolon')
  })

  it('should not flag non-interface code', async () => {
    const code = 'const obj = { name: "test", age: 25 }\n'
    const cfg = configWith('ts/member-delimiter-style')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'ts/member-delimiter-style')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should fix comma to semicolon in interface', () => {
    const input = `interface Foo {
  name: string,
  age: number,
}
`
    const result = memberDelimiterStyleRule.fix!(input, ctx)
    expect(result).toContain('name: string;')
    expect(result).toContain('age: number;')
    expect(result).not.toContain('string,')
  })

  it('should handle type alias with block', async () => {
    const code = `type Bar = {
  x: number,
  y: number,
}
`
    const cfg = configWith('ts/member-delimiter-style')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'ts/member-delimiter-style')
    expect(ruleIssues.length).toBeGreaterThan(0)
  })
})

describe('ts/type-annotation-spacing', () => {
  it('should flag missing space after colon in type annotation', async () => {
    const code = 'const x:string = "hello"\n'
    const cfg = configWith('ts/type-annotation-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'ts/type-annotation-spacing')
    expect(ruleIssues.length).toBeGreaterThan(0)
    expect(ruleIssues[0].message).toContain('Missing space after colon')
  })

  it('should not flag properly spaced type annotation', async () => {
    const code = 'const x: string = "hello"\n'
    const cfg = configWith('ts/type-annotation-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'ts/type-annotation-spacing')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should handle optional type annotations', async () => {
    const code = 'function foo(x?: string) {}\n'
    const cfg = configWith('ts/type-annotation-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'ts/type-annotation-spacing')
    expect(ruleIssues).toHaveLength(0)
  })

  it('should fix missing space', () => {
    const input = 'const x:string = "hello"\n'
    const result = typeAnnotationSpacingRule.fix!(input, ctx)
    expect(result).toContain('x: string')
  })

  it('should handle function parameter types', () => {
    const input = 'function foo(x:number, y:string) {}\n'
    const result = typeAnnotationSpacingRule.fix!(input, ctx)
    expect(result).toContain('x: number')
    expect(result).toContain('y: string')
  })

  it('should handle return type annotation', async () => {
    const code = 'function foo(): string { return "" }\n'
    const cfg = configWith('ts/type-annotation-spacing')
    const issues = await lintText(code, cfg, 'test.ts')
    const ruleIssues = issues.filter(i => i.ruleId === 'ts/type-annotation-spacing')
    expect(ruleIssues).toHaveLength(0)
  })
})
