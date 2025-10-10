import { describe, expect, it } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

describe('Test Fixtures with Real Pickier', () => {
  const fixturesDir = join(__dirname, 'fixtures')

  it('format-quotes.ts - detects quote style issues', async () => {
    const { lintText, defaultConfig } = await import('pickier')
    const code = readFileSync(join(fixturesDir, 'format-quotes.ts'), 'utf-8')

    const issues = await lintText(code, defaultConfig, 'format-quotes.ts')

    // Should detect quote style issues
    expect(issues.length).toBeGreaterThan(0)
    expect(issues.some(i => i.ruleId === 'quotes')).toBe(true)
  })

  it('format-indent.ts - detects indentation issues', async () => {
    const { lintText, defaultConfig } = await import('pickier')
    const code = readFileSync(join(fixturesDir, 'format-indent.ts'), 'utf-8')

    const issues = await lintText(code, defaultConfig, 'format-indent.ts')

    // Should detect indentation issues
    expect(issues.length).toBeGreaterThan(0)
    expect(issues.some(i => i.ruleId === 'indent')).toBe(true)
  })

  it('lint-debugger-console.ts - detects debugger and console', async () => {
    const { lintText, defaultConfig } = await import('pickier')
    const code = readFileSync(join(fixturesDir, 'lint-debugger-console.ts'), 'utf-8')

    const config = {
      ...defaultConfig,
      rules: { ...defaultConfig.rules, noDebugger: 'error' as const, noConsole: 'warn' as const },
    }
    const issues = await lintText(code, config, 'lint-debugger-console.ts')

    // Should detect both debugger and console issues
    expect(issues.length).toBeGreaterThan(0)
    expect(issues.some(i => i.ruleId === 'noDebugger')).toBe(true)
    expect(issues.some(i => i.ruleId === 'noConsole')).toBe(true)
  })

  it('lint-cond-assign.ts - detects assignment in conditionals', async () => {
    const { lintText, defaultConfig } = await import('pickier')
    const code = readFileSync(join(fixturesDir, 'lint-cond-assign.ts'), 'utf-8')

    const config = {
      ...defaultConfig,
      rules: { ...defaultConfig.rules, noCondAssign: 'error' as const },
    }
    const issues = await lintText(code, config, 'lint-cond-assign.ts')

    // Should detect assignment in conditions
    expect(issues.length).toBeGreaterThan(0)
    expect(issues.some(i => i.ruleId === 'noCondAssign')).toBe(true)
  })

  it('pickier-prefer-const.ts - detects let that should be const', async () => {
    const { lintText, defaultConfig } = await import('pickier')
    const code = readFileSync(join(fixturesDir, 'pickier-prefer-const.ts'), 'utf-8')

    const config = {
      ...defaultConfig,
      pluginRules: { ...defaultConfig.pluginRules, 'pickier/prefer-const': 'warn' },
    }
    const issues = await lintText(code, config, 'pickier-prefer-const.ts')

    // Should detect prefer-const issues
    expect(issues.length).toBeGreaterThan(0)
    // The rule ID might be 'pickier/prefer-const' or just 'prefer-const'
    expect(issues.some(i => i.ruleId?.includes('prefer-const'))).toBe(true)
  })

  it('pickier-import-dedupe.ts - detects duplicate imports', async () => {
    const { lintText, defaultConfig } = await import('pickier')
    const code = readFileSync(join(fixturesDir, 'pickier-import-dedupe.ts'), 'utf-8')

    const config = {
      ...defaultConfig,
      pluginRules: { ...defaultConfig.pluginRules, 'pickier/import-dedupe': 'warn' },
    }
    const issues = await lintText(code, config, 'pickier-import-dedupe.ts')

    // Should detect import deduplication issues
    expect(issues.length).toBeGreaterThan(0)
    expect(issues.some(i => i.ruleId?.includes('import-dedupe'))).toBe(true)
  })

  it('pickier-import-paths.ts - detects bad import paths', async () => {
    const { lintText, defaultConfig } = await import('pickier')
    const code = readFileSync(join(fixturesDir, 'pickier-import-paths.ts'), 'utf-8')

    const config = {
      ...defaultConfig,
      pluginRules: {
        ...defaultConfig.pluginRules,
        'pickier/no-import-node-modules-by-path': 'error',
        'pickier/no-import-dist': 'error',
      },
    }
    const issues = await lintText(code, config, 'pickier-import-paths.ts')

    // Should detect bad import paths
    expect(issues.length).toBeGreaterThan(0)
    expect(
      issues.some(i =>
        i.ruleId?.includes('no-import-node-modules-by-path') || i.ruleId?.includes('no-import-dist')
      )
    ).toBe(true)
  })

  it('style-curly.ts - detects missing braces', async () => {
    const { lintText, defaultConfig } = await import('pickier')
    const code = readFileSync(join(fixturesDir, 'style-curly.ts'), 'utf-8')

    const config = {
      ...defaultConfig,
      pluginRules: { ...defaultConfig.pluginRules, 'style/curly': 'warn' },
    }
    const issues = await lintText(code, config, 'style-curly.ts')

    // Should detect curly brace issues
    expect(issues.length).toBeGreaterThan(0)
    expect(issues.some(i => i.ruleId?.includes('curly'))).toBe(true)
  })

  it('style-if-newline.ts - detects inconsistent if-else formatting', async () => {
    const { lintText, defaultConfig } = await import('pickier')
    const code = readFileSync(join(fixturesDir, 'style-if-newline.ts'), 'utf-8')

    const config = {
      ...defaultConfig,
      pluginRules: { ...defaultConfig.pluginRules, 'style/if-newline': 'warn' },
    }
    const issues = await lintText(code, config, 'style-if-newline.ts')

    // Should detect if-newline issues
    expect(issues.length).toBeGreaterThan(0)
    expect(issues.some(i => i.ruleId?.includes('if-newline'))).toBe(true)
  })

  it('ts-no-require.ts - detects CommonJS require', async () => {
    const { lintText, defaultConfig } = await import('pickier')
    const code = readFileSync(join(fixturesDir, 'ts-no-require.ts'), 'utf-8')

    const config = {
      ...defaultConfig,
      pluginRules: { ...defaultConfig.pluginRules, 'ts/no-require-imports': 'error' },
    }
    const issues = await lintText(code, config, 'ts-no-require.ts')

    // Should detect require imports
    expect(issues.length).toBeGreaterThan(0)
    expect(issues.some(i => i.ruleId?.includes('no-require-imports'))).toBe(true)
  })

  it('ts-no-top-level-await.ts - detects top-level await', async () => {
    const { lintText, defaultConfig } = await import('pickier')
    const code = readFileSync(join(fixturesDir, 'ts-no-top-level-await.ts'), 'utf-8')

    const config = {
      ...defaultConfig,
      pluginRules: { ...defaultConfig.pluginRules, 'ts/no-top-level-await': 'error' },
    }
    const issues = await lintText(code, config, 'ts-no-top-level-await.ts')

    // Should detect top-level await
    expect(issues.length).toBeGreaterThan(0)
    expect(issues.some(i => i.ruleId?.includes('no-top-level-await'))).toBe(true)
  })

  it('formatCode fixes issues in fixtures', async () => {
    const { formatCode, defaultConfig } = await import('pickier')
    const code = readFileSync(join(fixturesDir, 'format-quotes.ts'), 'utf-8')

    // formatCode should fix quote issues
    const formatted = formatCode(code, defaultConfig, 'format-quotes.ts')

    // After formatting, should have consistent quotes
    expect(formatted).not.toBe(code)
    // Should convert double quotes to single
    expect(formatted).toContain("'Hello World'")
  })
})
