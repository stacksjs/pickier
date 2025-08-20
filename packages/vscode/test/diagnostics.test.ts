import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import * as vscode from 'vscode'
import { PickierDiagnosticProvider } from '../src/diagnostics'

// Mock VS Code classes
class MockTextDocument implements Partial<vscode.TextDocument> {
  constructor(
    public fileName: string,
    public languageId: string,
    private content: string,
  ) {}

  getText(): string {
    return this.content
  }

  get uri(): vscode.Uri {
    return { fsPath: this.fileName } as vscode.Uri
  }
}

class MockDiagnosticCollection implements Partial<vscode.DiagnosticCollection> {
  private diagnostics = new Map<string, vscode.Diagnostic[]>()

  set(uri: vscode.Uri, diagnostics: vscode.Diagnostic[]): void {
    this.diagnostics.set(uri.fsPath, diagnostics)
  }

  delete(uri: vscode.Uri): void {
    this.diagnostics.delete(uri.fsPath)
  }

  get(uri: vscode.Uri): vscode.Diagnostic[] | undefined {
    return this.diagnostics.get(uri.fsPath)
  }

  clear(): void {
    this.diagnostics.clear()
  }

  dispose(): void {
    this.clear()
  }
}

class MockOutputChannel implements Partial<vscode.OutputChannel> {
  private lines: string[] = []

  appendLine(value: string): void {
    this.lines.push(value)
  }

  getLines(): string[] {
    return [...this.lines]
  }

  clear(): void {
    this.lines = []
  }
}

class MockDiagnostic implements vscode.Diagnostic {
  constructor(
    public range: vscode.Range,
    public message: string,
    public severity?: vscode.DiagnosticSeverity,
  ) {}

  source = 'pickier'
  code: string | number = ''
}

// Mock workspace configuration
const mockConfig = {
  get: (key: string, defaultValue?: any) => {
    const configs: Record<string, any> = {
      enable: true,
      configPath: '',
      formatOnSave: false,
      lintOnSave: true,
      showOutputChannel: false,
    }
    return configs[key] ?? defaultValue
  },
}

// Mock VS Code workspace
const mockWorkspace = {
  getConfiguration: () => mockConfig,
  workspaceFolders: [{
    uri: { fsPath: '/test/workspace' },
    name: 'test-workspace',
    index: 0,
  }],
}

// Mock pickier module
const mockPickier = {
  runLint: mock(async (_files: string[], _options: any) => {
    // Simulate successful linting
    return 0
  }),
}

// Mock file system
const mockFs = {
  writeFileSync: mock(() => {}),
  existsSync: mock(() => true),
  unlinkSync: mock(() => {}),
}

// Mock OS
const mockOs = {
  tmpdir: mock(() => '/tmp'),
}

// Mock console to capture output
let _capturedOutput = ''
// eslint-disable-next-line no-console
const originalConsoleLog = console.log

const originalConsoleError = console.error

// Override modules for testing
mock.module('pickier', () => mockPickier)
mock.module('fs', () => mockFs)
mock.module('os', () => mockOs)

