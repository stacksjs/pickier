import { describe, expect, it, beforeEach, afterEach, mock } from 'bun:test'
import { PickierFormattingProvider } from '../src/formatter'
import * as vscode from 'vscode'

// Mock VS Code classes
class MockTextDocument implements Partial<vscode.TextDocument> {
  constructor(
    public fileName: string,
    public languageId: string,
    private content: string
  ) {}

  getText(range?: vscode.Range): string {
    if (range) {
      // For simplicity, return the full content in tests
      return this.content
    }
    return this.content
  }

  positionAt(offset: number): vscode.Position {
    return new vscode.Position(0, offset)
  }
}

class MockRange implements vscode.Range {
  constructor(
    public start: vscode.Position,
    public end: vscode.Position
  ) {}

  isEmpty = false
  isSingleLine = true
  contains = () => false
  intersection = () => undefined
  union = () => this
  with = () => this
}

class MockPosition implements vscode.Position {
  constructor(
    public line: number,
    public character: number
  ) {}

  compareTo = () => 0
  isAfter = () => false
  isAfterOrEqual = () => false
  isBefore = () => false
  isBeforeOrEqual = () => false
  isEqual = () => false
  translate = () => this
  with = () => this
}

class MockCancellationToken implements vscode.CancellationToken {
  isCancellationRequested = false
  onCancellationRequested = () => ({ dispose: () => {} })
}

class MockFormattingOptions implements vscode.FormattingOptions {
  tabSize = 2
  insertSpaces = true
}

// Mock pickier module
const mockPickier = {
  formatCode: mock((content: string, config: any, fileName: string) => {
    // Simple mock formatter that adds a newline if missing
    return content.endsWith('\n') ? content : content + '\n'
  }),
  defaultConfig: {
    verbose: false,
    ignores: ['**/node_modules/**'],
    lint: {
      extensions: ['ts', 'js'],
      reporter: 'stylish',
      cache: false,
      maxWarnings: -1,
    },
    format: {
      extensions: ['ts', 'js'],
      trimTrailingWhitespace: true,
      maxConsecutiveBlankLines: 1,
      finalNewline: 'one',
      indent: 2,
      quotes: 'single',
      semi: false,
    },
    rules: {
      noDebugger: 'error',
      noConsole: 'warn',
    },
  }
}

// Override the pickier import for testing
mock.module('pickier', () => mockPickier)

describe('PickierFormattingProvider', () => {
  let provider: PickierFormattingProvider
  let mockDocument: MockTextDocument
  let mockOptions: MockFormattingOptions
  let mockToken: MockCancellationToken

  beforeEach(() => {
    provider = new PickierFormattingProvider()
    mockDocument = new MockTextDocument('test.ts', 'typescript', 'const x = 1')
    mockOptions = new MockFormattingOptions()
    mockToken = new MockCancellationToken()
  })

  afterEach(() => {
    mock.restore()
  })

  it('should provide document formatting edits', async () => {
    const edits = await provider.provideDocumentFormattingEdits(
      mockDocument as vscode.TextDocument,
      mockOptions,
      mockToken
    )

    expect(Array.isArray(edits)).toBe(true)
  })

  it('should return empty array when content is already formatted', async () => {
    mockDocument = new MockTextDocument('test.ts', 'typescript', 'const x = 1\n')
    
    const edits = await provider.provideDocumentFormattingEdits(
      mockDocument as vscode.TextDocument,
      mockOptions,
      mockToken
    )

    expect(edits).toEqual([])
  })

  it('should return edit when content needs formatting', async () => {
    mockDocument = new MockTextDocument('test.ts', 'typescript', 'const x = 1')
    
    const edits = await provider.provideDocumentFormattingEdits(
      mockDocument as vscode.TextDocument,
      mockOptions,
      mockToken
    )

    expect(edits.length).toBeGreaterThan(0)
  })

  it('should handle cancellation token', async () => {
    mockToken.isCancellationRequested = true
    
    const edits = await provider.provideDocumentFormattingEdits(
      mockDocument as vscode.TextDocument,
      mockOptions,
      mockToken
    )

    expect(edits).toEqual([])
  })

  it('should provide range formatting edits', async () => {
    const range = new MockRange(
      new MockPosition(0, 0),
      new MockPosition(0, 10)
    )
    
    const edits = await provider.provideDocumentRangeFormattingEdits(
      mockDocument as vscode.TextDocument,
      range as vscode.Range,
      mockOptions,
      mockToken
    )

    expect(Array.isArray(edits)).toBe(true)
  })

  it('should handle formatting errors gracefully', async () => {
    // Mock formatCode to throw an error
    mockPickier.formatCode.mockImplementation(() => {
      throw new Error('Formatting error')
    })

    const edits = await provider.provideDocumentFormattingEdits(
      mockDocument as vscode.TextDocument,
      mockOptions,
      mockToken
    )

    expect(edits).toEqual([])
  })

  it('should use correct file name for formatting', async () => {
    mockDocument = new MockTextDocument('test.js', 'javascript', 'const x = 1')
    
    await provider.provideDocumentFormattingEdits(
      mockDocument as vscode.TextDocument,
      mockOptions,
      mockToken
    )

    expect(mockPickier.formatCode).toHaveBeenCalledWith(
      'const x = 1',
      expect.any(Object),
      'test.js'
    )
  })
})
