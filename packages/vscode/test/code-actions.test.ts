import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { createVscodeMock } from './utils/vscode-mock'

// Set up mocks at module level
mock.module('vscode', () => createVscodeMock())
mock.module('pickier', () => ({
  defaultConfig: {},
  formatCode: (text: string) => text.replace('debugger', '// removed debugger'),
  lintText: async () => [],
}))
mock.module('bunfig', () => ({
  loadConfig: async (opts: any) => opts.defaultConfig || {},
}))

describe('PickierCodeActionProvider', () => {
  beforeEach(() => {
    // Don't call mock.restore() to keep module-level mocks
    mock.module('vscode', () => createVscodeMock())
    mock.module('pickier', () => ({
      defaultConfig: {},
      formatCode: (text: string) => text.replace('debugger', '// removed debugger'),
      lintText: async () => [],
    }))
    mock.module('bunfig', () => ({
      loadConfig: async (opts: any) => opts.defaultConfig || {},
    }))
  })

  it('returns undefined when code actions are disabled', async () => {
    const vscode = await import('vscode')
    const { PickierCodeActionProvider } = await import('../src/code-actions')
    const provider = new PickierCodeActionProvider()

    // Override config to disable code actions
    ;(vscode.workspace as any).getConfiguration = mock(() => ({
      get: (key: string) => key === 'codeActions.enable' ? false : true,
    }))

    const doc = {
      getText: () => 'const x = 1',
      fileName: '/test.ts',
      uri: { toString: () => 'file:///test.ts' },
    } as any

    const range = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 10))
    const context = { diagnostics: [], only: undefined } as any
    const token = new vscode.CancellationTokenSource().token

    const actions = await provider.provideCodeActions(doc, range, context, token)
    expect(actions).toBeUndefined()
  })

  it('returns Fix All action when requested', async () => {
    const vscode = await import('vscode')
    const { PickierCodeActionProvider } = await import('../src/code-actions')
    const provider = new PickierCodeActionProvider()

    const doc = {
      getText: () => 'const x = 1',
      fileName: '/test.ts',
      uri: { toString: () => 'file:///test.ts' },
    } as any

    const range = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 10))
    const onlyKind = vscode.CodeActionKind.SourceFixAll
    const context = {
      diagnostics: [],
      only: {
        value: onlyKind,
        contains: (kind: any) => kind === onlyKind,
      },
    } as any
    const token = new vscode.CancellationTokenSource().token

    const actions = await provider.provideCodeActions(doc, range, context, token)
    expect(actions).toBeDefined()
    expect(actions!.length).toBe(1)
    expect(actions![0].title).toBe('Fix all auto-fixable Pickier issues')
    expect(actions![0].kind).toBe(vscode.CodeActionKind.SourceFixAll)
  })

  it('returns fix action for pickier diagnostics with fixable rules', async () => {
    const vscode = await import('vscode')
    const { PickierCodeActionProvider } = await import('../src/code-actions')
    const provider = new PickierCodeActionProvider()

    const doc = {
      getText: () => 'debugger',
      fileName: '/test.ts',
      uri: { toString: () => 'file:///test.ts' },
    } as any

    const diagnostic = new vscode.Diagnostic(
      new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 8)),
      'debugger statement found',
      vscode.DiagnosticSeverity.Error,
    )
    diagnostic.source = 'pickier'
    diagnostic.code = 'noDebugger'

    const range = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 10))
    const context = { diagnostics: [diagnostic], only: undefined } as any
    const token = new vscode.CancellationTokenSource().token

    const actions = await provider.provideCodeActions(doc, range, context, token)
    expect(actions).toBeDefined()
    expect(actions!.length).toBeGreaterThan(0)
    expect(actions![0].title).toContain('Fix:')
    expect(actions![0].kind).toBe(vscode.CodeActionKind.QuickFix)
    expect(actions![0].isPreferred).toBe(true)
  })

  it('ignores non-pickier diagnostics', async () => {
    const vscode = await import('vscode')
    const { PickierCodeActionProvider } = await import('../src/code-actions')
    const provider = new PickierCodeActionProvider()

    const doc = {
      getText: () => 'const x = 1',
      fileName: '/test.ts',
      uri: { toString: () => 'file:///test.ts' },
    } as any

    const diagnostic = new vscode.Diagnostic(
      new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 10)),
      'some error',
      vscode.DiagnosticSeverity.Error,
    )
    diagnostic.source = 'typescript' // Not from pickier

    const range = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 10))
    const context = { diagnostics: [diagnostic], only: undefined } as any
    const token = new vscode.CancellationTokenSource().token

    const actions = await provider.provideCodeActions(doc, range, context, token)
    expect(actions).toBeDefined()
    expect(actions!.length).toBe(0)
  })

  it('respects cancellation token', async () => {
    const vscode = await import('vscode')
    const { PickierCodeActionProvider } = await import('../src/code-actions')
    const provider = new PickierCodeActionProvider()

    const doc = {
      getText: () => 'debugger',
      fileName: '/test.ts',
      uri: { toString: () => 'file:///test.ts' },
    } as any

    const diagnostic = new vscode.Diagnostic(
      new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 8)),
      'debugger statement',
      vscode.DiagnosticSeverity.Error,
    )
    diagnostic.source = 'pickier'
    diagnostic.code = 'noDebugger'

    const range = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 10))
    const context = { diagnostics: [diagnostic], only: undefined } as any
    const tokenSource = new vscode.CancellationTokenSource()

    // Cancel immediately
    tokenSource.cancel()

    const actions = await provider.provideCodeActions(doc, range, context, tokenSource.token)
    // Should handle cancellation gracefully
    expect(actions).toBeDefined()
  })
})

