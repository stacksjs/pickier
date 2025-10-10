import * as vscode from 'vscode'
import { getPickierConfig } from './config'

/**
 * Organize imports in the current document
 */
export async function organizeImports(): Promise<void> {
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    vscode.window.showWarningMessage('No active editor found')
    return
  }

  const document = editor.document

  try {
    const cfg = await getPickierConfig()

    // Enable sort-imports rule temporarily if not already enabled
    const tempConfig = {
      ...cfg,
      pluginRules: {
        ...cfg.pluginRules,
        'pickier/sort-imports': 'error',
        'pickier/sort-named-imports': 'error',
      },
    }

    const { formatCode } = await import('pickier')
    const text = document.getText()
    const formatted = formatCode(text, tempConfig, document.fileName)

    if (formatted !== text) {
      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(text.length),
      )

      await editor.edit((editBuilder) => {
        editBuilder.replace(fullRange, formatted)
      })

      vscode.window.showInformationMessage('Pickier: Imports organized')
    }
    else {
      vscode.window.showInformationMessage('Pickier: Imports already organized')
    }
  }
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    vscode.window.showErrorMessage(`Failed to organize imports: ${errorMessage}`)
  }
}

/**
 * Format pasted text
 */
export async function formatPastedText(
  document: vscode.TextDocument,
  edits: readonly vscode.TextEdit[],
): Promise<vscode.TextEdit[]> {
  const config = vscode.workspace.getConfiguration('pickier')

  if (!config.get('formatOnPaste', false)) {
    return [...edits]
  }

  if (!config.get('enable', true)) {
    return [...edits]
  }

  try {
    const cfg = await getPickierConfig()
    const { formatCode } = await import('pickier')

    // Format each edit
    const formattedEdits: vscode.TextEdit[] = []

    for (const edit of edits) {
      const text = edit.newText
      const formatted = formatCode(text, cfg, document.fileName)
      formattedEdits.push(new vscode.TextEdit(edit.range, formatted))
    }

    return formattedEdits
  }
  catch (error) {
    console.error('Error formatting pasted text:', error)
    return [...edits]
  }
}

/**
 * Show the Pickier output channel
 */
export function showOutputChannel(outputChannel: vscode.OutputChannel): void {
  outputChannel.show()
}

/**
 * Restart the extension
 */
export async function restartExtension(): Promise<void> {
  const answer = await vscode.window.showInformationMessage(
    'Restart Pickier Extension?',
    'Yes',
    'No',
  )

  if (answer === 'Yes') {
    // Clear config cache
    const { clearConfigCache } = await import('./config')
    clearConfigCache()

    // Reload window to restart extension
    await vscode.commands.executeCommand('workbench.action.reloadWindow')
  }
}
