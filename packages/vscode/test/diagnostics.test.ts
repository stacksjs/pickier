import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { lintPathsToDiagnostics, PickierDiagnosticProvider } from '../src/diagnostics'

import { createVscodeMock } from './utils/vscode-mock'

// Base VS Code mock
mock.module('vscode', () => createVscodeMock())

// Default pickier mock; individual tests override as needed
mock.module('pickier', () => ({
  defaultConfig: {},
  lintText: async (text: string) => [
    { filePath: '/workspace/a.ts', line: 1, column: 1, ruleId: 'x', message: 'm', severity: 'warning' },
  ],
  runLintProgrammatic: undefined,
  runLint: async () => { console.log(JSON.stringify({ errors: 0, warnings: 1, issues: [] })) },
}))

describe('PickierDiagnosticProvider', () => {
  beforeEach(() => {
    mock.restore()
    mock.clearAllMocks()
    mock.module('vscode', () => createVscodeMock())
    mock.module('pickier', () => ({
      defaultConfig: {},
      lintText: async (text: string) => [
        { filePath: '/workspace/a.ts', line: 1, column: 1, ruleId: 'x', message: 'm', severity: 'warning' },
      ],
      runLintProgrammatic: undefined,
      runLint: async () => { console.log(JSON.stringify({ errors: 0, warnings: 1, issues: [] })) },
    }))
  })

  it('provides diagnostics via programmatic lintText', async () => {
    const vscode = await import('vscode')
    const output = vscode.window.createOutputChannel('Pickier')
    const coll = vscode.languages.createDiagnosticCollection('pickier')
    const provider = new PickierDiagnosticProvider(coll, output)

    const doc = { getText: () => 'code', fileName: '/workspace/a.ts', languageId: 'typescript', uri: { fsPath: '/workspace/a.ts', toString: () => 'file:///workspace/a.ts' } } as any
    await provider.provideDiagnostics(doc)

    expect(coll.set).toHaveBeenCalled()
  })

  it('respects cancellation', async () => {
    mock.module('pickier', () => ({
      defaultConfig: {},
      lintText: async () => new Promise(resolve => setTimeout(() => resolve([]), 50)),
    }))
    const vscode = await import('vscode')
    const output = vscode.window.createOutputChannel('Pickier')
    const coll = vscode.languages.createDiagnosticCollection('pickier')
    const provider = new PickierDiagnosticProvider(coll, output)

    const cts = new vscode.CancellationTokenSource()
    const doc = { getText: () => 'code', fileName: '/workspace/a.ts', languageId: 'typescript', uri: { fsPath: '/workspace/a.ts', toString: () => 'file:///workspace/a.ts' } } as any
    const p = provider.provideDiagnostics(doc, cts.token)
    cts.cancel()
    await p
    // set may or may not be called depending on cancellation timing; but delete should have been called initially
    expect(coll.delete).toHaveBeenCalled()
  })
})

describe('lintPathsToDiagnostics', () => {
  beforeEach(() => {
    mock.restore()
    mock.clearAllMocks()
    mock.module('vscode', () => {
      const { createVscodeMock } = require('./utils/vscode-mock')
      return createVscodeMock()
    })
  })

  it('uses runLintProgrammatic when available', async () => {
    mock.module('pickier', () => ({
      runLintProgrammatic: async () => ({ errors: 0, warnings: 0, issues: [
        { filePath: '/workspace/a.ts', line: 1, column: 1, ruleId: 'r', message: 'm', severity: 'error' },
      ] }),
      runLint: async () => { console.log(JSON.stringify({ errors: 0, warnings: 0, issues: [] })) },
    }))
    const vscode = await import('vscode')
    const out = vscode.window.createOutputChannel('Pickier')
    const res = await lintPathsToDiagnostics(['/workspace'], out)
    expect(Object.keys(res)).toContain('/workspace/a.ts')
    expect(res['/workspace/a.ts'][0].message).toBe('m')
  })

  it('falls back to runLint and parses JSON', async () => {
    mock.module('pickier', () => ({
      runLint: async () => {
        console.log(JSON.stringify({ errors: 0, warnings: 0, issues: [
          { filePath: '/workspace/a.ts', line: 1, column: 1, ruleId: 'r', message: 'm', severity: 'warning' },
        ] }))
      },
    }))
    const vscode = await import('vscode')
    const out = vscode.window.createOutputChannel('Pickier')
    const res = await lintPathsToDiagnostics(['/workspace'], out)
    expect(Object.keys(res)).toContain('/workspace/a.ts')
    expect(res['/workspace/a.ts'][0].message).toBe('m')
  })
})
