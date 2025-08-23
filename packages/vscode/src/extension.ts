import * as path from 'node:path'
import * as vscode from 'vscode'
import { lintPathsToDiagnostics, PickierDiagnosticProvider } from './diagnostics'
// Import types and functions from the pickier package
// Note: These will be dynamically imported to avoid bundling issues
import { PickierFormattingProvider } from './formatter'
import { PickierStatusBar } from './status-bar'

let diagnosticCollection: vscode.DiagnosticCollection
let statusBarItem: PickierStatusBar
let outputChannel: vscode.OutputChannel
const changeDebounceTimers = new Map<string, NodeJS.Timeout>()
const lintTokenSources = new Map<string, vscode.CancellationTokenSource>()

function resetLintToken(document: vscode.TextDocument): vscode.CancellationToken {
  const key = document.uri.toString()
  const existing = lintTokenSources.get(key)
  if (existing)
    existing.cancel()
  const cts = new vscode.CancellationTokenSource()
  lintTokenSources.set(key, cts)
  return cts.token
}

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  // Create output channel
  outputChannel = vscode.window.createOutputChannel('Pickier')
  outputChannel.appendLine('Pickier extension activated')

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
      vscode.languages.registerDocumentFormattingEditProvider(language, formattingProvider),
      vscode.languages.registerDocumentRangeFormattingEditProvider(language, formattingProvider),
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
        const token = resetLintToken(document)
        await diagnosticProvider.provideDiagnostics(document, token)
      }

      if (config.get('formatOnSave', false)) {
        await formatDocumentInternal(document)
      }
    }),

    vscode.workspace.onDidChangeTextDocument((event) => {
      const doc = event.document
      if (doc.languageId && supportedLanguages.includes(doc.languageId)) {
        statusBarItem.update(doc)

        const key = doc.uri.toString()
        const existing = changeDebounceTimers.get(key)
        if (existing)
          clearTimeout(existing)

        const timer = setTimeout(async () => {
          changeDebounceTimers.delete(key)
          const config = vscode.workspace.getConfiguration('pickier')
          if (config.get('lintOnChange', true)) {
            const token = resetLintToken(doc)
            await diagnosticProvider.provideDiagnostics(doc, token)
          }
        }, 500)

        changeDebounceTimers.set(key, timer)
      }
    }),

    vscode.workspace.onDidOpenTextDocument(async (document) => {
      if (supportedLanguages.includes(document.languageId)) {
        const token = resetLintToken(document)
        await diagnosticProvider.provideDiagnostics(document, token)
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
      const token = resetLintToken(document)
      await diagnosticProvider.provideDiagnostics(document, token)
    }
  }
}

export function deactivate(): void {
  if (diagnosticCollection) {
    diagnosticCollection.dispose()
  }
  if (statusBarItem) {
    statusBarItem.dispose()
  }
  if (outputChannel) {
    outputChannel.dispose()
  }
  // Cancel and dispose all outstanding lint tokens
  for (const [, cts] of lintTokenSources) {
    cts.cancel()
    cts.dispose()
  }
  lintTokenSources.clear()
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
  const token = resetLintToken(editor.document)
  await diagnosticProvider.provideDiagnostics(editor.document, token)
}

async function lintWorkspace() {
  const workspaceFolders = vscode.workspace.workspaceFolders
  if (!workspaceFolders) {
    vscode.window.showWarningMessage('No workspace folder found')
    return
  }

  const workspaceRoot = workspaceFolders[0].uri.fsPath

  try {
    // Lint the whole workspace and populate Problems across files
    const diagnosticsMap = await lintPathsToDiagnostics([workspaceRoot], outputChannel)
    for (const [filePath, diags] of Object.entries(diagnosticsMap)) {
      const uri = vscode.Uri.file(filePath)
      diagnosticCollection.set(uri, diags)
    }

    const totalIssues = Object.values(diagnosticsMap).reduce((n, arr) => n + arr.length, 0)
    const msg = totalIssues === 0
      ? 'Workspace linting completed with no issues'
      : `Workspace linting found ${totalIssues} issue(s)`
    vscode.window.showInformationMessage(msg)

    const config = vscode.workspace.getConfiguration('pickier')
    if (config.get('showOutputChannel', false))
      outputChannel.show()
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
