import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import * as vscode from 'vscode'
import { PickierStatusBar } from '../src/statusBar'

// Mock VS Code StatusBarItem
class MockStatusBarItem implements Partial<vscode.StatusBarItem> {
  text = ''
  tooltip = ''
  command: string | vscode.Command | undefined = ''
  isVisible = false

  show(): void {
    this.isVisible = true
  }

  hide(): void {
    this.isVisible = false
  }

  dispose(): void {
    this.isVisible = false
  }
}

// Mock VS Code TextDocument
class MockTextDocument implements Partial<vscode.TextDocument> {
  constructor(
    public fileName: string,
    public languageId: string,
  ) {}

  get uri(): vscode.Uri {
    return { fsPath: this.fileName } as vscode.Uri
  }
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

// Mock VS Code window
const mockWindow = {
  createStatusBarItem: () => new MockStatusBarItem(),
}

// Mock VS Code workspace
const mockWorkspace = {
  getConfiguration: () => mockConfig,
}

describe('PickierStatusBar', () => {
  let statusBar: PickierStatusBar
  let mockStatusBarItem: MockStatusBarItem

  beforeEach(() => {
    // Override VS Code APIs for testing
    Object.assign(vscode.window, mockWindow)
    Object.assign(vscode.workspace, mockWorkspace)

    statusBar = new PickierStatusBar()
    // Get the mock item that was created
    mockStatusBarItem = (statusBar as any).statusBarItem
  })

  afterEach(() => {
    statusBar.dispose()
    mock.restore()
  })

  it('should create status bar item with correct properties', () => {
    expect(mockStatusBarItem.command).toBe('pickier.lint')
    expect(mockStatusBarItem.isVisible).toBe(true)
  })

  it('should update status bar for supported languages', () => {
    const document = new MockTextDocument('test.ts', 'typescript')

    statusBar.update(document as vscode.TextDocument)

    expect(mockStatusBarItem.text).toBe('$(check) Pickier')
    expect(mockStatusBarItem.tooltip).toBe('Pickier is active. Click to lint current file.')
    expect(mockStatusBarItem.isVisible).toBe(true)
  })

  it('should hide status bar for unsupported languages', () => {
    const document = new MockTextDocument('test.py', 'python')

    statusBar.update(document as vscode.TextDocument)

    expect(mockStatusBarItem.isVisible).toBe(false)
  })

  it('should show status bar for all supported languages', () => {
    const supportedLanguages = [
      'typescript',
      'javascript',
      'json',
      'jsonc',
      'html',
      'css',
      'markdown',
      'yaml',
    ]

    for (const language of supportedLanguages) {
      const document = new MockTextDocument(`test.${language}`, language)

      statusBar.update(document as vscode.TextDocument)

      expect(mockStatusBarItem.isVisible).toBe(true)
      expect(mockStatusBarItem.text).toBe('$(check) Pickier')
    }
  })

  it('should hide status bar when extension is disabled', () => {
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
    }

    Object.assign(vscode.workspace, mockWorkspaceDisabled)

    const document = new MockTextDocument('test.ts', 'typescript')
    statusBar.update(document as vscode.TextDocument)

    expect(mockStatusBarItem.isVisible).toBe(false)
  })

  it('should show error state correctly', () => {
    const errorMessage = 'Test error message'

    statusBar.showError(errorMessage)

    expect(mockStatusBarItem.text).toBe('$(error) Pickier')
    expect(mockStatusBarItem.tooltip).toBe(`Pickier error: ${errorMessage}`)
    expect(mockStatusBarItem.isVisible).toBe(true)
  })

  it('should show working state correctly', () => {
    statusBar.showWorking()

    expect(mockStatusBarItem.text).toBe('$(sync~spin) Pickier')
    expect(mockStatusBarItem.tooltip).toBe('Pickier is working...')
    expect(mockStatusBarItem.isVisible).toBe(true)
  })

  it('should dispose status bar item correctly', () => {
    expect(mockStatusBarItem.isVisible).toBe(true)

    statusBar.dispose()

    expect(mockStatusBarItem.isVisible).toBe(false)
  })

  it('should handle document with different file extensions', () => {
    const testCases = [
      { fileName: 'test.ts', languageId: 'typescript', shouldShow: true },
      { fileName: 'test.tsx', languageId: 'typescript', shouldShow: true },
      { fileName: 'test.js', languageId: 'javascript', shouldShow: true },
      { fileName: 'test.jsx', languageId: 'javascript', shouldShow: true },
      { fileName: 'test.json', languageId: 'json', shouldShow: true },
      { fileName: 'test.jsonc', languageId: 'jsonc', shouldShow: true },
      { fileName: 'test.html', languageId: 'html', shouldShow: true },
      { fileName: 'test.css', languageId: 'css', shouldShow: true },
      { fileName: 'test.md', languageId: 'markdown', shouldShow: true },
      { fileName: 'test.yaml', languageId: 'yaml', shouldShow: true },
      { fileName: 'test.yml', languageId: 'yaml', shouldShow: true },
      { fileName: 'test.py', languageId: 'python', shouldShow: false },
      { fileName: 'test.go', languageId: 'go', shouldShow: false },
    ]

    for (const testCase of testCases) {
      const document = new MockTextDocument(testCase.fileName, testCase.languageId)

      statusBar.update(document as vscode.TextDocument)

      if (testCase.shouldShow) {
        expect(mockStatusBarItem.isVisible).toBe(true)
        expect(mockStatusBarItem.text).toBe('$(check) Pickier')
      }
      else {
        expect(mockStatusBarItem.isVisible).toBe(false)
      }
    }
  })

  it('should maintain state consistency across updates', () => {
    const tsDocument = new MockTextDocument('test.ts', 'typescript')
    const pyDocument = new MockTextDocument('test.py', 'python')

    // Start with TypeScript document
    statusBar.update(tsDocument as vscode.TextDocument)
    expect(mockStatusBarItem.isVisible).toBe(true)

    // Switch to Python document
    statusBar.update(pyDocument as vscode.TextDocument)
    expect(mockStatusBarItem.isVisible).toBe(false)

    // Switch back to TypeScript document
    statusBar.update(tsDocument as vscode.TextDocument)
    expect(mockStatusBarItem.isVisible).toBe(true)
    expect(mockStatusBarItem.text).toBe('$(check) Pickier')
  })
})
