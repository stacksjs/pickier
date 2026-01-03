import { describe, expect, test } from 'bun:test'
import { validatePackageNames } from '../../../src/rules/lockfile/validate-package-names'
import type { RuleContext } from '../../../src/types'

const createContext = (filePath: string, options?: unknown): RuleContext => ({
  filePath,
  config: {} as any,
  options,
})

describe('lockfile/validate-package-names', () => {
  describe('npm lockfile', () => {
    test('allows packages with matching names', () => {
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

      const issues = validatePackageNames.check(lockfile, createContext('package-lock.json'))
      expect(issues).toHaveLength(0)
    })

    test('allows scoped packages with matching names', () => {
      const lockfile = JSON.stringify({
        lockfileVersion: 2,
        packages: {
          'node_modules/@babel/core': {
            version: '7.0.0',
            resolved: 'https://registry.npmjs.org/@babel/core/-/core-7.0.0.tgz',
            integrity: 'sha512-abc==',
          },
        },
      })

      const issues = validatePackageNames.check(lockfile, createContext('package-lock.json'))
      expect(issues).toHaveLength(0)
    })

    test('detects package name substitution attack', () => {
      // This is a critical supply chain attack vector:
      // The lockfile says "meow" but the URL points to "meowlicious"
      const lockfile = JSON.stringify({
        lockfileVersion: 2,
        packages: {
          'node_modules/meow': {
            version: '1.0.0',
            resolved: 'https://registry.npmjs.org/meowlicious/-/meow-1.0.0.tgz',
            integrity: 'sha512-abc==',
          },
        },
      })

      const issues = validatePackageNames.check(lockfile, createContext('package-lock.json'))
      expect(issues).toHaveLength(1)
      expect(issues[0].ruleId).toBe('lockfile/validate-package-names')
      expect(issues[0].message).toContain('meow')
      expect(issues[0].message).toContain('meowlicious')
      expect(issues[0].severity).toBe('error')
      expect(issues[0].help).toContain('substitution attack')
    })

    test('detects scoped package name substitution', () => {
      const lockfile = JSON.stringify({
        lockfileVersion: 2,
        packages: {
          'node_modules/@types/node': {
            version: '18.0.0',
            resolved: 'https://registry.npmjs.org/@evil/malware/-/node-18.0.0.tgz',
            integrity: 'sha512-abc==',
          },
        },
      })

      const issues = validatePackageNames.check(lockfile, createContext('package-lock.json'))
      expect(issues).toHaveLength(1)
      expect(issues[0].message).toContain('@types/node')
      expect(issues[0].message).toContain('@evil/malware')
    })

    test('allows package aliases', () => {
      // Some legitimate use cases involve aliasing packages
      const lockfile = JSON.stringify({
        lockfileVersion: 2,
        packages: {
          'node_modules/react': {
            version: '18.0.0',
            resolved: 'https://registry.npmjs.org/preact/-/preact-10.0.0.tgz',
            integrity: 'sha512-abc==',
          },
        },
      })

      const issues = validatePackageNames.check(lockfile, createContext('package-lock.json', {
        aliases: { react: 'preact' },
      }))
      expect(issues).toHaveLength(0)
    })

    test('skips non-official registries', () => {
      // Private registries may use different URL structures
      const lockfile = JSON.stringify({
        lockfileVersion: 2,
        packages: {
          'node_modules/internal-pkg': {
            version: '1.0.0',
            resolved: 'https://private.registry.com/some/other/path/internal-pkg-1.0.0.tgz',
            integrity: 'sha512-abc==',
          },
        },
      })

      const issues = validatePackageNames.check(lockfile, createContext('package-lock.json'))
      expect(issues).toHaveLength(0)
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

      const issues = validatePackageNames.check(lockfile, createContext('package-lock.json'))
      expect(issues).toHaveLength(0)
    })
  })

  describe('yarn lockfile', () => {
    test('allows packages with matching names', () => {
      const lockfile = `# yarn lockfile v1

"lodash@^4.17.0":
  version "4.17.21"
  resolved "https://registry.yarnpkg.com/lodash/-/lodash-4.17.21.tgz#abc123"
  integrity sha512-abc==
`

      const issues = validatePackageNames.check(lockfile, createContext('yarn.lock'))
      expect(issues).toHaveLength(0)
    })

    test('detects package name substitution', () => {
      const lockfile = `# yarn lockfile v1

"lodash@^4.17.0":
  version "4.17.21"
  resolved "https://registry.yarnpkg.com/lodash-evil/-/lodash-4.17.21.tgz#abc123"
  integrity sha512-abc==
`

      const issues = validatePackageNames.check(lockfile, createContext('yarn.lock'))
      expect(issues).toHaveLength(1)
      expect(issues[0].message).toContain('lodash')
      expect(issues[0].message).toContain('lodash-evil')
    })
  })

  describe('non-lockfile content', () => {
    test('returns empty array for non-lockfile content', () => {
      const issues = validatePackageNames.check('random content', createContext('random.txt'))
      expect(issues).toHaveLength(0)
    })
  })
})
