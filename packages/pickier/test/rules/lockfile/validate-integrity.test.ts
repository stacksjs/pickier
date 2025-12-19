import { describe, expect, test } from 'bun:test'
import { validateIntegrity } from '../../../src/rules/lockfile/validate-integrity'
import type { RuleContext } from '../../../src/types'

const createContext = (filePath: string, options?: unknown): RuleContext => ({
  filePath,
  config: {} as any,
  options,
})

describe('lockfile/validate-integrity', () => {
  describe('npm lockfile', () => {
    test('allows packages with SHA512 integrity', () => {
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

      const issues = validateIntegrity.check(lockfile, createContext('package-lock.json'))
      expect(issues).toHaveLength(0)
    })

    test('detects packages with SHA1 integrity', () => {
      const lockfile = JSON.stringify({
        lockfileVersion: 2,
        packages: {
          'node_modules/weak-pkg': {
            version: '1.0.0',
            resolved: 'https://registry.npmjs.org/weak-pkg/-/weak-pkg-1.0.0.tgz',
            integrity: 'sha1-1ZNEUixLxGSmWnMKxpUAf9tm3Yg=',
          },
        },
      })

      const issues = validateIntegrity.check(lockfile, createContext('package-lock.json'))
      expect(issues).toHaveLength(1)
      expect(issues[0].ruleId).toBe('lockfile/validate-integrity')
      expect(issues[0].message).toContain('sha1')
      expect(issues[0].message).toContain('sha512')
      expect(issues[0].severity).toBe('error')
      expect(issues[0].help).toContain('collision attacks')
    })

    test('detects packages with SHA256 integrity when SHA512 required', () => {
      const lockfile = JSON.stringify({
        lockfileVersion: 2,
        packages: {
          'node_modules/sha256-pkg': {
            version: '1.0.0',
            resolved: 'https://registry.npmjs.org/sha256-pkg/-/sha256-pkg-1.0.0.tgz',
            integrity: 'sha256-47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU=',
          },
        },
      })

      const issues = validateIntegrity.check(lockfile, createContext('package-lock.json'))
      expect(issues).toHaveLength(1)
      expect(issues[0].message).toContain('sha256')
    })

    test('allows SHA256 when configured as minimum', () => {
      const lockfile = JSON.stringify({
        lockfileVersion: 2,
        packages: {
          'node_modules/sha256-pkg': {
            version: '1.0.0',
            resolved: 'https://registry.npmjs.org/sha256-pkg/-/sha256-pkg-1.0.0.tgz',
            integrity: 'sha256-47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU=',
          },
        },
      })

      const issues = validateIntegrity.check(lockfile, createContext('package-lock.json', {
        requiredAlgorithm: 'sha256',
      }))
      expect(issues).toHaveLength(0)
    })

    test('still detects SHA1 when SHA256 is minimum', () => {
      const lockfile = JSON.stringify({
        lockfileVersion: 2,
        packages: {
          'node_modules/sha1-pkg': {
            version: '1.0.0',
            resolved: 'https://registry.npmjs.org/sha1-pkg/-/sha1-pkg-1.0.0.tgz',
            integrity: 'sha1-1ZNEUixLxGSmWnMKxpUAf9tm3Yg=',
          },
        },
      })

      const issues = validateIntegrity.check(lockfile, createContext('package-lock.json', {
        requiredAlgorithm: 'sha256',
      }))
      expect(issues).toHaveLength(1)
    })

    test('allows excluding specific packages', () => {
      const lockfile = JSON.stringify({
        lockfileVersion: 2,
        packages: {
          'node_modules/legacy-pkg': {
            version: '1.0.0',
            resolved: 'https://registry.npmjs.org/legacy-pkg/-/legacy-pkg-1.0.0.tgz',
            integrity: 'sha1-1ZNEUixLxGSmWnMKxpUAf9tm3Yg=',
          },
        },
      })

      const issues = validateIntegrity.check(lockfile, createContext('package-lock.json', {
        exclude: ['legacy-pkg'],
      }))
      expect(issues).toHaveLength(0)
    })

    test('skips packages without integrity', () => {
      const lockfile = JSON.stringify({
        lockfileVersion: 2,
        packages: {
          'node_modules/local-pkg': {
            version: '1.0.0',
            resolved: 'https://registry.npmjs.org/local-pkg/-/local-pkg-1.0.0.tgz',
          },
        },
      })

      const issues = validateIntegrity.check(lockfile, createContext('package-lock.json'))
      expect(issues).toHaveLength(0)
    })

    test('handles multiple packages with mixed integrity', () => {
      const lockfile = JSON.stringify({
        lockfileVersion: 2,
        packages: {
          'node_modules/strong-pkg': {
            version: '1.0.0',
            resolved: 'https://registry.npmjs.org/strong-pkg/-/strong-pkg-1.0.0.tgz',
            integrity: 'sha512-abc==',
          },
          'node_modules/weak-pkg': {
            version: '1.0.0',
            resolved: 'https://registry.npmjs.org/weak-pkg/-/weak-pkg-1.0.0.tgz',
            integrity: 'sha1-abc==',
          },
        },
      })

      const issues = validateIntegrity.check(lockfile, createContext('package-lock.json'))
      expect(issues).toHaveLength(1)
      expect(issues[0].message).toContain('weak-pkg')
    })
  })

  describe('yarn lockfile', () => {
    test('allows packages with SHA512 integrity', () => {
      const lockfile = `# yarn lockfile v1

"lodash@^4.17.0":
  version "4.17.21"
  resolved "https://registry.yarnpkg.com/lodash/-/lodash-4.17.21.tgz#abc123"
  integrity sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+LFTGHVxVjcXPs17LhbZVGedAJv8XZ1tvj5FvSg==
`

      const issues = validateIntegrity.check(lockfile, createContext('yarn.lock'))
      expect(issues).toHaveLength(0)
    })

    test('detects packages with weak integrity', () => {
      const lockfile = `# yarn lockfile v1

"weak-pkg@^1.0.0":
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/weak-pkg/-/weak-pkg-1.0.0.tgz#abc123"
  integrity sha1-1ZNEUixLxGSmWnMKxpUAf9tm3Yg=
`

      const issues = validateIntegrity.check(lockfile, createContext('yarn.lock'))
      expect(issues).toHaveLength(1)
      expect(issues[0].message).toContain('sha1')
    })
  })

  describe('non-lockfile content', () => {
    test('returns empty array for non-lockfile content', () => {
      const issues = validateIntegrity.check('random content', createContext('random.txt'))
      expect(issues).toHaveLength(0)
    })
  })
})
