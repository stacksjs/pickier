import * as vscode from 'vscode'

/**
 * Provides CodeLens annotations at the top of files
 * Shows quick stats and actions for Pickier issues
 */
export class PickierCodeLensProvider implements vscode.CodeLensProvider {
  constructor(
    private diagnosticCollection: vscode.DiagnosticCollection,
  ) {}

  async provideCodeLenses(
    document: vscode.TextDocument,
    _token: vscode.CancellationToken,
  ): Promise<vscode.CodeLens[]> {
    const config = vscode.workspace.getConfiguration('pickier')
    if (!config.get('codeLens.enable', true)) {
      return []
    }

    const diagnostics = this.diagnosticCollection.get(document.uri)
    if (!diagnostics || diagnostics.length === 0) {
      // Show "No issues" lens
      return [this.createNoIssuesLens(document)]
    }

    const codeLenses: vscode.CodeLens[] = []

    // Count issues by severity and fixability
    const errors = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error).length
    const warnings = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Warning).length
    const fixable = this.countFixableIssues(diagnostics)

    // Add issue summary lens
    if (diagnostics.length > 0) {
      codeLenses.push(this.createIssueSummaryLens(document, errors, warnings, fixable))
    }

    // Add "Fix All" lens if there are fixable issues
    if (fixable > 0) {
      codeLenses.push(this.createFixAllLens(document, fixable))
    }

    // Add "Organize Imports" lens if applicable
    if (this.hasImportIssues(diagnostics)) {
      codeLenses.push(this.createOrganizeImportsLens(document))
    }

    return codeLenses
  }

  private createNoIssuesLens(document: vscode.TextDocument): vscode.CodeLens {
    const range = new vscode.Range(0, 0, 0, 0)
    const lens = new vscode.CodeLens(range)

    lens.command = {
      title: '$(check) Pickier: No issues found',
      command: '',
      tooltip: 'This file has no linting issues',
    }

    return lens
  }

  private createIssueSummaryLens(
    document: vscode.TextDocument,
    errors: number,
    warnings: number,
    fixable: number,
  ): vscode.CodeLens {
    const range = new vscode.Range(0, 0, 0, 0)
    const lens = new vscode.CodeLens(range)

    const parts: string[] = []
    if (errors > 0) {
      parts.push(`${errors} ${errors === 1 ? 'error' : 'errors'}`)
    }
    if (warnings > 0) {
      parts.push(`${warnings} ${warnings === 1 ? 'warning' : 'warnings'}`)
    }

    const icon = errors > 0 ? '$(error)' : '$(warning)'
    const summary = parts.join(', ')

    let title = `${icon} Pickier: ${summary}`
    if (fixable > 0) {
      title += ` (${fixable} auto-fixable)`
    }

    lens.command = {
      title,
      command: 'pickier.showOutputChannel',
      tooltip: `Click to view Pickier output. ${fixable} issue(s) can be auto-fixed.`,
    }

    return lens
  }

  private createFixAllLens(document: vscode.TextDocument, fixable: number): vscode.CodeLens {
    const range = new vscode.Range(0, 0, 0, 0)
    const lens = new vscode.CodeLens(range)

    lens.command = {
      title: `$(wrench) Fix all ${fixable} auto-fixable issue${fixable === 1 ? '' : 's'}`,
      command: 'pickier.fixAll',
      arguments: [document],
      tooltip: 'Auto-fix all fixable issues in this file',
    }

    return lens
  }

  private createOrganizeImportsLens(document: vscode.TextDocument): vscode.CodeLens {
    const range = new vscode.Range(0, 0, 0, 0)
    const lens = new vscode.CodeLens(range)

    lens.command = {
      title: '$(symbol-namespace) Organize Imports',
      command: 'pickier.organizeImports',
      tooltip: 'Sort and organize imports',
    }

    return lens
  }

  private countFixableIssues(diagnostics: readonly vscode.Diagnostic[]): number {
    // Built-in fixable rules
    const fixableRules = [
      'noDebugger',
      'no-debugger',
      'quotes',
      'indent',
      'no-console',
      'prefer-const',
      'prefer-template',
      'sort-imports',
      'sort-named-imports',
      'sort-exports',
      'sort-objects',
      'import-dedupe',
      'organize',
    ]

    return diagnostics.filter((d) => {
      const ruleId = d.code?.toString() || ''
      return fixableRules.some(rule => ruleId.includes(rule))
    }).length
  }

  private hasImportIssues(diagnostics: readonly vscode.Diagnostic[]): boolean {
    return diagnostics.some((d) => {
      const ruleId = d.code?.toString() || ''
      return ruleId.includes('import') || ruleId.includes('sort')
    })
  }
}
