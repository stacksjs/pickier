import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { defaultConfig } from '../../src/config'
import { loadConfigFromPath, mergeConfig } from '../../src/utils'

process.env.PICKIER_NO_AUTO_CONFIG = '1'

describe('mergeConfig', () => {
  it('returns base config when override is empty', () => {
    const result = mergeConfig(defaultConfig, {})
    expect(result.format.indent).toBe(defaultConfig.format.indent)
    expect(result.format.quotes).toBe(defaultConfig.format.quotes)
    expect(result.lint.reporter).toBe(defaultConfig.lint.reporter)
  })

  it('overrides top-level fields', () => {
    const result = mergeConfig(defaultConfig, { verbose: true })
    expect(result.verbose).toBe(true)
  })

  it('deep-merges lint config', () => {
    const result = mergeConfig(defaultConfig, {
      lint: { reporter: 'json' } as any,
    })
    // Overridden field
    expect(result.lint.reporter).toBe('json')
    // Preserved field from base
    expect(result.lint.extensions).toEqual(defaultConfig.lint.extensions)
  })

  it('deep-merges format config', () => {
    const result = mergeConfig(defaultConfig, {
      format: { indent: 4, quotes: 'double' } as any,
    })
    expect(result.format.indent).toBe(4)
    expect(result.format.quotes).toBe('double')
    // Preserved fields
    expect(result.format.trimTrailingWhitespace).toBe(true)
    expect(result.format.semi).toBe(false)
  })

  it('deep-merges rules config', () => {
    const result = mergeConfig(defaultConfig, {
      rules: { noConsole: 'off' } as any,
    })
    expect(result.rules.noConsole).toBe('off')
    // Base rule preserved
    expect(result.rules.noDebugger).toBe('error')
  })

  it('deep-merges pluginRules config', () => {
    const result = mergeConfig(defaultConfig, {
      pluginRules: { 'custom/rule': 'error' },
    } as any)
    expect((result.pluginRules as any)['custom/rule']).toBe('error')
  })

  it('override ignores replaces base ignores', () => {
    const result = mergeConfig(defaultConfig, {
      ignores: ['custom/**'],
    })
    // Spread operator replaces array, not merges
    expect(result.ignores).toEqual(['custom/**'])
  })

  it('does not mutate the base config', () => {
    const baseCopy = JSON.parse(JSON.stringify(defaultConfig))
    mergeConfig(defaultConfig, { verbose: true, format: { indent: 8 } as any })
    expect(defaultConfig.verbose).toBe(baseCopy.verbose)
    expect(defaultConfig.format.indent).toBe(baseCopy.format.indent)
  })
})

describe('loadConfigFromPath', () => {
  let dir: string

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'pickier-cfg-'))
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it('returns default config when no path is given and NO_AUTO_CONFIG=1', async () => {
    const cfg = await loadConfigFromPath(undefined)
    expect(cfg.format.indent).toBe(defaultConfig.format.indent)
    expect(cfg.format.quotes).toBe(defaultConfig.format.quotes)
    expect(cfg.lint.reporter).toBe(defaultConfig.lint.reporter)
  })

  it('caches default config on repeated calls', async () => {
    const cfg1 = await loadConfigFromPath(undefined)
    const cfg2 = await loadConfigFromPath(undefined)
    // Should be the same cached reference
    expect(cfg1).toBe(cfg2)
  })

  it('loads JSON config file', async () => {
    const configFile = join(dir, 'pickier.config.json')
    writeFileSync(configFile, JSON.stringify({
      format: { indent: 4, quotes: 'double' },
      lint: { reporter: 'compact' },
    }), 'utf8')

    const cfg = await loadConfigFromPath(configFile)
    expect(cfg.format.indent).toBe(4)
    expect(cfg.format.quotes).toBe('double')
    expect(cfg.lint.reporter).toBe('compact')
    // Preserved defaults
    expect(cfg.format.semi).toBe(false)
    expect(cfg.format.trimTrailingWhitespace).toBe(true)
  })

  it('loads TypeScript config file', async () => {
    const configFile = join(dir, 'pickier.config.ts')
    writeFileSync(configFile, `
export default {
  format: { indent: 8 },
}
`, 'utf8')

    const cfg = await loadConfigFromPath(configFile)
    expect(cfg.format.indent).toBe(8)
    // Preserved defaults
    expect(cfg.format.quotes).toBe(defaultConfig.format.quotes)
  })

  it('resolves relative config paths', async () => {
    const configFile = join(dir, 'custom.json')
    writeFileSync(configFile, JSON.stringify({
      verbose: true,
    }), 'utf8')

    // Use absolute path since relative would resolve from cwd
    const cfg = await loadConfigFromPath(configFile)
    expect(cfg.verbose).toBe(true)
  })

  it('merges with defaults when loading JSON', async () => {
    const configFile = join(dir, 'partial.json')
    writeFileSync(configFile, JSON.stringify({
      format: { indent: 3 },
    }), 'utf8')

    const cfg = await loadConfigFromPath(configFile)
    // Custom value
    expect(cfg.format.indent).toBe(3)
    // All defaults preserved
    expect(cfg.format.quotes).toBe(defaultConfig.format.quotes)
    expect(cfg.format.semi).toBe(defaultConfig.format.semi)
    expect(cfg.lint.extensions).toEqual(defaultConfig.lint.extensions)
    expect(cfg.rules.noDebugger).toBe(defaultConfig.rules.noDebugger)
  })

  it('handles config with pluginRules', async () => {
    const configFile = join(dir, 'plugins.json')
    writeFileSync(configFile, JSON.stringify({
      pluginRules: {
        'markdown/heading-increment': 'off',
        'custom/my-rule': 'error',
      },
    }), 'utf8')

    const cfg = await loadConfigFromPath(configFile)
    expect((cfg.pluginRules as any)['markdown/heading-increment']).toBe('off')
    expect((cfg.pluginRules as any)['custom/my-rule']).toBe('error')
  })

  it('handles config with array rule severity', async () => {
    const configFile = join(dir, 'array-rules.json')
    writeFileSync(configFile, JSON.stringify({
      pluginRules: {
        'lockfile/validate-host': ['warn', { allowedHosts: ['npm'] }],
      },
    }), 'utf8')

    const cfg = await loadConfigFromPath(configFile)
    const rule = (cfg.pluginRules as any)['lockfile/validate-host']
    expect(Array.isArray(rule)).toBe(true)
    expect(rule[0]).toBe('warn')
    expect(rule[1].allowedHosts).toEqual(['npm'])
  })
})
