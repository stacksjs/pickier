import type { PickierConfig, PickierPlugin, RuleContext, RuleModule } from '../src/types'
import { describe, expect, it } from 'bun:test'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runLint } from '../src/cli/run-lint'

function tmp(): string {
  return mkdtempSync(join(tmpdir(), 'pickier-plugin-'))
}

// A minimal plugin with a WIP rule and a simple rule
const samplePlugin: PickierPlugin = {
  name: 'sample',
  rules: {
    'no-todo': {
      meta: { docs: 'disallow TODO comments', recommended: true },
      check(content: string, ctx: RuleContext) {
        const issues = []
        const lines = content.split(/\r?\n/)
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]
          const col = line.indexOf('TODO')
          if (col !== -1) {
            issues.push({
              filePath: ctx.filePath,
              line: i + 1,
              column: col + 1,
              ruleId: 'sample/no-todo',
              message: 'Unexpected TODO comment.',
              severity: 'warning',
            })
          }
        }
        return issues
      },
    } as RuleModule,
    'throws-wip': {
      meta: { wip: true },
      check() {
        throw new Error('not implemented yet')
      },
    } as RuleModule,
  },
}

describe('plugin system', () => {
  it('runs plugin rules and reports issues', async () => {
    const dir = tmp()
    const file = 'a.ts'
    writeFileSync(join(dir, file), '// TODO: fix me\nconst x = 1\n', 'utf8')

    const cfg: PickierConfig = {
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'json', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'error', noConsole: 'warn' },
      plugins: [samplePlugin],
      pluginRules: {
        'sample/no-todo': 'warn',
      },
    }

    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify(cfg, null, 2), 'utf8')

    const code = await runLint([join(dir, file)], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(0)
  })

  it('labels WIP rules as errors when they throw', async () => {
    const dir = tmp()
    const file = 'b.ts'
    writeFileSync(join(dir, file), 'const y = 2\n', 'utf8')

    const cfg: PickierConfig = {
      verbose: false,
      ignores: [],
      lint: { extensions: ['ts'], reporter: 'json', cache: false, maxWarnings: -1 },
      format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: false },
      rules: { noDebugger: 'error', noConsole: 'warn' },
      plugins: [samplePlugin],
      pluginRules: {
        'sample/throws-wip': 'error',
      },
    }

    const cfgPath = join(dir, 'pickier.config.json')
    writeFileSync(cfgPath, JSON.stringify(cfg, null, 2), 'utf8')

    const code = await runLint([join(dir, file)], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(1)
  })
})
