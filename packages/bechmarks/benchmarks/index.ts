/**
 * Main Benchmark Runner
 * Runs all benchmarks and generates a comprehensive report
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { bench, group, run } from 'mitata'
import { runLintProgrammatic } from 'pickier'
import * as prettier from 'prettier'

console.log('\n🚀 Pickier Benchmarks\n')
console.log('='.repeat(80))
console.log('Running comprehensive performance benchmarks')
console.log('Comparing: Pickier vs ESLint vs oxlint vs Prettier vs Biome\n')

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

// Quick Overview Benchmarks
group('⚡ Quick Overview - Linting', () => {
  bench('pickier (medium file)', async () => {
    await runLintProgrammatic([fixtures.medium], { reporter: 'json' })
  })

  bench('pickier (large file)', async () => {
    await runLintProgrammatic([fixtures.large], { reporter: 'json' })
  })
})

group('⚡ Quick Overview - Formatting', () => {
  bench('prettier (medium file)', async () => {
    await prettier.format(fixtureContent.medium, {
      parser: 'typescript',
      semi: false,
      singleQuote: true,
    })
  })

  bench('prettier (large file)', async () => {
    await prettier.format(fixtureContent.large, {
      parser: 'typescript',
      semi: false,
      singleQuote: true,
    })
  })
})

group('⚡ Quick Overview - Combined', () => {
  bench('pickier: lint + format (medium)', async () => {
    await runLintProgrammatic([fixtures.medium], { reporter: 'json' })
    const pickier = await import('pickier')
    if ('runFormat' in pickier) {
      await pickier.runFormat([fixtures.medium], { write: false })
    }
  })

  bench('eslint + prettier (medium)', async () => {
    const { ESLint } = await import('eslint')
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: {
        languageOptions: {
          ecmaVersion: 'latest',
          sourceType: 'module',
        },
        rules: {
          'no-debugger': 'error',
          'no-console': 'warn',
        },
      },
    })
    await eslint.lintFiles([fixtures.medium])
    await prettier.format(fixtureContent.medium, {
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

  bench(`pickier (${mediumLines} lines)`, async () => {
    await runLintProgrammatic([fixtures.medium], { reporter: 'json' })
  })

  bench(`pickier (${largeLines} lines)`, async () => {
    await runLintProgrammatic([fixtures.large], { reporter: 'json' })
  })
})

// Stress test
group('💪 Stress Test - 100 Iterations', () => {
  bench('pickier (small file x100)', async () => {
    for (let i = 0; i < 100; i++) {
      await runLintProgrammatic([fixtures.small], { reporter: 'json' })
    }
  })

  bench('prettier (small file x100)', async () => {
    for (let i = 0; i < 100; i++) {
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
  format: 'mitata',
  colors: true,
})

console.log(`\n${'='.repeat(80)}`)
console.log('✅ Benchmark suite completed!')
console.log('\nFor detailed comparisons, run:')
console.log('  bun run bench:lint      - Linting benchmarks only')
console.log('  bun run bench:format    - Formatting benchmarks only')
console.log('  bun run bench:combined  - Combined workflow benchmarks')
console.log(`${'='.repeat(80)}\n`)
