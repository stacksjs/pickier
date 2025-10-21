import { exec } from 'node:child_process'
/**
 * Formatting Performance Benchmarks
 * Compares pickier vs Prettier vs Biome
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { promisify } from 'node:util'
import { bench, group, run } from 'mitata'
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

// Helper to run Prettier
async function runPrettier(content: string) {
  try {
    const formatted = await prettier.format(content, {
      parser: 'typescript',
      semi: false,
      singleQuote: true,
      tabWidth: 2,
      printWidth: 80,
    })
    return formatted
  }
  catch (error) {
    console.error('Prettier error:', error)
    return content
  }
}

// Helper to run Biome
async function runBiome(filePath: string) {
  try {
    await execAsync(`npx @biomejs/biome format ${filePath}`)
    return true
  }
  catch (error) {
    console.error('Biome error:', error)
    return false
  }
}

// Helper to run Pickier format
async function runPickierFormat(filePath: string) {
  try {
    // Import the runFormat function from pickier
    const pickier = await import('pickier')
    if ('runFormat' in pickier) {
      // @ts-expect-error - internal API
      await pickier.runFormat([filePath], { write: false })
    }
    return true
  }
  catch (error) {
    console.error('Pickier format error:', error)
    return false
  }
}

// Small file benchmarks
group('Formatting - Small File (~50 lines)', () => {
  bench('pickier', async () => {
    await runPickierFormat(fixtures.small)
  })

  bench('prettier', async () => {
    await runPrettier(fixtureContent.small)
  })

  bench('biome', async () => {
    await runBiome(fixtures.small)
  })
})

// Medium file benchmarks
group('Formatting - Medium File (~500 lines)', () => {
  bench('pickier', async () => {
    await runPickierFormat(fixtures.medium)
  })

  bench('prettier', async () => {
    await runPrettier(fixtureContent.medium)
  })

  bench('biome', async () => {
    await runBiome(fixtures.medium)
  })
})

// Large file benchmarks
group('Formatting - Large File (~2000 lines)', () => {
  bench('pickier', async () => {
    await runPickierFormat(fixtures.large)
  })

  bench('prettier', async () => {
    await runPrettier(fixtureContent.large)
  })

  bench('biome', async () => {
    await runBiome(fixtures.large)
  })
})

// Multiple files benchmark
group('Formatting - All Files (batch)', () => {
  bench('pickier', async () => {
    for (const file of Object.values(fixtures)) {
      await runPickierFormat(file)
    }
  })

  bench('prettier', async () => {
    for (const content of Object.values(fixtureContent)) {
      await runPrettier(content)
    }
  })

  bench('biome', async () => {
    for (const file of Object.values(fixtures)) {
      await runBiome(file)
    }
  })
})

// Cold start benchmarks
group('Formatting - Cold Start', () => {
  bench('pickier (cold)', async () => {
    const pickier = await import('pickier')
    if ('runFormat' in pickier) {
      // @ts-expect-error - internal API
      await pickier.runFormat([fixtures.medium], { write: false })
    }
  })

  bench('prettier (cold)', async () => {
    const p = await import('prettier')
    await p.format(fixtureContent.medium, {
      parser: 'typescript',
      semi: false,
      singleQuote: true,
    })
  })
})

// String manipulation benchmarks (in-memory)
group('Formatting - String Operations', () => {
  bench('prettier (string only)', async () => {
    await prettier.format(fixtureContent.medium, {
      parser: 'typescript',
      semi: false,
      singleQuote: true,
    })
  })
})

// Run benchmarks
await run({
  format: 'mitata',
  colors: true,
  json: false,
})
