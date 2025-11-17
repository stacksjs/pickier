/* eslint-disable no-console */
import type { LintOptions } from '../../../src/types'
import { afterEach, expect, it } from 'bun:test'
import { existsSync, unlinkSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { runLint } from '../../../src/linter'

const tempFiles: string[] = []

function createTempFile(content: string, suffix = '.ts'): string {
  const tempPath = resolve(__dirname, `temp-no-console-${Date.now()}-${Math.random().toString(36).substring(7)}${suffix}`)
  writeFileSync(tempPath, content)
  tempFiles.push(tempPath)
  return tempPath
}

function cleanupTempFiles(): void {
  for (const file of tempFiles) {
    if (existsSync(file))
      unlinkSync(file)
  }
  tempFiles.length = 0
}

afterEach(() => {
  cleanupTempFiles()
})

it('should flag actual console calls', async () => {
  const content = `
console.log('test')
console.warn('warning')
console.error('error')
`
  const tempPath = createTempFile(content)
  const options: LintOptions = { reporter: 'json' }

  const originalLog = console.log
  let output = ''
  console.log = (msg: string) => { output += msg }

  try {
    await runLint([tempPath], options)
    console.log = originalLog

    const result = JSON.parse(output)
    // Only console.log should be flagged by default, not console.warn or console.error
    expect(result.issues.length).toBe(1)
    expect(result.issues[0].ruleId).toBe('no-console')
    expect(result.issues[0].line).toBe(2) // console.log is on line 2
  }
  finally {
    console.log = originalLog
  }
})

it('should NOT flag console in single-quoted strings', async () => {
  const content = `
const str = 'console.log(x)'
const message = 'Use console.error for errors'
`
  const tempPath = createTempFile(content)
  const options: LintOptions = { reporter: 'json' }

  const originalLog = console.log
  let output = ''
  console.log = (msg: string) => { output += msg }

  try {
    await runLint([tempPath], options)
    console.log = originalLog

    const result = JSON.parse(output)
    expect(result.issues.filter((i: any) => i.ruleId === 'no-console')).toHaveLength(0)
  }
  finally {
    console.log = originalLog
  }
})

it('should NOT flag console in double-quoted strings', async () => {
  const content = `
const str = "console.log(x)"
const message = "Use console.error for errors"
`
  const tempPath = createTempFile(content)
  const options: LintOptions = { reporter: 'json' }

  const originalLog = console.log
  let output = ''
  console.log = (msg: string) => { output += msg }

  try {
    await runLint([tempPath], options)
    console.log = originalLog

    const result = JSON.parse(output)
    expect(result.issues.filter((i: any) => i.ruleId === 'no-console')).toHaveLength(0)
  }
  finally {
    console.log = originalLog
  }
})

it('should NOT flag console in template literals', async () => {
  const content = `
const str = \`console.log(x)\`
const message = \`Use console.error for errors\`
`
  const tempPath = createTempFile(content)
  const options: LintOptions = { reporter: 'json' }

  const originalLog = console.log
  let output = ''
  console.log = (msg: string) => { output += msg }

  try {
    await runLint([tempPath], options)
    console.log = originalLog

    const result = JSON.parse(output)
    expect(result.issues.filter((i: any) => i.ruleId === 'no-console')).toHaveLength(0)
  }
  finally {
    console.log = originalLog
  }
})

it('should NOT flag console in line comments', async () => {
  const content = `
// This is how you use console.log
// eslint-disable-next-line no-console
const x = 1
`
  const tempPath = createTempFile(content)
  const options: LintOptions = { reporter: 'json' }

  const originalLog = console.log
  let output = ''
  console.log = (msg: string) => { output += msg }

  try {
    await runLint([tempPath], options)
    console.log = originalLog

    const result = JSON.parse(output)
    expect(result.issues.filter((i: any) => i.ruleId === 'no-console')).toHaveLength(0)
  }
  finally {
    console.log = originalLog
  }
})

it('should flag console call after string with console in it', async () => {
  const content = `
const str = 'console.log is useful'
console.log(str)
`
  const tempPath = createTempFile(content)
  const options: LintOptions = { reporter: 'json' }

  const originalLog = console.log
  let output = ''
  console.log = (msg: string) => { output += msg }

  try {
    await runLint([tempPath], options)
    console.log = originalLog

    const result = JSON.parse(output)
    const consoleIssues = result.issues.filter((i: any) => i.ruleId === 'no-console')
    expect(consoleIssues).toHaveLength(1)
    expect(consoleIssues[0].line).toBe(3)
  }
  finally {
    console.log = originalLog
  }
})

it('should flag console call before comment with console in it', async () => {
  const content = `
console.log('test')
// This is console.log usage
`
  const tempPath = createTempFile(content)
  const options: LintOptions = { reporter: 'json' }

  const originalLog = console.log
  let output = ''
  console.log = (msg: string) => { output += msg }

  try {
    await runLint([tempPath], options)
    console.log = originalLog

    const result = JSON.parse(output)
    const consoleIssues = result.issues.filter((i: any) => i.ruleId === 'no-console')
    expect(consoleIssues).toHaveLength(1)
    expect(consoleIssues[0].line).toBe(2)
  }
  finally {
    console.log = originalLog
  }
})

it('should use kebab-case rule ID "no-console"', async () => {
  const content = `console.log('test')`
  const tempPath = createTempFile(content)
  const options: LintOptions = { reporter: 'json' }

  const originalLog = console.log
  let output = ''
  console.log = (msg: string) => { output += msg }

  try {
    await runLint([tempPath], options)
    console.log = originalLog

    const result = JSON.parse(output)
    expect(result.issues[0].ruleId).toBe('no-console')
  }
  finally {
    console.log = originalLog
  }
})
