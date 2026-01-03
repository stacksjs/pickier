import { describe, expect, test } from 'bun:test'
import { validateScheme } from '../../../src/rules/lockfile/validate-scheme'
import type { RuleContext } from '../../../src/types'

const createContext = (filePath: string, options?: unknown): RuleContext => ({
  filePath,
  config: {} as any,
  options,
})

describe('lockfile/validate-scheme', () => {
  describe('npm lockfile', () => {
    test('allows HTTPS scheme by default', () => {
      const lockfile = JSON.stringify({
        lockfileVersion: 2,
        packages: {
          'node_modules/lodash': {
            version: '4.17.21',
            resolved: 'https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz',
            integrity: 'sha512-abc==',
          },
        },
      })

      const issues = validateScheme.check(lockfile, createContext('package-lock.json'))
      expect(issues).toHaveLength(0)
    })

    test('allows git+https scheme by default', () => {
      const lockfile = JSON.stringify({
        lockfileVersion: 2,
        packages: {
          'node_modules/git-pkg': {
            version: '1.0.0',
            resolved: 'git+https://github.com/user/repo.git#abc123',
            integrity: 'sha512-abc==',
          },
        },
      })

      const issues = validateScheme.check(lockfile, createContext('package-lock.json'))
      expect(issues).toHaveLength(0)
    })

    test('allows git+ssh scheme by default', () => {
      const lockfile = JSON.stringify({
        lockfileVersion: 2,
        packages: {
          'node_modules/ssh-pkg': {
            version: '1.0.0',
            resolved: 'git+ssh://git@github.com/user/repo.git#abc123',
            integrity: 'sha512-abc==',
          },
        },
      })

      const issues = validateScheme.check(lockfile, createContext('package-lock.json'))
      expect(issues).toHaveLength(0)
    })

    test('detects HTTP scheme', () => {
      const lockfile = JSON.stringify({
        lockfileVersion: 2,
        packages: {
          'node_modules/insecure': {
            version: '1.0.0',
            resolved: 'http://registry.npmjs.org/insecure/-/insecure-1.0.0.tgz',
            integrity: 'sha512-abc==',
          },
        },
      })

      const issues = validateScheme.check(lockfile, createContext('package-lock.json'))
      expect(issues).toHaveLength(1)
      expect(issues[0].ruleId).toBe('lockfile/validate-scheme')
      expect(issues[0].message).toContain('http:')
      expect(issues[0].severity).toBe('error')
    })

    test('detects file:// scheme', () => {
      const lockfile = JSON.stringify({
        lockfileVersion: 2,
        packages: {
          'node_modules/local-malware': {
            version: '1.0.0',
            resolved: 'file:///path/to/local/malware.tgz',
            integrity: 'sha512-abc==',
          },
        },
      })

      const issues = validateScheme.check(lockfile, createContext('package-lock.json'))
      expect(issues).toHaveLength(1)
      expect(issues[0].message).toContain('file:')
      expect(issues[0].help).toContain('security risk')
    })

    test('detects git+http scheme', () => {
      const lockfile = JSON.stringify({
        lockfileVersion: 2,
        packages: {
          'node_modules/git-pkg': {
            version: '1.0.0',
            resolved: 'git+http://github.com/user/repo.git#abc123',
            integrity: 'sha512-abc==',
          },
        },
      })

      const issues = validateScheme.check(lockfile, createContext('package-lock.json'))
      expect(issues).toHaveLength(1)
      expect(issues[0].message).toContain('git+http:')
    })

    test('allows custom schemes when configured', () => {
      const lockfile = JSON.stringify({
        lockfileVersion: 2,
        packages: {
          'node_modules/local-pkg': {
            version: '1.0.0',
            resolved: 'file:///path/to/local/pkg.tgz',
            integrity: 'sha512-abc==',
          },
        },
      })

      const issues = validateScheme.check(lockfile, createContext('package-lock.json', {
        allowedSchemes: ['https:', 'file:'],
      }))
      expect(issues).toHaveLength(0)
    })

    test('restricts to only specified schemes', () => {
      const lockfile = JSON.stringify({
        lockfileVersion: 2,
        packages: {
          'node_modules/git-pkg': {
            version: '1.0.0',
            resolved: 'git+ssh://git@github.com/user/repo.git#abc123',
            integrity: 'sha512-abc==',
          },
        },
      })

      // Only allow HTTPS, not git+ssh
      const issues = validateScheme.check(lockfile, createContext('package-lock.json', {
        allowedSchemes: ['https:'],
      }))
      expect(issues).toHaveLength(1)
      expect(issues[0].message).toContain('git+ssh:')
    })

    test('handles multiple packages with mixed schemes', () => {
      const lockfile = JSON.stringify({
        lockfileVersion: 2,
        packages: {
          'node_modules/good-pkg': {
            version: '1.0.0',
            resolved: 'https://registry.npmjs.org/good-pkg/-/good-pkg-1.0.0.tgz',
            integrity: 'sha512-abc==',
          },
          'node_modules/bad-http': {
            version: '1.0.0',
            resolved: 'http://registry.npmjs.org/bad-http/-/bad-http-1.0.0.tgz',
            integrity: 'sha512-def==',
          },
          'node_modules/bad-file': {
            version: '1.0.0',
            resolved: 'file:///local/bad-file.tgz',
            integrity: 'sha512-ghi==',
          },
        },
      })

      const issues = validateScheme.check(lockfile, createContext('package-lock.json'))
      expect(issues).toHaveLength(2)
    })

    test('skips packages without resolved URL', () => {
      const lockfile = JSON.stringify({
        lockfileVersion: 2,
        packages: {
          'node_modules/local-pkg': {
            version: '1.0.0',
          },
        },
      })

      const issues = validateScheme.check(lockfile, createContext('package-lock.json'))
      expect(issues).toHaveLength(0)
    })
  })

  describe('yarn lockfile', () => {
    test('allows HTTPS scheme', () => {
      const lockfile = `# yarn lockfile v1

"lodash@^4.17.0":
  version "4.17.21"
  resolved "https://registry.yarnpkg.com/lodash/-/lodash-4.17.21.tgz#abc123"
  integrity sha512-abc==
`

      const issues = validateScheme.check(lockfile, createContext('yarn.lock'))
      expect(issues).toHaveLength(0)
    })

    test('detects disallowed schemes', () => {
      const lockfile = `# yarn lockfile v1

"insecure@^1.0.0":
  version "1.0.0"
  resolved "http://registry.yarnpkg.com/insecure/-/insecure-1.0.0.tgz#abc123"
  integrity sha512-abc==
`

      const issues = validateScheme.check(lockfile, createContext('yarn.lock'))
      expect(issues).toHaveLength(1)
    })
  })

  describe('non-lockfile content', () => {
    test('returns empty array for non-lockfile content', () => {
      const issues = validateScheme.check('random content', createContext('random.txt'))
      expect(issues).toHaveLength(0)
    })
  })
})
