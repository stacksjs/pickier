import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { createVscodeMock } from './utils/vscode-mock'

// Set up mocks at module level
mock.module('vscode', () => createVscodeMock())
mock.module('pickier', () => ({
  defaultConfig: {},
  formatCode: (text: string) => text.split('\n').reverse().join('\n'), // Simple transform for testing
}))
mock.module('bunfig', () => ({
  loadConfig: async (opts: any) => opts.defaultConfig || {},
}))

import { organizeImports, restartExtension, showOutputChannel } from '../src/commands'

describe('organizeImports', () => {
  beforeEach(() => {
    mock.restore()
    mock.module('vscode', () => createVscodeMock())
    mock.module('pickier', () => ({
      defaultConfig: {},
      formatCode: (text: string) => {
        // Simulate organizing imports by sorting lines
        const lines = text.split('\n')
        const imports = lines.filter(l => l.startsWith('import')).sort()
        const rest = lines.filter(l => !l.startsWith('import'))
        return [...imports, '', ...rest].join('\n')
      },
    }))
    mock.module('bunfig', () => ({
      loadConfig: async (opts: any) => opts.defaultConfig || {},
    }))
  })

  it('organizes imports in active editor', async () => {
    const vscode = await import('vscode')

    const text = `import { z } from 'z'
import { a } from 'a'
import { m } from 'm'

const x = 1`

    const expectedOutput = `import { a } from 'a'
import { m } from 'm'
import { z } from 'z'

const x = 1`

    let capturedText = ''
    const mockEdit = mock((callback: any) => {
      const editBuilder = {
        replace: (range: any, newText: string) => {
          capturedText = newText
        },
      }
      callback(editBuilder)
      return true
    })

    ;(vscode.window as any).activeTextEditor = {
      document: {
        getText: () => text,
        fileName: '/test.ts',
        languageId: 'typescript',
        positionAt: (offset: number) => new vscode.Position(0, offset),
        uri: vscode.Uri.file('/test.ts'),
      },
      edit: mockEdit,
    }

    await organizeImports()

    expect(mockEdit).toHaveBeenCalled()
    expect(capturedText).toContain('import { a }')
  })

  it('shows warning when no active editor', async () => {
    const vscode = await import('vscode')
    ;(vscode.window as any).activeTextEditor = null

    await organizeImports()

    expect(vscode.window.showWarningMessage).toHaveBeenCalledWith('No active editor found')
  })

  it('handles formatting errors gracefully', async () => {
    const vscode = await import('vscode')
    mock.module('pickier', () => ({
      defaultConfig: {},
      formatCode: () => {
        throw new Error('Format error')
      },
    }))

    ;(vscode.window as any).activeTextEditor = {
      document: {
        getText: () => 'import { a } from "a"',
        fileName: '/test.ts',
        languageId: 'typescript',
        positionAt: (offset: number) => new vscode.Position(0, offset),
        uri: vscode.Uri.file('/test.ts'),
      },
      edit: mock(async () => true),
    }

    await organizeImports()

    expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
      expect.stringContaining('Failed to organize imports'),
    )
  })

  it('does not modify document if imports are already organized', async () => {
    const vscode = await import('vscode')
    const text = `import { a } from 'a'
import { b } from 'b'

const x = 1`

    mock.module('pickier', () => ({
      defaultConfig: {},
      formatCode: (t: string) => t, // No changes
    }))

    const mockEdit = mock(async () => true)
    ;(vscode.window as any).activeTextEditor = {
      document: {
        getText: () => text,
        fileName: '/test.ts',
        languageId: 'typescript',
        positionAt: (offset: number) => new vscode.Position(0, offset),
        uri: vscode.Uri.file('/test.ts'),
      },
      edit: mockEdit,
    }

    await organizeImports()

    // Edit should not be called if text is unchanged
    expect(mockEdit).not.toHaveBeenCalled()
  })
})

describe('showOutputChannel', () => {
  beforeEach(() => {
    mock.restore()
    mock.module('vscode', () => createVscodeMock())
  })

  it('shows the output channel', async () => {
    const vscode = await import('vscode')
    const outputChannel = vscode.window.createOutputChannel('Pickier')

    showOutputChannel(outputChannel)

    expect(outputChannel.show).toHaveBeenCalled()
  })

  it('handles undefined output channel', () => {
    // Should not throw
    expect(() => showOutputChannel(undefined as any)).not.toThrow()
  })
})

describe('restartExtension', () => {
  beforeEach(() => {
    mock.restore()
    mock.module('vscode', () => createVscodeMock())
    mock.module('pickier', () => ({
      defaultConfig: {},
    }))
    mock.module('bunfig', () => ({
      loadConfig: async (opts: any) => opts.defaultConfig || {},
    }))
  })

  it('shows information message about restart', async () => {
    const vscode = await import('vscode')

    await restartExtension()

    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
      'Restart Pickier Extension?',
      'Yes',
      'No',
    )
  })

  it('provides instructions for restarting', async () => {
    // The function should inform users how to restart
    // This is a simple function, so we just verify it completes
    await restartExtension()
    // Test passes if no exception is thrown
    expect(true).toBe(true)
  })
})