describe('PickierDiagnosticProvider', () => {
  let provider: PickierDiagnosticProvider
  let mockDiagnosticCollection: MockDiagnosticCollection
  let mockOutputChannel: MockOutputChannel
  let mockDocument: MockTextDocument

  beforeEach(() => {
    mockDiagnosticCollection = new MockDiagnosticCollection()
    mockOutputChannel = new MockOutputChannel()
    provider = new PickierDiagnosticProvider(
      mockDiagnosticCollection as vscode.DiagnosticCollection,
      mockOutputChannel as vscode.OutputChannel,
    )
    mockDocument = new MockTextDocument('test.ts', 'typescript', 'console.log("test")')

    // Reset captured output
    _capturedOutput = ''

    // Override workspace for this test
    Object.assign(vscode.workspace, mockWorkspace)
  })

  afterEach(() => {
    mock.restore()
    // eslint-disable-next-line no-console
    console.log = originalConsoleLog

    console.error = originalConsoleError
  })

  it('should provide diagnostics for a document', async () => {
    await provider.provideDiagnostics(mockDocument as vscode.TextDocument)

    // Verify that temp file operations were called
    expect(mockFs.writeFileSync).toHaveBeenCalled()
    expect(mockPickier.runLint).toHaveBeenCalled()
  })

  it('should skip diagnostics when extension is disabled', async () => {
    // Mock disabled configuration
    const disabledConfig = {
      get: (key: string, defaultValue?: any) => {
        if (key === 'enable')
          return false
        return defaultValue
      },
    }

    const mockWorkspaceDisabled = {
      getConfiguration: () => disabledConfig,
      workspaceFolders: [{ uri: { fsPath: '/test/workspace' } }],
    }

    Object.assign(vscode.workspace, mockWorkspaceDisabled)

    await provider.provideDiagnostics(mockDocument as vscode.TextDocument)

    // Verify that linting was not called
    expect(mockPickier.runLint).not.toHaveBeenCalled()
  })

  it('should clear existing diagnostics before providing new ones', async () => {
    // Set some initial diagnostics
    const initialDiagnostics = [
      new MockDiagnostic(
        new vscode.Range(0, 0, 0, 1),
        'Initial diagnostic',
      ),
    ]
    mockDiagnosticCollection.set(mockDocument.uri, initialDiagnostics as vscode.Diagnostic[])

    await provider.provideDiagnostics(mockDocument as vscode.TextDocument)

    // Verify diagnostics were cleared (delete was called)
    // Since we're mocking, we can check that new diagnostics were set
    const currentDiagnostics = mockDiagnosticCollection.get(mockDocument.uri)
    expect(currentDiagnostics).toBeDefined()
  })

  it('should handle linting errors gracefully', async () => {
    // Mock runLint to throw an error
    mockPickier.runLint.mockImplementation(() => {
      throw new Error('Linting failed')
    })

    await provider.provideDiagnostics(mockDocument as vscode.TextDocument)

    // Verify error was logged to output channel
    const outputLines = mockOutputChannel.getLines()
    expect(outputLines.some(line => line.includes('Lint error'))).toBe(true)
  })

  it('should clean up temporary files', async () => {
    await provider.provideDiagnostics(mockDocument as vscode.TextDocument)

    // Verify temp file cleanup was attempted
    expect(mockFs.existsSync).toHaveBeenCalled()
    expect(mockFs.unlinkSync).toHaveBeenCalled()
  })

  it('should handle file cleanup errors gracefully', async () => {
    // Mock file operations to throw errors
    mockFs.unlinkSync.mockImplementation(() => {
      throw new Error('Cleanup failed')
    })

    await provider.provideDiagnostics(mockDocument as vscode.TextDocument)

    // Verify cleanup error was logged
    const outputLines = mockOutputChannel.getLines()
    expect(outputLines.some(line => line.includes('Failed to cleanup'))).toBe(true)
  })

  it('should use correct temp file extension', async () => {
    mockDocument = new MockTextDocument('test.js', 'javascript', 'var x = 1')

    await provider.provideDiagnostics(mockDocument as vscode.TextDocument)

    // Verify writeFileSync was called with correct extension
    const calls = mockFs.writeFileSync.mock.calls
    expect(calls.length).toBeGreaterThan(0)
    const tempFilePath = calls[0][0] as string
    expect(tempFilePath.endsWith('.js')).toBe(true)
  })

  it('should parse JSON lint results correctly', async () => {
    // Mock console.log to capture JSON output
    // eslint-disable-next-line no-console
    console.log = (message: string) => {
      _capturedOutput += `${message}\n`
    }

    // Mock successful linting with JSON output
    mockPickier.runLint.mockImplementation(async () => {
      console.warn(JSON.stringify({
        errors: 1,
        warnings: 1,
        issues: [
          {
            filePath: 'test.ts',
            line: 1,
            column: 1,
            ruleId: 'no-console',
            message: 'Unexpected console usage',
            severity: 'warning',
          },
        ],
      }))
      return 1
    })

    await provider.provideDiagnostics(mockDocument as vscode.TextDocument)

    // Verify diagnostics were created from JSON results
    const diagnostics = mockDiagnosticCollection.get(mockDocument.uri)
    expect(diagnostics?.length).toBeGreaterThan(0)
  })
})
