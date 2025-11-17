import * as vscode from 'vscode'

interface IssueCount {
  errors: number
  warnings: number
}

export class PickierStatusBar {
  private statusBarItem: vscode.StatusBarItem
  private currentIssues: IssueCount = { errors: 0, warnings: 0 }
  private isWorking = false

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100,
    )
    this.statusBarItem.command = 'pickier.showOutputChannel'
    this.statusBarItem.show()
  }

  update(document: vscode.TextDocument, diagnosticCollection?: vscode.DiagnosticCollection): void {
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

    if (!supportedLanguages.includes(document.languageId)) {
      this.statusBarItem.hide()
      return
    }

    // Count issues for current document
    if (diagnosticCollection) {
      const diagnostics = diagnosticCollection.get(document.uri) || []
      this.currentIssues = {
        errors: diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error).length,
        warnings: diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Warning).length,
      }
    }

    this.updateDisplay()
  }

  private updateDisplay(): void {
    if (this.isWorking) {
      this.statusBarItem.text = '$(sync~spin) Pickier'
      this.statusBarItem.tooltip = 'Pickier is working...'
      this.statusBarItem.show()
      return
    }

    const config = vscode.workspace.getConfiguration('pickier')
    const showIssueCount = config.get('statusBar.showIssueCount', true)

    const { errors, warnings } = this.currentIssues
    const totalIssues = errors + warnings

    if (totalIssues === 0) {
      this.statusBarItem.text = '$(check) Pickier'
      this.statusBarItem.tooltip = 'No issues found. Click to show output.'
    }
    else if (showIssueCount) {
      const parts: string[] = []
      if (errors > 0) {
        parts.push(`${errors} ${errors === 1 ? 'error' : 'errors'}`)
      }
      if (warnings > 0) {
        parts.push(`${warnings} ${warnings === 1 ? 'warning' : 'warnings'}`)
      }

      const icon = errors > 0 ? '$(error)' : '$(warning)'
      this.statusBarItem.text = `${icon} Pickier (${parts.join(', ')})`
      this.statusBarItem.tooltip = `Pickier found ${parts.join(' and ')}. Click to show output.`
    }
    else {
      const icon = errors > 0 ? '$(error)' : warnings > 0 ? '$(warning)' : '$(check)'
      this.statusBarItem.text = `${icon} Pickier`
      this.statusBarItem.tooltip = errors > 0
        ? 'Pickier found errors. Click to show output.'
        : warnings > 0
          ? 'Pickier found warnings. Click to show output.'
          : 'No issues found. Click to show output.'
    }

    this.statusBarItem.show()
  }

  setIssueCount(errors: number, warnings: number): void {
    this.currentIssues = { errors, warnings }
    this.updateDisplay()
  }

  showError(message: string): void {
    this.statusBarItem.text = '$(error) Pickier'
    this.statusBarItem.tooltip = `Pickier error: ${message}`
    this.statusBarItem.show()
  }

  showWorking(): void {
    this.isWorking = true
    this.updateDisplay()
  }

  hideWorking(): void {
    this.isWorking = false
    this.updateDisplay()
  }

  dispose(): void {
    this.statusBarItem.dispose()
  }
}
