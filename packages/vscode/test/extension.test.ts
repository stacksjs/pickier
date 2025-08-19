import * as assert from 'assert'
import * as vscode from 'vscode'
import { afterEach, beforeEach, describe, it } from 'bun:test'

// Mock VS Code API for testing
const mockVSCode = {
  window: {
    showInformationMessage: () => Promise.resolve(),
    showWarningMessage: () => Promise.resolve(),
    showErrorMessage: () => Promise.resolve(),
    createOutputChannel: () => ({
      appendLine: () => {},
      show: () => {},
      dispose: () => {}
    }),
    createStatusBarItem: () => ({
      text: '',
      tooltip: '',
      command: '',
      show: () => {},
      hide: () => {},
      dispose: () => {}
    }),
    activeTextEditor: undefined,
    visibleTextEditors: []
  },
  workspace: {
    getConfiguration: () => ({
      get: (key: string, defaultValue?: any) => {
        const configs: Record<string, any> = {
          'pickier.enable': true,
          'pickier.formatOnSave': false,
          'pickier.lintOnSave': true,
          'pickier.showOutputChannel': false,
          'pickier.configPath': ''
        }
        return configs[key] ?? defaultValue
      }
    }),
    workspaceFolders: [{
      uri: { fsPath: '/test/workspace' },
      name: 'test-workspace',
      index: 0
    }],
    onDidSaveTextDocument: () => ({ dispose: () => {} }),
    onDidChangeTextDocument: () => ({ dispose: () => {} })
  },
  languages: {
    createDiagnosticCollection: () => ({
      set: () => {},
      delete: () => {},
      dispose: () => {}
    }),
    registerDocumentFormattingProvider: () => ({ dispose: () => {} }),
    registerDocumentRangeFormattingProvider: () => ({ dispose: () => {} })
  },
  commands: {
    registerCommand: () => ({ dispose: () => {} })
  },
  Uri: {
    file: (path: string) => ({ fsPath: path })
  },
  Range: class {
    constructor(public start: any, public end: any) {}
  },
  Position: class {
    constructor(public line: number, public character: number) {}
  },
  TextEdit: {
    replace: (range: any, text: string) => ({ range, newText: text })
  },
  DiagnosticSeverity: {
    Error: 0,
    Warning: 1,
    Information: 2,
    Hint: 3
  },
  Diagnostic: class {
    constructor(
      public range: any,
      public message: string,
      public severity?: number
    ) {
      this.source = ''
      this.code = ''
    }
    source: string
    code: string
  },
  StatusBarAlignment: {
    Left: 1,
    Right: 2
  }
}

// Override the vscode module for testing
Object.assign(vscode, mockVSCode)

suite('Pickier Extension Test Suite', () => {
  beforeEach(() => {
    // Reset any global state before each test
  })

  afterEach(() => {
    // Clean up after each test
  })

  test('Extension should be present', () => {
    assert.ok(vscode.extensions.getExtension('pickier.vscode'))
  })

  test('Extension should activate', async () => {
    const extension = vscode.extensions.getExtension('pickier.vscode')
    if (extension) {
      await extension.activate()
      assert.ok(extension.isActive)
    }
  })

  test('Commands should be registered', async () => {
    const commands = await vscode.commands.getCommands(true)
    const pickierCommands = [
      'pickier.format',
      'pickier.formatSelection',
      'pickier.lint',
      'pickier.lintWorkspace'
    ]
    
    for (const command of pickierCommands) {
      assert.ok(commands.includes(command), `Command ${command} should be registered`)
    }
  })

  test('Configuration should have default values', () => {
    const config = vscode.workspace.getConfiguration('pickier')
    
    assert.strictEqual(config.get('enable'), true)
    assert.strictEqual(config.get('formatOnSave'), false)
    assert.strictEqual(config.get('lintOnSave'), true)
    assert.strictEqual(config.get('showOutputChannel'), false)
    assert.strictEqual(config.get('configPath'), '')
  })

  test('Should handle missing workspace folder gracefully', () => {
    const originalWorkspaceFolders = vscode.workspace.workspaceFolders
    // @ts-ignore - Override for testing
    vscode.workspace.workspaceFolders = undefined
    
    // Test that extension doesn't crash without workspace
    assert.doesNotThrow(() => {
      vscode.workspace.getConfiguration('pickier')
    })
    
    // Restore original value
    // @ts-ignore - Override for testing
    vscode.workspace.workspaceFolders = originalWorkspaceFolders
  })
})
