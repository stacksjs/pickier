import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { ENV } from '../../src/utils'

describe('ENV configuration', () => {
  // Save original env values
  const originals: Record<string, string | undefined> = {}
  const envKeys = [
    'PICKIER_TRACE',
    'PICKIER_TIMEOUT_MS',
    'PICKIER_RULE_TIMEOUT_MS',
    'PICKIER_CONCURRENCY',
    'PICKIER_DIAGNOSTICS',
    'PICKIER_FAIL_ON_WARNINGS',
    'PICKIER_NO_AUTO_CONFIG',
  ]

  beforeEach(() => {
    for (const key of envKeys) {
      originals[key] = process.env[key]
    }
  })

  afterEach(() => {
    for (const key of envKeys) {
      if (originals[key] === undefined) {
        delete process.env[key]
      }
      else {
        process.env[key] = originals[key]
      }
    }
  })

  describe('TRACE', () => {
    it('returns false by default', () => {
      delete process.env.PICKIER_TRACE
      expect(ENV.TRACE).toBe(false)
    })

    it('returns true when set to "1"', () => {
      process.env.PICKIER_TRACE = '1'
      expect(ENV.TRACE).toBe(true)
    })

    it('returns false for non-"1" values', () => {
      process.env.PICKIER_TRACE = 'true'
      expect(ENV.TRACE).toBe(false)
      process.env.PICKIER_TRACE = '0'
      expect(ENV.TRACE).toBe(false)
    })
  })

  describe('TIMEOUT_MS', () => {
    it('defaults to 8000', () => {
      delete process.env.PICKIER_TIMEOUT_MS
      expect(ENV.TIMEOUT_MS).toBe(8000)
    })

    it('reads custom value', () => {
      process.env.PICKIER_TIMEOUT_MS = '15000'
      expect(ENV.TIMEOUT_MS).toBe(15000)
    })
  })

  describe('RULE_TIMEOUT_MS', () => {
    it('defaults to 5000', () => {
      delete process.env.PICKIER_RULE_TIMEOUT_MS
      expect(ENV.RULE_TIMEOUT_MS).toBe(5000)
    })

    it('reads custom value', () => {
      process.env.PICKIER_RULE_TIMEOUT_MS = '10000'
      expect(ENV.RULE_TIMEOUT_MS).toBe(10000)
    })
  })

  describe('CONCURRENCY', () => {
    it('defaults to 8', () => {
      delete process.env.PICKIER_CONCURRENCY
      expect(ENV.CONCURRENCY).toBe(8)
    })

    it('reads custom value', () => {
      process.env.PICKIER_CONCURRENCY = '16'
      expect(ENV.CONCURRENCY).toBe(16)
    })

    it('falls back to 8 for invalid value', () => {
      process.env.PICKIER_CONCURRENCY = 'abc'
      expect(ENV.CONCURRENCY).toBe(8)
    })
  })

  describe('DIAGNOSTICS', () => {
    it('returns false by default', () => {
      delete process.env.PICKIER_DIAGNOSTICS
      expect(ENV.DIAGNOSTICS).toBe(false)
    })

    it('returns true when set to "1"', () => {
      process.env.PICKIER_DIAGNOSTICS = '1'
      expect(ENV.DIAGNOSTICS).toBe(true)
    })
  })

  describe('FAIL_ON_WARNINGS', () => {
    it('returns false by default', () => {
      delete process.env.PICKIER_FAIL_ON_WARNINGS
      expect(ENV.FAIL_ON_WARNINGS).toBe(false)
    })

    it('returns true when set to "1"', () => {
      process.env.PICKIER_FAIL_ON_WARNINGS = '1'
      expect(ENV.FAIL_ON_WARNINGS).toBe(true)
    })
  })

  describe('NO_AUTO_CONFIG', () => {
    it('returns true when set to "1"', () => {
      process.env.PICKIER_NO_AUTO_CONFIG = '1'
      expect(ENV.NO_AUTO_CONFIG).toBe(true)
    })

    it('returns false when unset', () => {
      delete process.env.PICKIER_NO_AUTO_CONFIG
      expect(ENV.NO_AUTO_CONFIG).toBe(false)
    })
  })
})
