import * as vscode from 'vscode'

export class PickierStatusBar {
  private statusBarItem: vscode.StatusBarItem

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100,
    )
    this.statusBarItem.command = 'pickier.lint'
    this.statusBarItem.show()
  }

  update(document: vscode.TextDocument): void {
    const config = vscode.workspace.getConfiguration('pickier')
    if (!config.get('enable', true)) {
      this.statusBarItem.hide()
      return
    }

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

    if (supportedLanguages.includes(document.languageId)) {
      this.statusBarItem.text = '$(check) Pickier'
      this.statusBarItem.tooltip = 'Pickier is active. Click to lint current file.'
      this.statusBarItem.show()
    }
    else {
      this.statusBarItem.hide()
    }
  }

  showError(message: string): void {
    this.statusBarItem.text = '$(error) Pickier'
    this.statusBarItem.tooltip = `Pickier error: ${message}`
    this.statusBarItem.show()
  }

  showWorking(): void {
    this.statusBarItem.text = '$(sync~spin) Pickier'
    this.statusBarItem.tooltip = 'Pickier is working...'
    this.statusBarItem.show()
  }

  dispose(): void {
    this.statusBarItem.dispose()
  }
}