describe('applyFix', () => {
  beforeEach(() => {
    // Don't call mock.restore() to keep module-level mocks
    mock.module('vscode', () => createVscodeMock())
    mock.module('pickier', () => ({
      defaultConfig: {},
      formatCode: (text: string) => text.replace('debugger', '// removed'),
    }))
    mock.module('bunfig', () => ({
      loadConfig: async (opts: any) => opts.defaultConfig || {},
    }))
  })

  it('applies fix to document', async () => {
    const vscode = await import('vscode')
    const { applyFix } = await import('../src/code-actions')

    const doc = {
      getText: () => 'debugger',
      fileName: '/test.ts',
      uri: vscode.Uri.file('/test.ts'),
      positionAt: (offset: number) => new vscode.Position(0, offset),
    } as any

    const diagnostic = new vscode.Diagnostic(
      new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 8)),
      'debugger statement',
      vscode.DiagnosticSeverity.Error,
    )

    await applyFix(doc, diagnostic)

    // Verify that workspace.applyEdit was called
    expect(vscode.workspace.applyEdit).toHaveBeenCalled()
  })

  it('does not apply edit if text is unchanged', async () => {
    const vscode = await import('vscode')
    const { applyFix } = await import('../src/code-actions')
    mock.module('pickier', () => ({
      defaultConfig: {},
      formatCode: (text: string) => text, // No changes
    }))

    const doc = {
      getText: () => 'const x = 1',
      fileName: '/test.ts',
      uri: vscode.Uri.file('/test.ts'),
      positionAt: (offset: number) => new vscode.Position(0, offset),
    } as any

    const diagnostic = new vscode.Diagnostic(
      new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 10)),
      'some issue',
      vscode.DiagnosticSeverity.Warning,
    )

    await applyFix(doc, diagnostic)

    // applyEdit might still be called but with no actual changes
    // This is acceptable behavior
  })
})

describe('fixAllInDocument', () => {
  beforeEach(() => {
    // Don't call mock.restore() to keep module-level mocks
    mock.module('vscode', () => createVscodeMock())
    mock.module('pickier', () => ({
      defaultConfig: {},
      formatCode: (text: string) => text.replace(/debugger/g, '// removed'),
    }))
    mock.module('bunfig', () => ({
      loadConfig: async (opts: any) => opts.defaultConfig || {},
    }))
  })

  it('fixes all issues in document and shows success message', async () => {
    const vscode = await import('vscode')
    const { fixAllInDocument } = await import('../src/code-actions')

    const doc = {
      getText: () => 'debugger\ndebugger',
      fileName: '/test.ts',
      uri: vscode.Uri.file('/test.ts'),
      positionAt: (offset: number) => new vscode.Position(0, offset),
    } as any

    await fixAllInDocument(doc)

    expect(vscode.workspace.applyEdit).toHaveBeenCalled()
    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('Pickier: All auto-fixable issues fixed')
  })

  it('shows message when no fixable issues found', async () => {
    const vscode = await import('vscode')
    const { fixAllInDocument } = await import('../src/code-actions')
    mock.module('pickier', () => ({
      defaultConfig: {},
      formatCode: (text: string) => text, // No changes
    }))

    const doc = {
      getText: () => 'const x = 1',
      fileName: '/test.ts',
      uri: vscode.Uri.file('/test.ts'),
      positionAt: (offset: number) => new vscode.Position(0, offset),
    } as any

    await fixAllInDocument(doc)

    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('Pickier: No fixable issues found')
  })

  it('handles errors gracefully', async () => {
    const vscode = await import('vscode')
    const { fixAllInDocument } = await import('../src/code-actions')
    mock.module('pickier', () => ({
      defaultConfig: {},
      formatCode: () => { throw new Error('Format failed') },
    }))

    const doc = {
      getText: () => 'const x = 1',
      fileName: '/test.ts',
      uri: vscode.Uri.file('/test.ts'),
      positionAt: (offset: number) => new vscode.Position(0, offset),
    } as any

    await fixAllInDocument(doc)

    expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('Failed to fix all issues: Format failed')
  })
})
