/**
 * Main Benchmark Runner
 * Runs all benchmarks and generates a comprehensive report
 * Compares: Pickier, ESLint, Biome, oxlint, and Prettier
 * Uses mitata for accurate benchmarking
 */
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { ESLint } from 'eslint'
import { bench, group, run } from 'mitata'
import { runLintProgrammatic } from 'pickier'
import * as prettier from 'prettier'

console.log('\n🚀 Pickier Benchmarks\n')
console.log('='.repeat(80))
console.log('Running comprehensive performance benchmarks')
console.log('Comparing: Pickier vs ESLint vs Biome vs oxlint vs Prettier\n')

// Load fixtures
const fixtures = {
  small: resolve(__dirname, '../fixtures/small.ts'),
  medium: resolve(__dirname, '../fixtures/medium.ts'),
  large: resolve(__dirname, '../fixtures/large.ts'),
}

const fixtureContent = {
  small: readFileSync(fixtures.small, 'utf-8'),
  medium: readFileSync(fixtures.medium, 'utf-8'),
  large: readFileSync(fixtures.large, 'utf-8'),
}

console.log('Fixtures:')
console.log(`  Small:  ${fixtureContent.small.split('\n').length} lines`)
console.log(`  Medium: ${fixtureContent.medium.split('\n').length} lines`)
console.log(`  Large:  ${fixtureContent.large.split('\n').length} lines`)
console.log(`\n${'='.repeat(80)}\n`)

// Initialize ESLint once for reuse
const eslint = new ESLint({
  overrideConfigFile: true,
  overrideConfig: {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'no-debugger': 'error',
      'no-console': 'warn',
      'no-unused-vars': 'warn',
    },
  },
})

// Quick Overview - Linting Comparison
group('⚡ Linters - Medium File (418 lines)', () => {
  bench('Pickier', async () => {
    await runLintProgrammatic([fixtures.medium], { reporter: 'json' })
  })

  bench('ESLint', async () => {
    await eslint.lintFiles([fixtures.medium])
  })

  bench('Biome', () => {
    try {
      execSync(`bunx @biomejs/biome lint ${fixtures.medium}`, {
        stdio: 'ignore',
      })
    }
    catch {
      // Biome exits with code 1 if issues found
    }
  })

  bench('oxlint', () => {
    try {
      execSync(`bunx oxlint ${fixtures.medium}`, {
        stdio: 'ignore',
      })
    }
    catch {
      // oxlint exits with code 1 if issues found
    }
  })
})

// Formatting Comparison
group('⚡ Formatters - Medium File (418 lines)', () => {
  bench('Pickier (format)', async () => {
    const pickier = await import('pickier')
    if ('runFormat' in pickier) {
      await pickier.runFormat([fixtures.medium], { write: false })
    }
  })

  bench('Prettier', async () => {
    await prettier.format(fixtureContent.medium, {
      parser: 'typescript',
      semi: false,
      singleQuote: true,
    })
  })
})

group('⚡ Linters - Large File (1279 lines)', () => {
  bench('Pickier', async () => {
    await runLintProgrammatic([fixtures.large], { reporter: 'json' })
  })

  bench('ESLint', async () => {
    await eslint.lintFiles([fixtures.large])
  })

  bench('Biome', () => {
    try {
      execSync(`bunx @biomejs/biome lint ${fixtures.large}`, {
        stdio: 'ignore',
      })
    }
    catch {
      // Biome exits with code 1 if issues found
    }
  })

  bench('oxlint', () => {
    try {
      execSync(`bunx oxlint ${fixtures.large}`, {
        stdio: 'ignore',
      })
    }
    catch {
      // oxlint exits with code 1 if issues found
    }
  })
})

// Formatting Comparison - Large File
group('⚡ Formatters - Large File (1279 lines)', () => {
  bench('Pickier (format)', async () => {
    const pickier = await import('pickier')
    if ('runFormat' in pickier) {
      await pickier.runFormat([fixtures.large], { write: false })
    }
  })

  bench('Prettier', async () => {
    await prettier.format(fixtureContent.large, {
      parser: 'typescript',
      semi: false,
      singleQuote: true,
    })
  })
})

