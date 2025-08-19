import * as vscode from 'vscode'
// Dynamic imports will be used to avoid bundling issues

export class PickierFormattingProvider implements vscode.DocumentFormattingProvider, vscode.DocumentRangeFormattingProvider {
  
  async provideDocumentFormattingEdits(
    document: vscode.TextDocument,
    options: vscode.FormattingOptions,
    token: vscode.CancellationToken
  ): Promise<vscode.TextEdit[]> {
    
    if (token.isCancellationRequested) {
      return []
    }

    try {
      const config = await this.getPickierConfig()
      const { formatCode } = await import('pickier')
      const text = document.getText()
      const formatted = formatCode(text, config, document.fileName)
      
      if (formatted === text) {
        return []
      }
      
      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(text.length)
      )
      
      return [vscode.TextEdit.replace(fullRange, formatted)]
    } catch (error) {
      console.error('Pickier formatting error:', error)
      return []
    }
  }

  async provideDocumentRangeFormattingEdits(
    document: vscode.TextDocument,
    range: vscode.Range,
    options: vscode.FormattingOptions,
    token: vscode.CancellationToken
  ): Promise<vscode.TextEdit[]> {
    
    if (token.isCancellationRequested) {
      return []
    }

    try {
      const config = await this.getPickierConfig()
      const { formatCode } = await import('pickier')
      const text = document.getText(range)
      const formatted = formatCode(text, config, document.fileName)
      
      if (formatted === text) {
        return []
      }
      
      return [vscode.TextEdit.replace(range, formatted)]
    } catch (error) {
      console.error('Pickier range formatting error:', error)
      return []
    }
  }

  private async getPickierConfig(): Promise<any> {
    // For now, return default config
    // TODO: Implement config file discovery and loading
    const { defaultConfig } = await import('pickier')
    return defaultConfig
  }
}
