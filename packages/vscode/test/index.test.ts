import { describe, expect, it, mock } from 'bun:test'
import { createVscodeMock } from './utils/vscode-mock'

mock.module('vscode', () => createVscodeMock())

mock.module('pickier', () => ({
  defaultConfig: {},
  formatCode: (t: string) => t,
  lintText: async () => [],
  runLintProgrammatic: async () => ({ errors: 0, warnings: 0, issues: [] }),
  runLint: async () => { console.log(JSON.stringify({ errors: 0, warnings: 0, issues: [] })) },
}))

mock.module('bunfig', () => ({
  loadConfig: async (opts: any) => opts.defaultConfig || {},
}))

describe('index exports', () => {
  it('re-exports expected modules', async () => {
    const mod = await import('../src')
    expect(typeof mod.PickierFormattingProvider).toBe('function')
    expect(typeof mod.PickierDiagnosticProvider).toBe('function')
    expect(typeof mod.PickierCodeActionProvider).toBe('function')
    expect(typeof mod.activate).toBe('function')
    expect(typeof mod.deactivate).toBe('function')
    expect(typeof mod.PickierStatusBar).toBe('function')
    expect(typeof mod.getPickierConfig).toBe('function')
    expect(typeof mod.organizeImports).toBe('function')
  })
})
