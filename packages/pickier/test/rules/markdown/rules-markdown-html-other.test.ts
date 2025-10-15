/* eslint-disable no-console */
import type { LintOptions } from '../../../src/types'
import { afterEach, describe, expect, it } from 'bun:test'
import { existsSync, unlinkSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { runLint } from '../../../src/linter'

const tempFiles: string[] = []

function createTempFile(content: string): string {
  const tempPath = resolve(__dirname, `temp-md-html-${Date.now()}-${Math.random().toString(36).substring(7)}.md`)
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

describe('MD033 - no-inline-html', () => {
  it('should flag inline HTML', async () => {
    const content = `<div>HTML content</div>
`
    const tempPath = createTempFile(content)
    const configPath = createConfigWithMarkdownRules({ 'markdown/no-inline-html': 'warn' })
    const options: LintOptions = { reporter: 'json', config: configPath }

    const originalLog = console.log
    let output = ''
    console.log = (msg: string) => { output += msg }

    try {
      await runLint([tempPath], options)
      console.log = originalLog

      const result = JSON.parse(output)
      expect(result.issues.length).toBeGreaterThan(0)
      expect(result.issues[0].ruleId).toBe('markdown/no-inline-html')
    }
    finally {
      console.log = originalLog
    }
  })
})

describe('MD041 - first-line-heading', () => {
  it('should flag file not starting with h1', async () => {
    const content = `Some text before heading

# Heading
`
    const tempPath = createTempFile(content)
    const configPath = createConfigWithMarkdownRules({ 'markdown/first-line-heading': 'warn' })
    const options: LintOptions = { reporter: 'json', config: configPath }

    const originalLog = console.log
    let output = ''
    console.log = (msg: string) => { output += msg }

    try {
      await runLint([tempPath], options)
      console.log = originalLog

      const result = JSON.parse(output)
      expect(result.issues.length).toBeGreaterThan(0)
      expect(result.issues[0].ruleId).toBe('markdown/first-line-heading')
    }
    finally {
      console.log = originalLog
    }
  })

  it('should not flag file starting with h1', async () => {
    const content = `# First Heading

Content here.
`
    const tempPath = createTempFile(content)
    const configPath = createConfigWithMarkdownRules({ 'markdown/first-line-heading': 'warn' })
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

describe('MD045 - no-alt-text', () => {
  it('should flag images without alt text', async () => {
    const content = `![](image.png)
`
    const tempPath = createTempFile(content)
    const configPath = createConfigWithMarkdownRules({ 'markdown/no-alt-text': 'error' })
    const options: LintOptions = { reporter: 'json', config: configPath }

    const originalLog = console.log
    let output = ''
    console.log = (msg: string) => { output += msg }

    try {
      await runLint([tempPath], options)
      console.log = originalLog

      const result = JSON.parse(output)
      expect(result.issues.length).toBeGreaterThan(0)
      expect(result.issues[0].ruleId).toBe('markdown/no-alt-text')
    }
    finally {
      console.log = originalLog
    }
  })

  it('should not flag images with alt text', async () => {
    const content = `![Description](image.png)
`
    const tempPath = createTempFile(content)
    const configPath = createConfigWithMarkdownRules({ 'markdown/no-alt-text': 'error' })
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
