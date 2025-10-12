/* eslint-disable no-console, style/max-statements-per-line */
import type { LintOptions } from '../../../src/types'
import { afterEach, expect, it } from 'bun:test'
import { existsSync, unlinkSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { runLint } from '../../../src/linter'

const tempFiles: string[] = []

function createTempFile(content: string, suffix = '.ts'): string {
  const tempPath = resolve(__dirname, `temp-curly-${Date.now()}-${Math.random().toString(36).substring(7)}${suffix}`)
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
  for (const file of tempFiles) {
    if (existsSync(file)) {
      unlinkSync(file)
    }
  }
  tempFiles.length = 0
}

// Cleanup after each test
afterEach(() => {
  cleanupTempFiles()
})

it('should flag single-statement if with unnecessary braces', async () => {
  const content = `
if (condition) {
  doSomething()
}
`

  const tempPath = createTempFile(content)
  const configPath = createConfigWithStyleRules()
  const options: LintOptions = { reporter: 'json', config: configPath }

  // Capture console output
  const originalLog = console.log
  let output = ''
  console.log = (msg: string) => { output += msg }

  try {
    await runLint([tempPath], options)
    console.log = originalLog

    const result = JSON.parse(output)
    expect(result.issues).toHaveLength(1)
    expect(result.issues[0].ruleId).toBe('style/curly')
    expect(result.issues[0].message).toBe('Unnecessary curly braces around single statement')
  }
  finally {
    console.log = originalLog
  }
})

it('should flag braces for if-else with single statements', async () => {
  const content = `
if (!this.historyNav) {
  this.historyNav = new HistoryNavigator(hist, prefix)
}
else {
  this.historyNav.setHistory(hist)
}
`

  const tempPath = createTempFile(content)
  const configPath = createConfigWithStyleRules()
  const options: LintOptions = { reporter: 'json', config: configPath }

  // Capture console output
  const originalLog = console.log
  let output = ''
  console.log = (msg: string) => { output += msg }

  try {
    await runLint([tempPath], options)
    console.log = originalLog

    const result = JSON.parse(output)
    // Should flag both if and else for unnecessary braces around single statements
    expect(result.issues).toHaveLength(2)
    expect(result.issues[0].ruleId).toBe('style/curly')
    expect(result.issues[1].ruleId).toBe('style/curly')
  }
  finally {
    console.log = originalLog
  }
})

it('should keep braces for if-else with multiple statements', async () => {
  const content = `
if (!this.historyNav) {
  this.historyNav = new HistoryNavigator(hist, prefix)
}
else {
  this.historyNav.setHistory(hist)
  this.historyNav.setPrefix(prefix)
}
`

  const tempPath = createTempFile(content)
  const configPath = createConfigWithStyleRules()
  const options: LintOptions = { reporter: 'json', config: configPath }

  // Capture console output
  const originalLog = console.log
  let output = ''
  console.log = (msg: string) => { output += msg }

  try {
    await runLint([tempPath], options)
    console.log = originalLog

    const result = JSON.parse(output)
    // Should not flag - multiple statements require braces
    expect(result.issues).toHaveLength(0)
  }
  finally {
    console.log = originalLog
  }
})

it('should accept if-else without braces for single statements', async () => {
  const content = `
if (!this.historyNav)
  this.historyNav = new HistoryNavigator(hist, prefix)
else
  this.historyNav.setHistory(hist)
`

  const tempPath = createTempFile(content)
  const configPath = createConfigWithStyleRules()
  const options: LintOptions = { reporter: 'json', config: configPath }

  // Capture console output
  const originalLog = console.log
  let output = ''
  console.log = (msg: string) => { output += msg }

  try {
    await runLint([tempPath], options)
    console.log = originalLog

    const result = JSON.parse(output)
    // Should not flag - this is the preferred format for single statements
    expect(result.issues).toHaveLength(0)
  }
  finally {
    console.log = originalLog
  }
})

it('should flag single-statement else with unnecessary braces', async () => {
  const content = `
if (condition)
  doSomething()
else {
  doSomethingElse()
}
`

  const tempPath = createTempFile(content)
  const configPath = createConfigWithStyleRules()
  const options: LintOptions = { reporter: 'json', config: configPath }

  // Capture console output
  const originalLog = console.log
  let output = ''
  console.log = (msg: string) => { output += msg }

  try {
    await runLint([tempPath], options)
    console.log = originalLog

    const result = JSON.parse(output)
    expect(result.issues).toHaveLength(1)
    expect(result.issues[0].ruleId).toBe('style/curly')
    expect(result.issues[0].message).toBe('Unnecessary curly braces around single statement')
  }
  finally {
    console.log = originalLog
  }
})
