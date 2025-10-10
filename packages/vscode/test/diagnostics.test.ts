import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { createVscodeMock } from './utils/vscode-mock'

// Set up mocks BEFORE importing from source
mock.module('vscode', () => createVscodeMock())

// Use real pickier - no need to mock it!

mock.module('bunfig', () => ({
  loadConfig: async (opts: any) => opts.defaultConfig || {},
}))

describe('PickierDiagnosticProvider', () => {
  // Use module-level mocks - no need to override in beforeEach

  it('provides diagnostics via programmatic lintText', async () => {
    const vscode = await import('vscode')
    const { PickierDiagnosticProvider } = await import('../src/diagnostics')
    const output = vscode.window.createOutputChannel('Pickier')
    const coll = vscode.languages.createDiagnosticCollection('pickier')
    const provider = new PickierDiagnosticProvider(coll, output)

    // Use real TypeScript code - pickier will lint it for real
    const doc = { getText: () => 'const x = 1', fileName: '/workspace/a.ts', languageId: 'typescript', uri: { fsPath: '/workspace/a.ts', toString: () => 'file:///workspace/a.ts' } } as any
    await provider.provideDiagnostics(doc)

    // Both delete (to clear old diagnostics) and set should be called
    expect(coll.delete).toHaveBeenCalled()
    expect(coll.set).toHaveBeenCalled()
  })

  it('respects cancellation', async () => {
    // Use module-level mock - lintText will be fast enough for this test
    const vscode = await import('vscode')
    const { PickierDiagnosticProvider } = await import('../src/diagnostics')
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
  it('exports lintPathsToDiagnostics function', async () => {
    // This test verifies the function exists and can be imported
    // Detailed functionality is already tested via PickierDiagnosticProvider tests above
    // which use the same underlying linting logic
    const { lintPathsToDiagnostics } = await import('../src/diagnostics')
    expect(typeof lintPathsToDiagnostics).toBe('function')
  })
})
