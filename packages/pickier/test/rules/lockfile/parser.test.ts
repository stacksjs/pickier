import { describe, expect, test } from 'bun:test'
import {
  detectLockfileType,
  expandHostAliases,
  extractHost,
  extractIntegrityType,
  extractPackageNameFromUrl,
  extractScheme,
  isLockfileContent,
  parseBunLockfile,
  parseNpmLockfile,
  parseYarnLockfile,
  REGISTRY_ALIASES,
} from '../../../src/rules/lockfile/parser'

describe('lockfile/parser', () => {
  describe('detectLockfileType', () => {
    test('detects npm package-lock.json', () => {
      expect(detectLockfileType('/path/to/package-lock.json')).toBe('npm')
      expect(detectLockfileType('package-lock.json')).toBe('npm')
    })

    test('detects yarn.lock', () => {
      expect(detectLockfileType('/path/to/yarn.lock')).toBe('yarn')
      expect(detectLockfileType('yarn.lock')).toBe('yarn')
    })

    test('detects bun lockfiles', () => {
      expect(detectLockfileType('/path/to/bun.lockb')).toBe('bun')
      expect(detectLockfileType('bun.lock')).toBe('bun')
    })

    test('returns null for unknown files', () => {
      expect(detectLockfileType('package.json')).toBeNull()
      expect(detectLockfileType('random.txt')).toBeNull()
    })
  })

  describe('isLockfileContent', () => {
    test('identifies npm lockfile content', () => {
      const npmV2 = JSON.stringify({ lockfileVersion: 2, packages: {} })
      expect(isLockfileContent(npmV2, 'package-lock.json')).toBe(true)

      const npmV1 = JSON.stringify({ dependencies: {} })
      expect(isLockfileContent(npmV1, 'package-lock.json')).toBe(true)
    })

    test('identifies yarn lockfile content', () => {
      const yarnClassic = '# yarn lockfile v1\n"lodash@^4.0.0":\n  resolved "https://registry.yarnpkg.com/lodash/-/lodash-4.17.21.tgz"'
      expect(isLockfileContent(yarnClassic, 'yarn.lock')).toBe(true)

      const yarnBerry = '__metadata:\n  version: 6'
      expect(isLockfileContent(yarnBerry, 'yarn.lock')).toBe(true)
    })

    test('rejects non-lockfile content', () => {
      expect(isLockfileContent('random text', 'package-lock.json')).toBe(false)
      expect(isLockfileContent('{}', 'not-a-lockfile.json')).toBe(false)
    })
  })

  describe('parseNpmLockfile', () => {
    test('parses npm v2/v3 lockfile', () => {
      const lockfile = JSON.stringify({
        lockfileVersion: 2,
        packages: {
          '': {}, // root package
          'node_modules/lodash': {
            version: '4.17.21',
            resolved: 'https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz',
            integrity: 'sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+LFTGHVxVjcXPs17LhbZVGedAJv8XZ1tvj5FvSg==',
          },
        },
      })

      const result = parseNpmLockfile(lockfile)
      expect(result.type).toBe('npm')
      expect(result.packages.size).toBe(1)

      const lodash = result.packages.get('node_modules/lodash')
      expect(lodash).toBeDefined()
      expect(lodash!.name).toBe('lodash')
      expect(lodash!.version).toBe('4.17.21')
      expect(lodash!.resolved).toContain('registry.npmjs.org')
      expect(lodash!.integrity).toContain('sha512')
    })

    test('parses npm v1 lockfile with nested dependencies', () => {
      const lockfile = JSON.stringify({
        lockfileVersion: 1,
        dependencies: {
          lodash: {
            version: '4.17.21',
            resolved: 'https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz',
            integrity: 'sha512-v2kDEe...',
            dependencies: {
              nested: {
                version: '1.0.0',
                resolved: 'https://registry.npmjs.org/nested/-/nested-1.0.0.tgz',
              },
            },
          },
        },
      })

      const result = parseNpmLockfile(lockfile)
      expect(result.packages.size).toBe(2)
      expect(result.packages.has('lodash')).toBe(true)
      expect(result.packages.has('lodash/nested')).toBe(true)
    })

    test('handles scoped packages', () => {
      const lockfile = JSON.stringify({
        lockfileVersion: 2,
        packages: {
          'node_modules/@babel/core': {
            version: '7.0.0',
            resolved: 'https://registry.npmjs.org/@babel/core/-/core-7.0.0.tgz',
            integrity: 'sha512-abc...',
          },
        },
      })

      const result = parseNpmLockfile(lockfile)
      const babel = result.packages.get('node_modules/@babel/core')
      expect(babel).toBeDefined()
      expect(babel!.name).toBe('@babel/core')
    })
  })

  describe('parseYarnLockfile', () => {
    test('parses yarn classic lockfile', () => {
      const lockfile = `# yarn lockfile v1

"lodash@^4.17.0":
  version "4.17.21"
  resolved "https://registry.yarnpkg.com/lodash/-/lodash-4.17.21.tgz#679591c564c3bffaae8454cf0b3df370c3d6911c"
  integrity sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+LFTGHVxVjcXPs17LhbZVGedAJv8XZ1tvj5FvSg==
`

      const result = parseYarnLockfile(lockfile)
      expect(result.type).toBe('yarn')
      expect(result.packages.size).toBe(1)

      const lodash = result.packages.get('lodash@^4.17.0')
      expect(lodash).toBeDefined()
      expect(lodash!.name).toBe('lodash')
      expect(lodash!.version).toBe('4.17.21')
      expect(lodash!.resolved).toContain('registry.yarnpkg.com')
      expect(lodash!.integrity).toContain('sha512')
    })

    test('parses yarn berry lockfile', () => {
      const lockfile = `__metadata:
  version: 6

"lodash@npm:^4.17.0":
  version: 4.17.21
  resolution: "lodash@npm:4.17.21"
  checksum: sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ
`

      const result = parseYarnLockfile(lockfile)
      expect(result.type).toBe('yarn-berry')
    })

    test('handles scoped packages', () => {
      const lockfile = `# yarn lockfile v1

"@babel/core@^7.0.0":
  version "7.0.0"
  resolved "https://registry.yarnpkg.com/@babel/core/-/core-7.0.0.tgz#abc123"
  integrity sha512-abc123==
`

      const result = parseYarnLockfile(lockfile)
      const babel = result.packages.get('@babel/core@^7.0.0')
      expect(babel).toBeDefined()
      expect(babel!.name).toBe('@babel/core')
    })
  })

  describe('parseBunLockfile', () => {
    test('parses bun.lock format', () => {
      const lockfile = JSON.stringify({
        lockfileVersion: 1,
        packages: {
          lodash: ['lodash@4.17.21', '', {}, 'sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+LFTGHVxVjcXPs17LhbZVGedAJv8XZ1tvj5FvSg=='],
        },
      })

      const result = parseBunLockfile(lockfile)
      expect(result.type).toBe('bun')
      expect(result.packages.size).toBe(1)

      const lodash = result.packages.get('lodash')
      expect(lodash).toBeDefined()
      expect(lodash!.name).toBe('lodash')
      expect(lodash!.version).toBe('4.17.21')
      expect(lodash!.integrity).toContain('sha512')
    })

    test('parses scoped packages', () => {
      const lockfile = JSON.stringify({
        lockfileVersion: 1,
        packages: {
          '@babel/core': ['@babel/core@7.0.0', '', { dependencies: {} }, 'sha512-abc=='],
        },
      })

      const result = parseBunLockfile(lockfile)
      const babel = result.packages.get('@babel/core')
      expect(babel).toBeDefined()
      expect(babel!.name).toBe('@babel/core')
      expect(babel!.version).toBe('7.0.0')
    })

    test('handles packages with resolved URLs', () => {
      const lockfile = JSON.stringify({
        lockfileVersion: 1,
        packages: {
          'custom-pkg': ['custom-pkg@1.0.0', 'https://custom.registry.com/custom-pkg-1.0.0.tgz', {}, 'sha512-xyz=='],
        },
      })

      const result = parseBunLockfile(lockfile)
      const pkg = result.packages.get('custom-pkg')
      expect(pkg).toBeDefined()
      expect(pkg!.resolved).toBe('https://custom.registry.com/custom-pkg-1.0.0.tgz')
    })

    test('handles packages with empty resolved URL', () => {
      const lockfile = JSON.stringify({
        lockfileVersion: 1,
        packages: {
          lodash: ['lodash@4.17.21', '', {}, 'sha512-abc=='],
        },
      })

      const result = parseBunLockfile(lockfile)
      const lodash = result.packages.get('lodash')
      expect(lodash).toBeDefined()
      expect(lodash!.resolved).toBeUndefined()
    })
  })

  describe('extractHost', () => {
    test('extracts hostname from URL', () => {
      expect(extractHost('https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz')).toBe('registry.npmjs.org')
      expect(extractHost('https://registry.yarnpkg.com/lodash/-/lodash-4.17.21.tgz')).toBe('registry.yarnpkg.com')
      expect(extractHost('https://evil.com/package.tgz')).toBe('evil.com')
    })

    test('returns null for invalid URLs', () => {
      expect(extractHost('not-a-url')).toBeNull()
      expect(extractHost('')).toBeNull()
    })
  })

  describe('extractScheme', () => {
    test('extracts protocol from URL', () => {
      expect(extractScheme('https://registry.npmjs.org/lodash.tgz')).toBe('https:')
      expect(extractScheme('http://insecure.com/package.tgz')).toBe('http:')
      expect(extractScheme('git+ssh://github.com/repo.git')).toBe('git+ssh:')
      expect(extractScheme('file:///local/path')).toBe('file:')
    })

    test('returns null for invalid URLs', () => {
      expect(extractScheme('not-a-url')).toBeNull()
    })
  })

  describe('extractPackageNameFromUrl', () => {
    test('extracts package name from npm/yarn URLs', () => {
      expect(extractPackageNameFromUrl('https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz')).toBe('lodash')
      expect(extractPackageNameFromUrl('https://registry.yarnpkg.com/express/-/express-4.18.2.tgz')).toBe('express')
    })

    test('extracts scoped package names', () => {
      expect(extractPackageNameFromUrl('https://registry.npmjs.org/@babel/core/-/core-7.0.0.tgz')).toBe('@babel/core')
      expect(extractPackageNameFromUrl('https://registry.npmjs.org/@types/node/-/node-18.0.0.tgz')).toBe('@types/node')
    })

    test('returns null for non-registry URLs', () => {
      expect(extractPackageNameFromUrl('https://github.com/user/repo.git')).toBeNull()
      expect(extractPackageNameFromUrl('file:///local/package.tgz')).toBeNull()
    })
  })

  describe('extractIntegrityType', () => {
    test('extracts hash algorithm', () => {
      expect(extractIntegrityType('sha512-abc123==')).toBe('sha512')
      expect(extractIntegrityType('sha256-def456==')).toBe('sha256')
      expect(extractIntegrityType('sha1-ghi789==')).toBe('sha1')
    })

    test('returns null for invalid integrity', () => {
      expect(extractIntegrityType('')).toBeNull()
      expect(extractIntegrityType('invalid')).toBeNull()
    })
  })

  describe('expandHostAliases', () => {
    test('expands known aliases', () => {
      const expanded = expandHostAliases(['npm', 'yarn', 'verdaccio'])
      expect(expanded).toContain('registry.npmjs.org')
      expect(expanded).toContain('registry.yarnpkg.com')
      expect(expanded).toContain('registry.verdaccio.org')
    })

    test('preserves unknown hosts', () => {
      const expanded = expandHostAliases(['npm', 'custom.registry.com'])
      expect(expanded).toContain('registry.npmjs.org')
      expect(expanded).toContain('custom.registry.com')
    })
  })

  describe('REGISTRY_ALIASES', () => {
    test('contains expected aliases', () => {
      expect(REGISTRY_ALIASES.npm).toBe('registry.npmjs.org')
      expect(REGISTRY_ALIASES.yarn).toBe('registry.yarnpkg.com')
      expect(REGISTRY_ALIASES.verdaccio).toBe('registry.verdaccio.org')
    })
  })
})
