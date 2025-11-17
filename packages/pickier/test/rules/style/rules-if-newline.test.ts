/* eslint-disable no-console */
import type { LintOptions } from '../../../src/types'
import { afterEach, expect, it } from 'bun:test'
import { existsSync, unlinkSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { runLint } from '../../../src/linter'

const tempFiles: string[] = []
function createTempFile(content: string, suffix = '.ts'): string {
  const tempPath = resolve(__dirname, `temp-if-newline-${Date.now()}-${Math.random().toString(36).slice(2)}${suffix}`)
  writeFileSync(tempPath, content)
  tempFiles.push(tempPath)
  return tempPath
}
function createConfigWithStyleRules(): string {
  const configPath = resolve(__dirname, `temp-config-${Date.now()}.json`)
  writeFileSync(configPath, JSON.stringify({
    lint: { extensions: ['ts'], reporter: 'json', cache: false, maxWarnings: -1 },
    format: { extensions: ['ts'], indent: 2, quotes: 'single', semi: false, trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1, finalNewline: 'one' },
    rules: { noDebugger: 'off', noConsole: 'off' },
    pluginRules: { 'style/curly': 'warn', 'style/if-newline': 'warn' },
  }))
  tempFiles.push(configPath)
  return configPath
}
function cleanupTempFiles(): void {
  for (const f of tempFiles) {
    if (existsSync(f))
      unlinkSync(f)
  }
  tempFiles.length = 0
}
afterEach(() => cleanupTempFiles())

it('flags missing newline after if without braces', async () => {
  const content = `if (a) console.log(a)\n`
  const file = createTempFile(content)
  const configPath = createConfigWithStyleRules()
  const options: LintOptions = { reporter: 'json', config: configPath }
  const orig = console.log
  let out = ''
  console.log = (msg: string) => {
    out += msg
  }
  try {
    await runLint([file], options)
  }
  finally {
    console.log = orig
  }
  const result = JSON.parse(out)
  expect(result.issues.find((i: any) => i.ruleId === 'style/if-newline')).toBeTruthy()
})

it('does not flag when consequent on next line', async () => {
  const content = `if (a)\n  console.log(a)\n`
  const file = createTempFile(content)
  const configPath = createConfigWithStyleRules()
  const options: LintOptions = { reporter: 'json', config: configPath }
  const orig = console.log
  let out = ''
  console.log = (msg: string) => {
    out += msg
  }
  try {
    await runLint([file], options)
  }
  finally {
    console.log = orig
  }
  const result = JSON.parse(out)
  expect(result.issues.filter((i: any) => i.ruleId === 'style/if-newline')).toHaveLength(0)
})
