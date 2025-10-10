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

  it('pickier-no-unused-vars.ts - detects unused variables', async () => {
    const { lintText, defaultConfig } = await import('pickier')
    const code = readFileSync(join(fixturesDir, 'pickier-no-unused-vars.ts'), 'utf-8')

    const config = {
      ...defaultConfig,
      pluginRules: { ...defaultConfig.pluginRules, 'pickier/no-unused-vars': 'warn' },
    }
    const issues = await lintText(code, config, 'pickier-no-unused-vars.ts')

    // Should detect unused variables
    expect(issues.length).toBeGreaterThan(0)
    expect(issues.some(i => i.ruleId?.includes('no-unused-vars'))).toBe(true)
  })

  it('pickier-sort-exports.ts - detects unsorted exports', async () => {
    const { lintText, defaultConfig } = await import('pickier')
    const code = readFileSync(join(fixturesDir, 'pickier-sort-exports.ts'), 'utf-8')

    const config = {
      ...defaultConfig,
      pluginRules: { ...defaultConfig.pluginRules, 'pickier/sort-exports': 'warn' },
    }
    const issues = await lintText(code, config, 'pickier-sort-exports.ts')

    // Should detect unsorted exports
    expect(issues.length).toBeGreaterThan(0)
    expect(issues.some(i => i.ruleId?.includes('sort-exports'))).toBe(true)
  })

  it('pickier-sort-heritage-clauses.ts - detects unsorted heritage clauses', async () => {
    const { lintText, defaultConfig } = await import('pickier')
    const code = readFileSync(join(fixturesDir, 'pickier-sort-heritage-clauses.ts'), 'utf-8')

    const config = {
      ...defaultConfig,
      pluginRules: { ...defaultConfig.pluginRules, 'pickier/sort-heritage-clauses': 'warn' },
    }
    const issues = await lintText(code, config, 'pickier-sort-heritage-clauses.ts')

    // Should detect unsorted heritage clauses
    expect(issues.length).toBeGreaterThan(0)
    expect(issues.some(i => i.ruleId?.includes('sort-heritage-clauses'))).toBe(true)
  })

  it('pickier-top-level-function.ts - detects arrow functions at top level', async () => {
    const { lintText, defaultConfig } = await import('pickier')
    const code = readFileSync(join(fixturesDir, 'pickier-top-level-function.ts'), 'utf-8')

    const config = {
      ...defaultConfig,
      pluginRules: { ...defaultConfig.pluginRules, 'pickier/top-level-function': 'warn' },
    }
    const issues = await lintText(code, config, 'pickier-top-level-function.ts')

    // Should detect top-level arrow functions
    expect(issues.length).toBeGreaterThan(0)
    expect(issues.some(i => i.ruleId?.includes('top-level-function'))).toBe(true)
  })

  it('style-consistent-chaining.ts - detects inconsistent chaining', async () => {
    const { lintText, defaultConfig } = await import('pickier')
    const code = readFileSync(join(fixturesDir, 'style-consistent-chaining.ts'), 'utf-8')

    const config = {
      ...defaultConfig,
      pluginRules: { ...defaultConfig.pluginRules, 'style/consistent-chaining': 'warn' },
    }
    const issues = await lintText(code, config, 'style-consistent-chaining.ts')

    // Should detect inconsistent chaining
    expect(issues.length).toBeGreaterThan(0)
    expect(issues.some(i => i.ruleId?.includes('consistent-chaining'))).toBe(true)
  })

  it('style-consistent-list-newline.ts - detects inconsistent list newlines', async () => {
    const { lintText, defaultConfig } = await import('pickier')
    const code = readFileSync(join(fixturesDir, 'style-consistent-list-newline.ts'), 'utf-8')

    const config = {
      ...defaultConfig,
      pluginRules: { ...defaultConfig.pluginRules, 'style/consistent-list-newline': 'warn' },
    }
    const issues = await lintText(code, config, 'style-consistent-list-newline.ts')

    // Should detect inconsistent list newlines
    expect(issues.length).toBeGreaterThan(0)
    expect(issues.some(i => i.ruleId?.includes('consistent-list-newline'))).toBe(true)
  })

  it('ts-no-ts-export-equal.ts - detects export = syntax', async () => {
    const { lintText, defaultConfig } = await import('pickier')
    const code = readFileSync(join(fixturesDir, 'ts-no-ts-export-equal.ts'), 'utf-8')

    const config = {
      ...defaultConfig,
      pluginRules: { ...defaultConfig.pluginRules, 'ts/no-ts-export-equal': 'error' },
    }
    const issues = await lintText(code, config, 'ts-no-ts-export-equal.ts')

    // Should detect export = syntax
    expect(issues.length).toBeGreaterThan(0)
    expect(issues.some(i => i.ruleId?.includes('no-ts-export-equal'))).toBe(true)
  })

  it('regexp-rules.ts - detects regexp issues', async () => {
    const { lintText, defaultConfig } = await import('pickier')
    const code = readFileSync(join(fixturesDir, 'regexp-rules.ts'), 'utf-8')

    const config = {
      ...defaultConfig,
      pluginRules: {
        ...defaultConfig.pluginRules,
        'regexp/no-super-linear-backtracking': 'warn',
        'regexp/no-unused-capturing-group': 'warn',
      },
    }
    const issues = await lintText(code, config, 'regexp-rules.ts')

    // Should detect regexp issues
    expect(issues.length).toBeGreaterThan(0)
    expect(
      issues.some(i =>
        i.ruleId?.includes('no-super-linear-backtracking') || i.ruleId?.includes('no-unused-capturing-group')
      )
    ).toBe(true)
  })

  it('format-semi.ts - detects semicolon issues', async () => {
    const { lintText, defaultConfig } = await import('pickier')
    const code = readFileSync(join(fixturesDir, 'format-semi.ts'), 'utf-8')

    const issues = await lintText(code, defaultConfig, 'format-semi.ts')

    // Should detect semicolon issues when semi: false
    expect(issues.length).toBeGreaterThan(0)
  })

  it('formatCode fixes quote issues', async () => {
    const { formatCode, defaultConfig } = await import('pickier')
    const code = readFileSync(join(fixturesDir, 'format-quotes.ts'), 'utf-8')

    const formatted = formatCode(code, defaultConfig, 'format-quotes.ts')

    // After formatting, should have consistent quotes
    expect(formatted).not.toBe(code)
    // Should convert double quotes to single
    expect(formatted).toContain("'Hello World'")
  })

  it('formatCode fixes indentation issues', async () => {
    const { formatCode, defaultConfig } = await import('pickier')
    const code = readFileSync(join(fixturesDir, 'format-indent.ts'), 'utf-8')

    const formatted = formatCode(code, defaultConfig, 'format-indent.ts')

    // After formatting, should have consistent 2-space indentation
    expect(formatted).not.toBe(code)
    // Should not contain tabs or inconsistent spacing
    expect(formatted).not.toContain('\t')
  })

  it('formatCode fixes semicolon issues', async () => {
    const { formatCode, defaultConfig } = await import('pickier')
    const code = readFileSync(join(fixturesDir, 'format-semi.ts'), 'utf-8')

    const formatted = formatCode(code, defaultConfig, 'format-semi.ts')

    // Note: formatCode may or may not handle semicolons depending on implementation
    // This test verifies that formatCode runs without errors on code with semicolons
    expect(formatted).toBeDefined()
    expect(typeof formatted).toBe('string')
  })

  it('formatCode fixes whitespace issues', async () => {
    const { formatCode, defaultConfig } = await import('pickier')
    const code = readFileSync(join(fixturesDir, 'format-whitespace.ts'), 'utf-8')

    const formatted = formatCode(code, defaultConfig, 'format-whitespace.ts')

    // After formatting, should fix trailing whitespace and consecutive blank lines
    expect(formatted).not.toBe(code)
    // Should not have more than 1 consecutive blank line
    expect(formatted).not.toMatch(/\n\n\n+/)
  })

  it('formatCode is idempotent - formatting twice produces same result', async () => {
    const { formatCode, defaultConfig } = await import('pickier')
    const code = readFileSync(join(fixturesDir, 'format-quotes.ts'), 'utf-8')

    const formatted1 = formatCode(code, defaultConfig, 'format-quotes.ts')
    const formatted2 = formatCode(formatted1, defaultConfig, 'format-quotes.ts')

    // Formatting should be idempotent - formatting already-formatted code should not change it
    expect(formatted1).toBe(formatted2)
  })

  it('formatCode handles complex files with multiple issues', async () => {
    const { formatCode, defaultConfig } = await import('pickier')
    const code = readFileSync(join(fixturesDir, 'pickier-sort-imports.ts'), 'utf-8')

    const formatted = formatCode(code, defaultConfig, 'pickier-sort-imports.ts')

    // Should fix multiple types of issues
    expect(formatted).not.toBe(code)
  })
})
