/**
 * Parsing and AST Benchmarks
 * Measures parsing speed and AST operations
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { bench, group, run } from 'mitata'

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

// Helper to parse with TypeScript
async function parseWithTypeScript(content: string) {
  const ts = await import('typescript')
  return ts.createSourceFile(
    'test.ts',
    content,
    ts.ScriptTarget.Latest,
    true,
  )
}

// Helper to parse with Babel
async function parseWithBabel(content: string) {
  const babel = await import('@babel/parser')
  return babel.parse(content, {
    sourceType: 'module',
    plugins: ['typescript'],
  })
}

// Parsing speed - small file
group('Parsing - Small File (~50 lines)', () => {
  bench('TypeScript parser', async () => {
    await parseWithTypeScript(fixtureContent.small)
  })

  bench('Babel parser', async () => {
    await parseWithBabel(fixtureContent.small)
  })

  bench('String operations only', () => {
    // Baseline: just string manipulation
    const lines = fixtureContent.small.split('\n')
    const imports = lines.filter(l => l.includes('import'))
    const exports = lines.filter(l => l.includes('export'))
    return { imports, exports }
  })
})

// Parsing speed - medium file
group('Parsing - Medium File (~500 lines)', () => {
  bench('TypeScript parser', async () => {
    await parseWithTypeScript(fixtureContent.medium)
  })

  bench('Babel parser', async () => {
    await parseWithBabel(fixtureContent.medium)
  })
})

// Parsing speed - large file
group('Parsing - Large File (~2000 lines)', () => {
  bench('TypeScript parser', async () => {
    await parseWithTypeScript(fixtureContent.large)
  })

  bench('Babel parser', async () => {
    await parseWithBabel(fixtureContent.large)
  })
})

// AST traversal speed
group('AST - Tree Traversal', () => {
  bench('TypeScript AST walk (medium)', async () => {
    const ts = await import('typescript')
    const sourceFile = await parseWithTypeScript(fixtureContent.medium)

    let nodeCount = 0
    function visit(node: any) {
      nodeCount++
      ts.forEachChild(node, visit)
    }
    visit(sourceFile)
    return nodeCount
  })

  bench('Babel AST walk (medium)', async () => {
    const babel = await import('@babel/parser')
    const traverse = (await import('@babel/traverse')).default
    const ast = await parseWithBabel(fixtureContent.medium)

    let nodeCount = 0
    traverse(ast, {
      enter() {
        nodeCount++
      },
    })
    return nodeCount
  })
})

// Repeated parsing (cache efficiency)
group('Parsing - Repeated (10x)', () => {
  bench('TypeScript (medium)', async () => {
    for (let i = 0; i < 10; i++) {
      await parseWithTypeScript(fixtureContent.medium)
    }
  })

  bench('Babel (medium)', async () => {
    for (let i = 0; i < 10; i++) {
      await parseWithBabel(fixtureContent.medium)
    }
  })
})

// Batch parsing
group('Parsing - All Files (batch)', () => {
  bench('TypeScript (all files)', async () => {
    for (const content of Object.values(fixtureContent)) {
      await parseWithTypeScript(content)
    }
  })

  bench('Babel (all files)', async () => {
    for (const content of Object.values(fixtureContent)) {
      await parseWithBabel(content)
    }
  })
})

// Parsing with error handling
group('Parsing - With Error Recovery', () => {
  const invalidCode = 'const x = { broken syntax'

  bench('TypeScript error recovery', async () => {
    try {
      await parseWithTypeScript(invalidCode)
    }
    catch {
      // Expected to fail
    }
  })

  bench('Babel error recovery', async () => {
    try {
      await parseWithBabel(invalidCode)
    }
    catch {
      // Expected to fail
    }
  })
})

await run({
  format: 'mitata',
  colors: true,
})
