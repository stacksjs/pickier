import { describe, expect, test } from 'bun:test'
import { validateHttps } from '../../../src/rules/lockfile/validate-https'
import type { RuleContext } from '../../../src/types'

const createContext = (filePath: string): RuleContext => ({
  filePath,
  config: {} as any,
})

describe('lockfile/validate-https', () => {
  describe('npm lockfile', () => {
    test('allows packages with HTTPS', () => {
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

      const issues = validateHttps.check(lockfile, createContext('package-lock.json'))
      expect(issues).toHaveLength(0)
    })

    test('detects packages using HTTP', () => {
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

      const issues = validateHttps.check(lockfile, createContext('package-lock.json'))
      expect(issues).toHaveLength(1)
      expect(issues[0].ruleId).toBe('lockfile/validate-https')
      expect(issues[0].message).toContain('http:')
      expect(issues[0].message).toContain('insecure')
      expect(issues[0].severity).toBe('error')
      expect(issues[0].help).toContain('HTTPS')
    })

    test('detects packages using git+http', () => {
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

      const issues = validateHttps.check(lockfile, createContext('package-lock.json'))
      expect(issues).toHaveLength(1)
      expect(issues[0].message).toContain('git+http:')
    })

    test('handles multiple packages with mixed protocols', () => {
      const lockfile = JSON.stringify({
        lockfileVersion: 2,
        packages: {
          'node_modules/secure': {
            version: '1.0.0',
            resolved: 'https://registry.npmjs.org/secure/-/secure-1.0.0.tgz',
            integrity: 'sha512-abc==',
          },
          'node_modules/insecure': {
            version: '1.0.0',
            resolved: 'http://insecure.com/insecure/-/insecure-1.0.0.tgz',
            integrity: 'sha512-def==',
          },
        },
      })

      const issues = validateHttps.check(lockfile, createContext('package-lock.json'))
      expect(issues).toHaveLength(1)
      expect(issues[0].message).toContain('insecure')
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

      const issues = validateHttps.check(lockfile, createContext('package-lock.json'))
      expect(issues).toHaveLength(0)
    })
  })

  describe('yarn lockfile', () => {
    test('allows packages with HTTPS', () => {
      const lockfile = `# yarn lockfile v1

"lodash@^4.17.0":
  version "4.17.21"
  resolved "https://registry.yarnpkg.com/lodash/-/lodash-4.17.21.tgz#abc123"
  integrity sha512-abc==
`

      const issues = validateHttps.check(lockfile, createContext('yarn.lock'))
      expect(issues).toHaveLength(0)
    })

    test('detects packages using HTTP', () => {
      const lockfile = `# yarn lockfile v1

"insecure@^1.0.0":
  version "1.0.0"
  resolved "http://registry.yarnpkg.com/insecure/-/insecure-1.0.0.tgz#abc123"
  integrity sha512-abc==
`

      const issues = validateHttps.check(lockfile, createContext('yarn.lock'))
      expect(issues).toHaveLength(1)
      expect(issues[0].message).toContain('http:')
    })
  })

  describe('non-lockfile content', () => {
    test('returns empty array for non-lockfile content', () => {
      const issues = validateHttps.check('random content', createContext('random.txt'))
      expect(issues).toHaveLength(0)
    })
  })
})
