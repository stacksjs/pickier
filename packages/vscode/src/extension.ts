import * as path from 'node:path'
import * as vscode from 'vscode'
import { PickierDiagnosticProvider } from './diagnostics'
// Import types and functions from the pickier package
// Note: These will be dynamically imported to avoid bundling issues
import { PickierFormattingProvider } from './formatter'
import { PickierStatusBar } from './status-bar'

let diagnosticCollection: vscode.DiagnosticCollection
let statusBarItem: PickierStatusBar
let outputChannel: vscode.OutputChannel

export async function activate(context: vscode.ExtensionContext) {
  console.warn('Pickier extension is now active!')

  // Create output channel
  outputChannel = vscode.window.createOutputChannel('Pickier')

  // Create diagnostic collection
  diagnosticCollection = vscode.languages.createDiagnosticCollection('pickier')

  // Create status bar
  statusBarItem = new PickierStatusBar()

  // Register formatter provider
  const formattingProvider = new PickierFormattingProvider()

  // Register formatters for supported languages
  const supportedLanguages = ['typescript', 'javascript', 'json', 'jsonc', 'html', 'css', 'markdown', 'yaml']

  supportedLanguages.forEach((language) => {
    context.subscriptions.push(
      vscode.languages.registerDocumentFormattingProvider(language, formattingProvider),
      vscode.languages.registerDocumentRangeFormattingProvider(language, formattingProvider),
    )
  })

  // Register diagnostic provider
  const diagnosticProvider = new PickierDiagnosticProvider(diagnosticCollection, outputChannel)

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('pickier.format', () => formatDocument()),
    vscode.commands.registerCommand('pickier.formatSelection', () => formatSelection()),
    vscode.commands.registerCommand('pickier.lint', () => lintDocument()),
    vscode.commands.registerCommand('pickier.lintWorkspace', () => lintWorkspace()),
    diagnosticCollection,
    statusBarItem,
    outputChannel,
  )

  // Register event listeners
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(async (document) => {
      const config = vscode.workspace.getConfiguration('pickier')

      if (config.get('lintOnSave', true)) {
        await diagnosticProvider.provideDiagnostics(document)
      }

      if (config.get('formatOnSave', false)) {
        await formatDocumentInternal(document)
      }
    }),

    vscode.workspace.onDidChangeTextDocument((event) => {
      if (event.document.languageId && supportedLanguages.includes(event.document.languageId)) {
        statusBarItem.update(event.document)
      }
    }),

    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor && supportedLanguages.includes(editor.document.languageId)) {
        statusBarItem.update(editor.document)
      }
    }),
  )

  // Initialize for currently open documents
  if (vscode.window.activeTextEditor) {
    const document = vscode.window.activeTextEditor.document
    if (supportedLanguages.includes(document.languageId)) {
      statusBarItem.update(document)
      await diagnosticProvider.provideDiagnostics(document)
    }
  }
}

export function deactivate() {
  if (diagnosticCollection) {
    diagnosticCollection.dispose()
  }
  if (statusBarItem) {
    statusBarItem.dispose()
  }
  if (outputChannel) {
    outputChannel.dispose()
  }
}

async function formatDocument() {
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    vscode.window.showWarningMessage('No active editor found')
    return
  }

  await formatDocumentInternal(editor.document)
}

async function formatSelection() {
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    vscode.window.showWarningMessage('No active editor found')
    return
  }

  const selection = editor.selection
  if (selection.isEmpty) {
    vscode.window.showWarningMessage('No text selected')
    return
  }

  const document = editor.document
  const selectedText = document.getText(selection)

  try {
    const config = await getPickierConfig()
    const { formatCode } = await import('pickier')
    const formatted = formatCode(selectedText, config, document.fileName)

    if (formatted !== selectedText) {
      await editor.edit((editBuilder) => {
        editBuilder.replace(selection, formatted)
      })

      vscode.window.showInformationMessage('Selection formatted successfully')
    }
  }
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    vscode.window.showErrorMessage(`Failed to format selection: ${errorMessage}`)
    outputChannel.appendLine(`Format error: ${errorMessage}`)
  }
}

async function formatDocumentInternal(document: vscode.TextDocument) {
  const editor = vscode.window.visibleTextEditors.find(e => e.document === document)
  if (!editor)
    return

  try {
    const config = await getPickierConfig()
    const { formatCode } = await import('pickier')
    const text = document.getText()
    const formatted = formatCode(text, config, document.fileName)

    if (formatted !== text) {
      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(text.length),
      )

      await editor.edit((editBuilder) => {
        editBuilder.replace(fullRange, formatted)
      })

      vscode.window.showInformationMessage('Document formatted successfully')
    }
  }
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    vscode.window.showErrorMessage(`Failed to format document: ${errorMessage}`)
    outputChannel.appendLine(`Format error: ${errorMessage}`)
  }
}

async function lintDocument() {
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    vscode.window.showWarningMessage('No active editor found')
    return
  }

  const diagnosticProvider = new PickierDiagnosticProvider(diagnosticCollection, outputChannel)
  await diagnosticProvider.provideDiagnostics(editor.document)
}

async function lintWorkspace() {
  const workspaceFolders = vscode.workspace.workspaceFolders
  if (!workspaceFolders) {
    vscode.window.showWarningMessage('No workspace folder found')
    return
  }

  const workspaceRoot = workspaceFolders[0].uri.fsPath

  try {
    const { runLint } = await import('pickier')
    const options = {
      reporter: 'json' as const,
      maxWarnings: -1,
    }

    const exitCode = await runLint([workspaceRoot], options)

    if (exitCode === 0) {
      vscode.window.showInformationMessage('Workspace linting completed successfully')
    }
    else {
      vscode.window.showWarningMessage('Workspace linting completed with issues')
    }

    outputChannel.appendLine(`Workspace lint completed with exit code: ${exitCode}`)

    const config = vscode.workspace.getConfiguration('pickier')
    if (config.get('showOutputChannel', false)) {
      outputChannel.show()
    }
  }
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    vscode.window.showErrorMessage(`Failed to lint workspace: ${errorMessage}`)
    outputChannel.appendLine(`Workspace lint error: ${errorMessage}`)
  }
}

async function getPickierConfig() {
  const workspaceFolders = vscode.workspace.workspaceFolders
  if (!workspaceFolders) {
    throw new Error('No workspace folder found')
  }

  const workspaceRoot = workspaceFolders[0].uri.fsPath
  const config = vscode.workspace.getConfiguration('pickier')
  const configPath = config.get<string>('configPath', '')

  if (configPath) {
    const _fullConfigPath = path.resolve(workspaceRoot, configPath)
    // For now, we'll use default config since loading external configs requires more setup
    // TODO: Implement dynamic config loading
  }

  // Return default config for now
  const { defaultConfig } = await import('pickier')
  return defaultConfig
}
