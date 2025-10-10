import { mock } from 'bun:test'
import { EventEmitter } from 'node:events'

export function createVscodeMock(overrides: Partial<any> = {}): any {
  // Simple event emitter helpers to simulate VS Code event API
  const makeEvent = <T = any>() => {
    const emitter = new EventEmitter()
    const event = (listener: (e: T) => any) => {
      emitter.on('event', listener)
      return {
        dispose() {
          emitter.removeListener('event', listener)
        },
      }
    }
    return { emitter, event }
  }

  // CancellationToken and source
  class CancellationTokenImpl {
    isCancellationRequested = false
    // make public to avoid TS isolatedDeclarations complaint on private fields of exported types
    _emitter = new EventEmitter()
    onCancellationRequested(listener: () => void) {
      this._emitter.on('cancel', listener)
      return { dispose: () => this._emitter.removeListener('cancel', listener) }
    }

    _cancel() {
      this.isCancellationRequested = true
      this._emitter.emit('cancel')
    }
  }
  class CancellationTokenSourceImpl {
    token = new CancellationTokenImpl()
    cancel() { this.token._cancel() }
    dispose() {}
  }

  class PositionImpl { constructor(public line: number, public character: number) {} }
  class RangeImpl {
    constructor(public start: any, public end: any) {}
  }

  // Minimal TextEdit
  class TextEditImpl {
    static replace(range: any, newText: string) {
      return { range, newText }
    }
  }

  class DiagnosticImpl {
    source?: string
    code?: any
    constructor(public range: any, public message: string, public severity: number) {}
  }

  const DiagnosticSeverity = {
    Error: 0,
    Warning: 1,
    Information: 2,
    Hint: 3,
  } as const

  const StatusBarAlignment = {
    Left: 1,
    Right: 2,
  } as const

  const CodeActionKind = {
    Empty: '',
    QuickFix: 'quickfix',
    Refactor: 'refactor',
    RefactorExtract: 'refactor.extract',
    RefactorInline: 'refactor.inline',
    RefactorRewrite: 'refactor.rewrite',
    Source: 'source',
    SourceOrganizeImports: 'source.organizeImports',
    SourceFixAll: 'source.fixAll',
  } as const

  class CodeActionImpl {
    title: string
    kind?: any
    diagnostics?: any[]
    isPreferred?: boolean
    command?: any
    edit?: any

    constructor(title: string, kind?: any) {
      this.title = title
      this.kind = kind
    }
  }

  // CodeActionProvider interface (for TypeScript implements checking)
  interface CodeActionProvider {
    provideCodeActions(
      document: any,
      range: any,
      context: any,
      token: any,
    ): Promise<any[] | undefined>
  }

  class WorkspaceEditImpl {
    private changes = new Map<string, any[]>()

    replace(uri: any, range: any, newText: string) {
      const key = typeof uri === 'string' ? uri : uri.toString()
      const edits = this.changes.get(key) || []
      edits.push({ range, newText })
      this.changes.set(key, edits)
    }
  }

  class RelativePatternImpl {
    constructor(public base: string, public pattern: string) {}
  }

  class FileSystemWatcherImpl {
    onDidCreate = makeEvent<any>().event
    onDidChange = makeEvent<any>().event
    onDidDelete = makeEvent<any>().event
    dispose = mock(() => {})
  }

  // Minimal TextDocument
  class TextDocumentImpl {
    uri: any
    constructor(public fileName: string, private text: string, public languageId: string = 'typescript') {
      this.uri = { fsPath: this.fileName, toString: () => `file://${this.fileName}` }
    }

    getText(range?: any) {
      if (!range)
        return this.text
      // naive: assume full provided text for tests
      return this.text.substring(0)
    }

    positionAt(offset: number) {
      return new PositionImpl(0, offset)
    }
  }

  // Editors
  let activeTextEditor: any = null
  let visibleTextEditors: any[] = []

  // Status bar item mock
  const statusBarItem = {
    text: '',
    tooltip: '',
    command: undefined as any,
    show: mock(() => {}),
    hide: mock(() => {}),
    dispose: mock(() => {}),
  }

  // Output channel mock
  const outputChannel = {
    appendLine: mock(() => {}),
    show: mock(() => {}),
    dispose: mock(() => {}),
  }

  // Diagnostic collection
  const diagnosticStore = new Map<string, any[]>()
  const diagnosticCollection = {
    set: mock((uri: any, diagnostics: any[]) => {
      const key = typeof uri === 'string' ? uri : uri.toString()
      diagnosticStore.set(key, diagnostics)
    }),
    get: mock((uri: any) => {
      const key = typeof uri === 'string' ? uri : uri.toString()
      return diagnosticStore.get(key) || []
    }),
    delete: mock((uri: any) => {
      const key = typeof uri === 'string' ? uri : uri.toString()
      diagnosticStore.delete(key)
    }),
    dispose: mock(() => {}),
  }

  // Commands registry
  const commandsMap = new Map<string, Function>()

  // Workspace events
  const onDidSaveTextDocument = makeEvent<any>()
  const onDidChangeTextDocument = makeEvent<any>()
  const onDidOpenTextDocument = makeEvent<any>()

  // Window events
  const onDidChangeActiveTextEditor = makeEvent<any>()

  const vscode = {
    // classes/types
    Range: RangeImpl,
    Position: PositionImpl,
    Diagnostic: DiagnosticImpl,
    DiagnosticSeverity,
    TextEdit: TextEditImpl,
    StatusBarAlignment,
    CancellationTokenSource: CancellationTokenSourceImpl,
    CodeAction: CodeActionImpl,
    CodeActionKind,
    WorkspaceEdit: WorkspaceEditImpl,
    RelativePattern: RelativePatternImpl,
    CodeActionProvider: null as any, // Interface for TypeScript checking

    // namespace APIs
    Uri: { file: (fsPath: string) => ({ fsPath, toString: () => `file://${fsPath}` }) },

    window: {
      createStatusBarItem: mock(() => statusBarItem),
      createOutputChannel: mock(() => outputChannel),
      showWarningMessage: mock(() => {}),
      showErrorMessage: mock(() => {}),
      showInformationMessage: mock(() => {}),
      get activeTextEditor() { return activeTextEditor },
      set activeTextEditor(v: any) { activeTextEditor = v },
      get visibleTextEditors() { return visibleTextEditors },
      set visibleTextEditors(v: any[]) { visibleTextEditors = v },
      onDidChangeActiveTextEditor: onDidChangeActiveTextEditor.event,
    },

    workspace: {
      getConfiguration: mock(() => ({
        get: (key: string, defaultValue: any = undefined) => {
          const map: Record<string, any> = {
            enable: true,
            lintOnSave: true,
            lintOnChange: true,
            formatOnSave: false,
            formatOnPaste: false,
            showOutputChannel: false,
            configPath: '',
            'codeActions.enable': true,
            'statusBar.showIssueCount': true,
          }
          if (key in map)
            return map[key]
          // support "pickier.xxx" keys
          if (key.startsWith('pickier.'))
            return map[key.replace('pickier.', '')]
          return defaultValue !== undefined ? defaultValue : false
        },
      })),
      applyEdit: mock(async () => true),
      createFileSystemWatcher: mock(() => new FileSystemWatcherImpl()),
      onDidSaveTextDocument: onDidSaveTextDocument.event,
      onDidChangeTextDocument: onDidChangeTextDocument.event,
      onDidOpenTextDocument: onDidOpenTextDocument.event,
      get workspaceFolders() { return [{ uri: { fsPath: '/workspace' } }] },
    },

    languages: {
      createDiagnosticCollection: mock(() => diagnosticCollection),
      registerDocumentFormattingEditProvider: mock(() => ({ dispose() {} })),
      registerDocumentRangeFormattingEditProvider: mock(() => ({ dispose() {} })),
      registerCodeActionsProvider: mock(() => ({ dispose() {} })),
    },

    commands: {
      registerCommand: mock((cmd: string, cb: Function) => {
        commandsMap.set(cmd, cb)
        return { dispose() { commandsMap.delete(cmd) } }
      }),
      _invoke: (cmd: string, ...args: any[]) => commandsMap.get(cmd)?.(...args),
    },
  }

  return Object.assign(vscode, overrides)
}
