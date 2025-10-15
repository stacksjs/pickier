/* eslint-disable no-console */
import type { LintOptions } from '../../../src/types'
import { afterEach, describe, expect, it } from 'bun:test'
import { existsSync, unlinkSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { runLint } from '../../../src/linter'

const tempFiles: string[] = []

function createTempFile(content: string): string {
  const tempPath = resolve(__dirname, `temp-md-emphasis-${Date.now()}-${Math.random().toString(36).substring(7)}.md`)
  writeFileSync(tempPath, content)
  tempFiles.push(tempPath)
  return tempPath
}

function createConfigWithMarkdownRules(rules: Record<string, string | [string, any]>): string {
  const configPath = resolve(__dirname, `temp-config-${Date.now()}.json`)
  writeFileSync(configPath, JSON.stringify({
    lint: { extensions: ['md'], reporter: 'json', cache: false, maxWarnings: -1 },
    pluginRules: rules,
  }))
  tempFiles.push(configPath)
  return configPath
}

function cleanupTempFiles(): void {
  for (const file of tempFiles) {
    if (existsSync(file)) unlinkSync(file)
  }
  tempFiles.length = 0
}

afterEach(() => cleanupTempFiles())

describe('MD037 - no-space-in-emphasis', () => {
  it('should flag spaces inside emphasis markers', async () => {
    const content = `** text with spaces **
`
    const tempPath = createTempFile(content)
    const configPath = createConfigWithMarkdownRules({ 'markdown/no-space-in-emphasis': 'error' })
    const options: LintOptions = { reporter: 'json', config: configPath }

    const originalLog = console.log
    let output = ''
    console.log = (msg: string) => { output += msg }

    try {
      await runLint([tempPath], options)
      console.log = originalLog

      const result = JSON.parse(output)
      expect(result.issues.length).toBeGreaterThan(0)
      expect(result.issues[0].ruleId).toBe('markdown/no-space-in-emphasis')
    }
    finally {
      console.log = originalLog
    }
  })
})

describe('MD038 - no-space-in-code', () => {
  it('should flag spaces inside code spans', async () => {
    const content = `\` code with spaces \`
`
    const tempPath = createTempFile(content)
    const configPath = createConfigWithMarkdownRules({ 'markdown/no-space-in-code': 'error' })
    const options: LintOptions = { reporter: 'json', config: configPath }

    const originalLog = console.log
    let output = ''
    console.log = (msg: string) => { output += msg }

    try {
      await runLint([tempPath], options)
      console.log = originalLog

      const result = JSON.parse(output)
      expect(result.issues.length).toBeGreaterThan(0)
      expect(result.issues[0].ruleId).toBe('markdown/no-space-in-code')
    }
    finally {
      console.log = originalLog
    }
  })
})

describe('MD049 - emphasis-style', () => {
  it('should flag inconsistent emphasis styles', async () => {
    const content = `*asterisk emphasis* and _underscore emphasis_
`
    const tempPath = createTempFile(content)
    const configPath = createConfigWithMarkdownRules({ 'markdown/emphasis-style': ['error', { style: 'consistent' }] })
    const options: LintOptions = { reporter: 'json', config: configPath }

    const originalLog = console.log
    let output = ''
    console.log = (msg: string) => { output += msg }

    try {
      await runLint([tempPath], options)
      console.log = originalLog

      const result = JSON.parse(output)
      expect(result.issues.length).toBeGreaterThan(0)
      expect(result.issues[0].ruleId).toBe('markdown/emphasis-style')
    }
    finally {
      console.log = originalLog
    }
  })
})

describe('MD050 - strong-style', () => {
  it('should flag inconsistent strong styles', async () => {
    const content = `**asterisk strong** and __underscore strong__
`
    const tempPath = createTempFile(content)
    const configPath = createConfigWithMarkdownRules({ 'markdown/strong-style': ['error', { style: 'consistent' }] })
    const options: LintOptions = { reporter: 'json', config: configPath }

    const originalLog = console.log
    let output = ''
    console.log = (msg: string) => { output += msg }

    try {
      await runLint([tempPath], options)
      console.log = originalLog

      const result = JSON.parse(output)
      expect(result.issues.length).toBeGreaterThan(0)
      expect(result.issues[0].ruleId).toBe('markdown/strong-style')
    }
    finally {
      console.log = originalLog
    }
  })
})
