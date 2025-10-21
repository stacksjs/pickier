import { exec } from 'node:child_process'
/**
 * Combined Lint + Format Performance Benchmarks
 * Compares full workflow of linting and formatting
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { promisify } from 'node:util'
import { bench, group, run } from 'mitata'
import { runLintProgrammatic } from 'pickier'
import * as prettier from 'prettier'

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

// Helper to run Pickier (lint + format)
async function runPickierFull(filePath: string) {
  try {
    // Run lint
    await runLintProgrammatic([filePath], { reporter: 'json' })

    // Run format
    const pickier = await import('pickier')
    if ('runFormat' in pickier) {
      // @ts-expect-error - internal API
      await pickier.runFormat([filePath], { write: false })
    }

    return true
  }
  catch (error) {
    console.error('Pickier error:', error)
    return false
  }
}

// Helper to run ESLint + Prettier
async function runESLintPrettier(filePath: string, content: string) {
  try {
    // Run ESLint
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
    await eslint.lintFiles([filePath])

    // Run Prettier
    await prettier.format(content, {
      parser: 'typescript',
      semi: false,
      singleQuote: true,
    })

    return true
  }
  catch (error) {
    console.error('ESLint + Prettier error:', error)
    return false
  }
}

// Helper to run Biome (lint + format)
async function runBiomeFull(filePath: string) {
  try {
    // Biome can do both in one command
    await execAsync(`npx @biomejs/biome check ${filePath}`)
    return true
  }
  catch {
    return false
  }
}

// Small file benchmarks
group('Combined (Lint + Format) - Small File', () => {
  bench('pickier', async () => {
    await runPickierFull(fixtures.small)
  })

  bench('eslint + prettier', async () => {
    await runESLintPrettier(fixtures.small, fixtureContent.small)
  })

  bench('biome', async () => {
    await runBiomeFull(fixtures.small)
  })
})

// Medium file benchmarks
group('Combined (Lint + Format) - Medium File', () => {
  bench('pickier', async () => {
    await runPickierFull(fixtures.medium)
  })

  bench('eslint + prettier', async () => {
    await runESLintPrettier(fixtures.medium, fixtureContent.medium)
  })

  bench('biome', async () => {
    await runBiomeFull(fixtures.medium)
  })
})

// Large file benchmarks
group('Combined (Lint + Format) - Large File', () => {
  bench('pickier', async () => {
    await runPickierFull(fixtures.large)
  })

  bench('eslint + prettier', async () => {
    await runESLintPrettier(fixtures.large, fixtureContent.large)
  })

  bench('biome', async () => {
    await runBiomeFull(fixtures.large)
  })
})

// Full project benchmark (all files)
group('Combined (Lint + Format) - Full Project', () => {
  bench('pickier (sequential)', async () => {
    for (const file of Object.values(fixtures)) {
      await runPickierFull(file)
    }
  })

  bench('eslint + prettier (sequential)', async () => {
    for (let i = 0; i < Object.values(fixtures).length; i++) {
      await runESLintPrettier(
        Object.values(fixtures)[i],
        Object.values(fixtureContent)[i],
      )
    }
  })

  bench('biome (sequential)', async () => {
    for (const file of Object.values(fixtures)) {
      await runBiomeFull(file)
    }
  })
})

// Parallel execution benchmark
group('Combined (Lint + Format) - Parallel Execution', () => {
  bench('pickier (parallel)', async () => {
    await Promise.all(Object.values(fixtures).map(file => runPickierFull(file)))
  })

  bench('eslint + prettier (parallel)', async () => {
    await Promise.all(
      Object.keys(fixtures).map((key) => {
        const file = fixtures[key as keyof typeof fixtures]
        const content = fixtureContent[key as keyof typeof fixtureContent]
        return runESLintPrettier(file, content)
      }),
    )
  })

  bench('biome (parallel)', async () => {
    await Promise.all(Object.values(fixtures).map(file => runBiomeFull(file)))
  })
})

// Memory efficiency test (running multiple times)
group('Combined - Memory Efficiency (10 iterations)', () => {
  bench('pickier', async () => {
    for (let i = 0; i < 10; i++) {
      await runPickierFull(fixtures.medium)
    }
  })

  bench('eslint + prettier', async () => {
    for (let i = 0; i < 10; i++) {
      await runESLintPrettier(fixtures.medium, fixtureContent.medium)
    }
  })

  bench('biome', async () => {
    for (let i = 0; i < 10; i++) {
      await runBiomeFull(fixtures.medium)
    }
  })
})

// Run benchmarks
await run({
  format: 'mitata',
  colors: true,
  json: false,
})
