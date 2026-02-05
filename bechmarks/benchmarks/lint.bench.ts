import { exec } from 'node:child_process'
/**
 * Linting Performance Benchmarks
 * Compares pickier vs ESLint
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { promisify } from 'node:util'
import { bench, group, run } from 'mitata'
import { runLintProgrammatic } from 'pickier'

const execAsync = promisify(exec)

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

// Helper to run ESLint programmatically
async function runESLint(filePath: string) {
  try {
    const { ESLint } = await import('eslint')
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
          'no-unused-vars': 'error',
          'semi': ['error', 'never'],
          'quotes': ['error', 'single'],
        },
      },
    })
    const results = await eslint.lintFiles([filePath])
    return results
  }
  catch (error) {
    console.error('ESLint error:', error)
    return []
  }
}

// Note: oxlint is not included in benchmarks as it's not easily installable via npm
// You can add it manually if needed

// Helper to run Pickier
async function runPickier(filePath: string) {
  try {
    const result = await runLintProgrammatic([filePath], { reporter: 'json' })
    return result
  }
  catch (error) {
    console.error('Pickier error:', error)
    return { errors: 0, warnings: 0, issues: [] }
  }
}

// Small file benchmarks
group('Linting - Small File (~50 lines)', () => {
  bench('pickier', async () => {
    await runPickier(fixtures.small)
  })

  bench('eslint', async () => {
    await runESLint(fixtures.small)
  })
})

// Medium file benchmarks
group('Linting - Medium File (~500 lines)', () => {
  bench('pickier', async () => {
    await runPickier(fixtures.medium)
  })

  bench('eslint', async () => {
    await runESLint(fixtures.medium)
  })
})

// Large file benchmarks
group('Linting - Large File (~2000 lines)', () => {
  bench('pickier', async () => {
    await runPickier(fixtures.large)
  })

  bench('eslint', async () => {
    await runESLint(fixtures.large)
  })
})

// Multiple files benchmark
group('Linting - All Files (batch)', () => {
  bench('pickier', async () => {
    await runPickier(Object.values(fixtures).join(' '))
  })

  bench('eslint', async () => {
    for (const file of Object.values(fixtures)) {
      await runESLint(file)
    }
  })
})

// Cold start benchmarks (simulates first run)
group('Linting - Cold Start', () => {
  bench('pickier (cold)', async () => {
    const { runLintProgrammatic: fresh } = await import('pickier')
    await fresh([fixtures.medium], { reporter: 'json' })
  })

  bench('eslint (cold)', async () => {
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
  })
})

// Run benchmarks
await run({
  format: 'mitata',
  colors: true,
})
