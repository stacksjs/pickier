import * as vscode from 'vscode'

export class PickierCodeActionProvider implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix,
    vscode.CodeActionKind.SourceFixAll,
  ]

  async provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken,
  ): Promise<vscode.CodeAction[] | undefined> {
    const config = vscode.workspace.getConfiguration('pickier')

    if (!config.get('codeActions.enable', true)) {
      return undefined
    }

    const actions: vscode.CodeAction[] = []

    // Handle "Fix All" code action
    if (context.only?.contains(vscode.CodeActionKind.SourceFixAll)) {
      const fixAllAction = this.createFixAllAction(document)
      if (fixAllAction) {
        actions.push(fixAllAction)
      }
      return actions
    }

    // Handle specific diagnostics (quick fixes)
    for (const diagnostic of context.diagnostics) {
      if (diagnostic.source !== 'pickier') {
        continue
      }

      const action = await this.createFixAction(document, diagnostic, token)
      if (action) {
        actions.push(action)
      }
    }

    return actions
  }

  private createFixAllAction(document: vscode.TextDocument): vscode.CodeAction | undefined {
    const action = new vscode.CodeAction(
      'Fix all auto-fixable Pickier issues',
      vscode.CodeActionKind.SourceFixAll,
    )

    action.command = {
      title: 'Fix all auto-fixable issues',
      command: 'pickier.fixAll',
      arguments: [document],
    }

    action.isPreferred = false

    return action
  }

  private async createFixAction(
    document: vscode.TextDocument,
    diagnostic: vscode.Diagnostic,
    token: vscode.CancellationToken,
  ): Promise<vscode.CodeAction | undefined> {
    if (token.isCancellationRequested) {
      return undefined
    }

    const ruleId = diagnostic.code?.toString()
    if (!ruleId) {
      return undefined
    }

    try {
      const { getPickierConfig } = await import('./config')
      const cfg = await getPickierConfig()
      const text = document.getText()

      // Check if this rule has a fixer
      const hasFix = await this.checkIfRuleHasFix(ruleId, text, cfg, document.fileName)

      if (!hasFix) {
        return undefined
      }

      const action = new vscode.CodeAction(
        `Fix: ${diagnostic.message}`,
        vscode.CodeActionKind.QuickFix,
      )

      action.diagnostics = [diagnostic]
      action.isPreferred = true

      // Execute the fix
      action.command = {
        title: 'Fix issue',
        command: 'pickier.applyFix',
        arguments: [document, diagnostic],
      }

      return action
    }
    catch (error) {
      console.error('Error creating fix action:', error)
      return undefined
    }
  }

  private async checkIfRuleHasFix(
    ruleId: string,
    content: string,
    cfg: any,
    filePath: string,
  ): Promise<boolean> {
    try {
      // Import pickier and check if the rule has a fix function
      const pickier = await import('pickier')

      // For built-in rules like noDebugger, we can apply fixes
      if (['noDebugger', 'quotes', 'indent'].includes(ruleId)) {
        return true
      }

      // For plugin rules, check if they have a fix method
      // This is a heuristic - we'll try to apply the fix and see if it changes
      const original = content
      const { formatCode } = pickier

      try {
        const fixed = formatCode(original, cfg, filePath)
        return fixed !== original
      }
      catch {
        return false
      }
    }
    catch {
      return false
    }
  }
}

export async function applyFix(
  document: vscode.TextDocument,
  _diagnostic: vscode.Diagnostic,
): Promise<void> {
  try {
    const { getPickierConfig } = await import('./config')
    const cfg = await getPickierConfig()
    const { formatCode } = await import('pickier')

    const text = document.getText()
    const formatted = formatCode(text, cfg, document.fileName)

    if (formatted !== text) {
      const edit = new vscode.WorkspaceEdit()
      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(text.length),
      )
      edit.replace(document.uri, fullRange, formatted)
      await vscode.workspace.applyEdit(edit)
    }
  }
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    vscode.window.showErrorMessage(`Failed to apply fix: ${errorMessage}`)
  }
}

export async function fixAllInDocument(document: vscode.TextDocument): Promise<void> {
  try {
    const { getPickierConfig } = await import('./config')
    const cfg = await getPickierConfig()
    const { formatCode } = await import('pickier')

    const text = document.getText()
    const formatted = formatCode(text, cfg, document.fileName)

    if (formatted !== text) {
      const edit = new vscode.WorkspaceEdit()
      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(text.length),
      )
      edit.replace(document.uri, fullRange, formatted)
      await vscode.workspace.applyEdit(edit)

      vscode.window.showInformationMessage('Pickier: All auto-fixable issues fixed')
    }
    else {
      vscode.window.showInformationMessage('Pickier: No fixable issues found')
    }
  }
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    vscode.window.showErrorMessage(`Failed to fix all issues: ${errorMessage}`)
  }
}