// Throughput benchmarks
group('📊 Throughput - Lines per Second', () => {
  const mediumLines = fixtureContent.medium.split('\n').length
  const largeLines = fixtureContent.large.split('\n').length

  bench(`Pickier (${mediumLines} lines)`, async () => {
    await runLintProgrammatic([fixtures.medium], { reporter: 'json' })
  })

  bench(`ESLint (${mediumLines} lines)`, async () => {
    await eslint.lintFiles([fixtures.medium])
  })

  bench(`Biome (${mediumLines} lines)`, () => {
    try {
      execSync(`bunx @biomejs/biome lint ${fixtures.medium}`, {
        stdio: 'ignore',
      })
    }
    catch {
      // Biome exits with code 1 if issues found
    }
  })

  bench(`oxlint (${mediumLines} lines)`, () => {
    try {
      execSync(`bunx oxlint ${fixtures.medium}`, {
        stdio: 'ignore',
      })
    }
    catch {
      // oxlint exits with code 1 if issues found
    }
  })

  bench(`Pickier (${largeLines} lines)`, async () => {
    await runLintProgrammatic([fixtures.large], { reporter: 'json' })
  })

  bench(`ESLint (${largeLines} lines)`, async () => {
    await eslint.lintFiles([fixtures.large])
  })

  bench(`Biome (${largeLines} lines)`, () => {
    try {
      execSync(`bunx @biomejs/biome lint ${fixtures.large}`, {
        stdio: 'ignore',
      })
    }
    catch {
      // Biome exits with code 1 if issues found
    }
  })

  bench(`oxlint (${largeLines} lines)`, () => {
    try {
      execSync(`bunx oxlint ${fixtures.large}`, {
        stdio: 'ignore',
      })
    }
    catch {
      // oxlint exits with code 1 if issues found
    }
  })
})

// Stress test - Multiple iterations
group('💪 Stress Test - 50 Iterations (Small File)', () => {
  bench('Pickier (50x)', async () => {
    for (let i = 0; i < 50; i++) {
      await runLintProgrammatic([fixtures.small], { reporter: 'json' })
    }
  })

  bench('ESLint (50x)', async () => {
    for (let i = 0; i < 50; i++) {
      await eslint.lintFiles([fixtures.small])
    }
  })

  bench('Biome (50x)', () => {
    for (let i = 0; i < 50; i++) {
      try {
        execSync(`bunx @biomejs/biome lint ${fixtures.small}`, {
          stdio: 'ignore',
        })
      }
      catch {
        // Biome exits with code 1 if issues found
      }
    }
  })

  bench('oxlint (50x)', () => {
    for (let i = 0; i < 50; i++) {
      try {
        execSync(`bunx oxlint ${fixtures.small}`, {
          stdio: 'ignore',
        })
      }
      catch {
        // oxlint exits with code 1 if issues found
      }
    }
  })

  bench('Prettier (50x)', async () => {
    for (let i = 0; i < 50; i++) {
      await prettier.format(fixtureContent.small, {
        parser: 'typescript',
        semi: false,
        singleQuote: true,
      })
    }
  })
})

// Run all benchmarks
await run({
  colors: true, // Colorful output
})

console.log(`\n${'='.repeat(80)}`)
console.log('✅ Benchmark suite completed!')
console.log('\n📊 Summary:')
console.log('  - Pickier: Bun-native linter with built-in rules')
console.log('  - ESLint: Industry standard JavaScript linter')
console.log('  - Biome: Rust-based JS/TS linter (via CLI)')
console.log('  - oxlint: Rust-based fast linter (via CLI)')
console.log('  - Prettier: Industry standard formatter')
console.log('\nFor detailed comparisons, run:')
console.log('  bun run bench:lint      - Linting benchmarks only')
console.log('  bun run bench:format    - Formatting benchmarks only')
console.log('  bun run bench:combined  - Combined workflow benchmarks')
console.log(`${'='.repeat(80)}\n`)
