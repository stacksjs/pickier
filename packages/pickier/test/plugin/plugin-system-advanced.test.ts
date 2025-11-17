import { describe, expect, it } from 'bun:test'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runLint } from '../../src/linter'

function tmp(): string {
  return mkdtempSync(join(tmpdir(), 'pickier-plugin-adv-'))
}

// removed unused inline plugin declarations

describe('plugin system (advanced)', () => {
  it('combines multiple plugins and fails on error', async () => {
    const dir = tmp()
    const file = 'a.ts'
    writeFileSync(join(dir, file), '// TODO\nconst x = 1\n', 'utf8')

    const cfgPath = join(dir, 'pickier.config.ts')
    const cfgTs = `
export default {
  verbose: false,
  ignores: [],
  lint: { extensions: ['ts'], reporter: 'json', cache: false, maxWarnings: -1 },
  format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: false },
  rules: { noDebugger: 'error', noConsole: 'warn' },
  plugins: [
    { name: 'todo', rules: {
      'no-todo': { check(content, ctx) {
        const issues = []
        const lines = content.split(/\\r?\\n/)
        for (let i = 0; i < lines.length; i++) {
          const col = lines[i].indexOf('TODO')
          if (col !== -1) issues.push({ filePath: ctx.filePath, line: i + 1, column: col + 1, ruleId: 'todo/no-todo', message: 'Unexpected TODO comment.', severity: 'warning' })
        }
        return issues
      }}
    }},
    { name: 'hard', rules: {
      'ban-const': { check(content, ctx) {
        const issues = []
        const lines = content.split(/\\r?\\n/)
        for (let i = 0; i < lines.length; i++) {
          if (/\\bconst\\b/.test(lines[i])) issues.push({ filePath: ctx.filePath, line: i + 1, column: Math.max(1, lines[i].indexOf('const') + 1), ruleId: 'hard/ban-const', message: 'Disallowed const declaration.', severity: 'error' })
        }
        return issues
      }}
    }}
  ],
  pluginRules: { 'todo/no-todo': 'warn', 'hard/ban-const': 'error' }
}
`
    writeFileSync(cfgPath, cfgTs, 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json' })
    expect(code).toBe(1)
  })

  it('respects maxWarnings threshold for plugin warnings', async () => {
    const dir = tmp()
    const file = 'b.ts'
    writeFileSync(join(dir, file), '// TODO one\n// TODO two\n', 'utf8')

    const cfgPath = join(dir, 'pickier.config.ts')
    const cfgTs = `
export default {
  verbose: false,
  ignores: [],
  lint: { extensions: ['ts'], reporter: 'json', cache: false, maxWarnings: -1 },
  format: { extensions: ['ts'], trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one', indent: 2, quotes: 'single', semi: false },
  rules: { noDebugger: 'error', noConsole: 'warn' },
  plugins: [
    { name: 'todo', rules: {
      'no-todo': { check(content, ctx) {
        const issues = []
        const lines = content.split(/\\r?\\n/)
        for (let i = 0; i < lines.length; i++) {
          const col = lines[i].indexOf('TODO')
          if (col !== -1) issues.push({ filePath: ctx.filePath, line: i + 1, column: col + 1, ruleId: 'todo/no-todo', message: 'Unexpected TODO comment.', severity: 'warning' })
        }
        return issues
      }}
    }}
  ],
  pluginRules: { 'todo/no-todo': 'warn' }
}
`
    writeFileSync(cfgPath, cfgTs, 'utf8')

    const code = await runLint([dir], { config: cfgPath, reporter: 'json', maxWarnings: 0 })
    expect(code).toBe(1)
  })
})
