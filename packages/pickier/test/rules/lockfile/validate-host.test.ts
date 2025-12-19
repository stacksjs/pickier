import { describe, expect, test } from 'bun:test'
import { validateHost } from '../../../src/rules/lockfile/validate-host'
import type { RuleContext } from '../../../src/types'

const createContext = (filePath: string, options?: unknown): RuleContext => ({
  filePath,
  config: {} as any,
  options,
})

describe('lockfile/validate-host', () => {
  describe('npm lockfile', () => {
    test('allows packages from npm registry', () => {
      const lockfile = JSON.stringify({
        lockfileVersion: 2,
        packages: {
          'node_modules/lodash': {
            version: '4.17.21',
            resolved: 'https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz',
            integrity: 'sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+LFTGHVxVjcXPs17LhbZVGedAJv8XZ1tvj5FvSg==',
          },
        },
      })

      const issues = validateHost.check(lockfile, createContext('package-lock.json', { allowedHosts: ['npm'] }))
      expect(issues).toHaveLength(0)
    })

    test('allows packages from yarn registry', () => {
      const lockfile = JSON.stringify({
        lockfileVersion: 2,
        packages: {
          'node_modules/lodash': {
            version: '4.17.21',
            resolved: 'https://registry.yarnpkg.com/lodash/-/lodash-4.17.21.tgz',
            integrity: 'sha512-abc==',
          },
        },
      })

      const issues = validateHost.check(lockfile, createContext('package-lock.json', { allowedHosts: ['yarn'] }))
      expect(issues).toHaveLength(0)
    })

    test('detects packages from unauthorized hosts', () => {
      const lockfile = JSON.stringify({
        lockfileVersion: 2,
        packages: {
          'node_modules/malicious': {
            version: '1.0.0',
            resolved: 'https://evil.attacker.com/malicious/-/malicious-1.0.0.tgz',
            integrity: 'sha512-abc==',
          },
        },
      })

      const issues = validateHost.check(lockfile, createContext('package-lock.json', { allowedHosts: ['npm', 'yarn'] }))
      expect(issues).toHaveLength(1)
      expect(issues[0].ruleId).toBe('lockfile/validate-host')
      expect(issues[0].message).toContain('evil.attacker.com')
      expect(issues[0].severity).toBe('error')
    })

    test('allows custom registry hosts', () => {
      const lockfile = JSON.stringify({
        lockfileVersion: 2,
        packages: {
          'node_modules/private-pkg': {
            version: '1.0.0',
            resolved: 'https://private.registry.company.com/private-pkg/-/private-pkg-1.0.0.tgz',
            integrity: 'sha512-abc==',
          },
        },
      })

      const issues = validateHost.check(lockfile, createContext('package-lock.json', {
        allowedHosts: ['npm', 'private.registry.company.com'],
      }))
      expect(issues).toHaveLength(0)
    })

    test('handles multiple packages with mixed hosts', () => {
      const lockfile = JSON.stringify({
        lockfileVersion: 2,
        packages: {
          'node_modules/good-pkg': {
            version: '1.0.0',
            resolved: 'https://registry.npmjs.org/good-pkg/-/good-pkg-1.0.0.tgz',
            integrity: 'sha512-abc==',
          },
          'node_modules/bad-pkg': {
            version: '1.0.0',
            resolved: 'https://malicious.com/bad-pkg/-/bad-pkg-1.0.0.tgz',
            integrity: 'sha512-def==',
          },
        },
      })

      const issues = validateHost.check(lockfile, createContext('package-lock.json', { allowedHosts: ['npm'] }))
      expect(issues).toHaveLength(1)
      expect(issues[0].message).toContain('bad-pkg')
    })

    test('skips packages without resolved URL by default', () => {
      const lockfile = JSON.stringify({
        lockfileVersion: 2,
        packages: {
          'node_modules/local-pkg': {
            version: '1.0.0',
          },
        },
      })

      const issues = validateHost.check(lockfile, createContext('package-lock.json', { allowedHosts: ['npm'] }))
      expect(issues).toHaveLength(0)
    })

    test('reports packages without resolved URL when emptyHostname is false', () => {
      const lockfile = JSON.stringify({
        lockfileVersion: 2,
        packages: {
          'node_modules/local-pkg': {
            version: '1.0.0',
          },
        },
      })

      const issues = validateHost.check(lockfile, createContext('package-lock.json', {
        allowedHosts: ['npm'],
        emptyHostname: false,
      }))
      expect(issues).toHaveLength(1)
      expect(issues[0].message).toContain('no resolved URL')
    })
  })

  describe('yarn lockfile', () => {
    test('allows packages from yarn registry', () => {
      const lockfile = `# yarn lockfile v1

"lodash@^4.17.0":
  version "4.17.21"
  resolved "https://registry.yarnpkg.com/lodash/-/lodash-4.17.21.tgz#abc123"
  integrity sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+LFTGHVxVjcXPs17LhbZVGedAJv8XZ1tvj5FvSg==
`

      const issues = validateHost.check(lockfile, createContext('yarn.lock', { allowedHosts: ['yarn'] }))
      expect(issues).toHaveLength(0)
    })

    test('detects packages from unauthorized hosts', () => {
      const lockfile = `# yarn lockfile v1

"malicious@^1.0.0":
  version "1.0.0"
  resolved "https://evil.com/malicious/-/malicious-1.0.0.tgz#abc123"
  integrity sha512-abc==
`

      const issues = validateHost.check(lockfile, createContext('yarn.lock', { allowedHosts: ['npm', 'yarn'] }))
      expect(issues).toHaveLength(1)
      expect(issues[0].message).toContain('evil.com')
    })
  })

  describe('non-lockfile content', () => {
    test('returns empty array for non-lockfile content', () => {
      const issues = validateHost.check('random content', createContext('random.txt'))
      expect(issues).toHaveLength(0)
    })

    test('returns empty array for package.json', () => {
      const packageJson = JSON.stringify({ name: 'test', version: '1.0.0' })
      const issues = validateHost.check(packageJson, createContext('package.json'))
      expect(issues).toHaveLength(0)
    })
  })
})
