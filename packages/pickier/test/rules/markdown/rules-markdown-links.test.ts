/* eslint-disable no-console */
import type { LintOptions } from '../../../src/types'
import { afterEach, describe, expect, it } from 'bun:test'
import { existsSync, unlinkSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { runLint } from '../../../src/linter'

const tempFiles: string[] = []

function createTempFile(content: string): string {
  const tempPath = resolve(__dirname, `temp-md-links-${Date.now()}-${Math.random().toString(36).substring(7)}.md`)
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

describe('MD011 - no-reversed-links', () => {
  it('should flag reversed link syntax', async () => {
    const content = `(text)[http://example.com]
`
    const tempPath = createTempFile(content)
    const configPath = createConfigWithMarkdownRules({ 'markdown/no-reversed-links': 'error' })
    const options: LintOptions = { reporter: 'json', config: configPath }

    const originalLog = console.log
    let output = ''
    console.log = (msg: string) => { output += msg }

    try {
      await runLint([tempPath], options)
      console.log = originalLog

      const result = JSON.parse(output)
      expect(result.issues.length).toBeGreaterThan(0)
      expect(result.issues[0].ruleId).toBe('markdown/no-reversed-links')
    }
    finally {
      console.log = originalLog
    }
  })
})

describe('MD034 - no-bare-urls', () => {
  it('should flag bare URLs', async () => {
    const content = `Check out http://example.com for more info.
`
    const tempPath = createTempFile(content)
    const configPath = createConfigWithMarkdownRules({ 'markdown/no-bare-urls': 'error' })
    const options: LintOptions = { reporter: 'json', config: configPath }

    const originalLog = console.log
    let output = ''
    console.log = (msg: string) => { output += msg }

    try {
      await runLint([tempPath], options)
      console.log = originalLog

      const result = JSON.parse(output)
      expect(result.issues.length).toBeGreaterThan(0)
      expect(result.issues[0].ruleId).toBe('markdown/no-bare-urls')
    }
    finally {
      console.log = originalLog
    }
  })

  it('should not flag URLs in angle brackets', async () => {
    const content = `Check out <http://example.com> for more info.
`
    const tempPath = createTempFile(content)
    const configPath = createConfigWithMarkdownRules({ 'markdown/no-bare-urls': 'error' })
    const options: LintOptions = { reporter: 'json', config: configPath }

    const originalLog = console.log
    let output = ''
    console.log = (msg: string) => { output += msg }

    try {
      await runLint([tempPath], options)
      console.log = originalLog

      const result = JSON.parse(output)
      expect(result.issues).toHaveLength(0)
    }
    finally {
      console.log = originalLog
    }
  })
})

describe('MD042 - no-empty-links', () => {
  it('should flag empty link URLs', async () => {
    const content = `[Empty link]()
`
    const tempPath = createTempFile(content)
    const configPath = createConfigWithMarkdownRules({ 'markdown/no-empty-links': 'error' })
    const options: LintOptions = { reporter: 'json', config: configPath }

    const originalLog = console.log
    let output = ''
    console.log = (msg: string) => { output += msg }

    try {
      await runLint([tempPath], options)
      console.log = originalLog

      const result = JSON.parse(output)
      expect(result.issues.length).toBeGreaterThan(0)
      expect(result.issues[0].ruleId).toBe('markdown/no-empty-links')
    }
    finally {
      console.log = originalLog
    }
  })

  it('should flag empty link text', async () => {
    const content = `[](http://example.com)
`
    const tempPath = createTempFile(content)
    const configPath = createConfigWithMarkdownRules({ 'markdown/no-empty-links': 'error' })
    const options: LintOptions = { reporter: 'json', config: configPath }

    const originalLog = console.log
    let output = ''
    console.log = (msg: string) => { output += msg }

    try {
      await runLint([tempPath], options)
      console.log = originalLog

      const result = JSON.parse(output)
      expect(result.issues.length).toBeGreaterThan(0)
      expect(result.issues[0].ruleId).toBe('markdown/no-empty-links')
    }
    finally {
      console.log = originalLog
    }
  })
})

describe('MD059 - descriptive-link-text', () => {
  it('should flag non-descriptive link text', async () => {
    const content = `[Click here](http://example.com)
`
    const tempPath = createTempFile(content)
    const configPath = createConfigWithMarkdownRules({ 'markdown/descriptive-link-text': 'warn' })
    const options: LintOptions = { reporter: 'json', config: configPath }

    const originalLog = console.log
    let output = ''
    console.log = (msg: string) => { output += msg }

    try {
      await runLint([tempPath], options)
      console.log = originalLog

      const result = JSON.parse(output)
      expect(result.issues.length).toBeGreaterThan(0)
      expect(result.issues[0].ruleId).toBe('markdown/descriptive-link-text')
    }
    finally {
      console.log = originalLog
    }
  })

  it('should not flag descriptive link text', async () => {
    const content = `[Visit the Markdown Guide](http://example.com)
`
    const tempPath = createTempFile(content)
    const configPath = createConfigWithMarkdownRules({ 'markdown/descriptive-link-text': 'warn' })
    const options: LintOptions = { reporter: 'json', config: configPath }

    const originalLog = console.log
    let output = ''
    console.log = (msg: string) => { output += msg }

    try {
      await runLint([tempPath], options)
      console.log = originalLog

      const result = JSON.parse(output)
      expect(result.issues).toHaveLength(0)
    }
    finally {
      console.log = originalLog
    }
  })
})
