// Mock vscode module for testing
import { mock } from 'bun:test'

// Create comprehensive VS Code API mock
const mockVSCode: any = {
  // Enums and constants
  StatusBarAlignment: {
    Left: 1,
    Right: 2,
  },
  DiagnosticSeverity: {
    Error: 0,
    Warning: 1,
    Information: 2,
    Hint: 3,
  },

  // Classes
  Range: class Range {
    constructor(public start: any, public end: any) {}

    isEmpty = false
    isSingleLine = true
    contains = () => false
    intersection = () => undefined
    isEqual = () => false
    union = () => new Range(this.start, this.end)
    with = () => new Range(this.start, this.end)
  },

  Position: class Position {
    constructor(public line: number, public character: number) {}

    compareTo = () => 0
    isAfter = () => false
    isAfterOrEqual = () => false
    isBefore = () => false
    isBeforeOrEqual = () => false
    isEqual = () => false
    translate = () => this
    with = () => this
  },

  Diagnostic: class Diagnostic {
    constructor(
      public range: any,
      public message: string,
      public severity: number = 0,
    ) {}

    source = ''
    code = ''
  },

  TextEdit: {
    replace: (range: any, text: string) => ({ range, newText: text }),
  },

  Uri: {
    file: (path: string) => ({ fsPath: path }),
  },

  // VS Code API modules
  window: {
    showInformationMessage: mock(() => Promise.resolve()),
    showWarningMessage: mock(() => Promise.resolve()),
    showErrorMessage: mock(() => Promise.resolve()),
    createOutputChannel: mock(() => ({
      appendLine: mock(() => {}),
      show: mock(() => {}),
      dispose: mock(() => {}),
    })),
    createStatusBarItem: mock(() => ({
      text: '',
      tooltip: '',
      command: '',
      show: mock(() => {}),
      hide: mock(() => {}),
      dispose: mock(() => {}),
    })),
    activeTextEditor: undefined,
    visibleTextEditors: [],
    onDidChangeActiveTextEditor: mock(() => ({ dispose: () => {} })),
  },

  workspace: {
    getConfiguration: mock(() => ({
      get: mock((key: string, defaultValue?: any) => {
        const configs: Record<string, any> = {
          'pickier.enable': true,
          'pickier.formatOnSave': false,
          'pickier.lintOnSave': true,
          'pickier.showOutputChannel': false,
          'pickier.configPath': '',
          'enable': true,
          'formatOnSave': false,
          'lintOnSave': true,
          'showOutputChannel': false,
          'configPath': '',
        }
        return configs[key] ?? defaultValue
      }),
    })),
    workspaceFolders: [{
      uri: { fsPath: '/test/workspace' },
      name: 'test-workspace',
      index: 0,
    }],
    onDidSaveTextDocument: mock(() => ({ dispose: () => {} })),
    onDidChangeTextDocument: mock(() => ({ dispose: () => {} })),
  },

  languages: {
    createDiagnosticCollection: mock(() => ({
      set: mock(() => {}),
      delete: mock(() => {}),
      dispose: mock(() => {}),
    })),
    registerDocumentFormattingEditProvider: mock(() => ({ dispose: () => {} })),
    registerDocumentRangeFormattingEditProvider: mock(() => ({ dispose: () => {} })),
  },

  commands: {
    registerCommand: mock(() => ({ dispose: () => {} })),
    getCommands: mock(() => Promise.resolve([
      'pickier.format',
      'pickier.formatSelection',
      'pickier.lint',
      'pickier.lintWorkspace',
    ])),
  },

  extensions: {
    getExtension: mock(() => ({
      isActive: true,
      activate: mock(() => Promise.resolve()),
    })),
  },
}

// Mock the vscode module
mock.module('vscode', () => mockVSCode)

// Export for use in tests
export default mockVSCode
