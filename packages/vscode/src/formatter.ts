import * as vscode from 'vscode'
import { getPickierConfig } from './config'

export class PickierFormattingProvider implements vscode.DocumentFormattingEditProvider, vscode.DocumentRangeFormattingEditProvider, vscode.OnTypeFormattingEditProvider {
  async provideDocumentFormattingEdits(
    document: vscode.TextDocument,
    options: vscode.FormattingOptions,
    token: vscode.CancellationToken,
  ): Promise<vscode.TextEdit[]> {
    if (token.isCancellationRequested) {
      return []
    }

    try {
      const config = await getPickierConfig()
      const { formatCode } = await import('pickier')
      const text = document.getText()
      const formatted = formatCode(text, config, document.fileName)

      if (formatted === text) {
        return []
      }

      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(text.length),
      )

      return [vscode.TextEdit.replace(fullRange, formatted)]
    }
    catch (error) {
      console.error('Pickier formatting error:', error)
      return []
    }
  }

  async provideDocumentRangeFormattingEdits(
    document: vscode.TextDocument,
    range: vscode.Range,
    options: vscode.FormattingOptions,
    token: vscode.CancellationToken,
  ): Promise<vscode.TextEdit[]> {
    if (token.isCancellationRequested) {
      return []
    }

    try {
      const config = await getPickierConfig()
      const { formatCode } = await import('pickier')
      const text = document.getText(range)
      const formatted = formatCode(text, config, document.fileName)

      if (formatted === text) {
        return []
      }

      return [vscode.TextEdit.replace(range, formatted)]
    }
    catch (error) {
      console.error('Pickier range formatting error:', error)
      return []
    }
  }

  async provideOnTypeFormattingEdits(
    document: vscode.TextDocument,
    position: vscode.Position,
    ch: string,
    options: vscode.FormattingOptions,
    token: vscode.CancellationToken,
  ): Promise<vscode.TextEdit[]> {
    // Format on type for specific trigger characters
    return []
  }
}
