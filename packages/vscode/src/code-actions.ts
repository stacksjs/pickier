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

      // Add fix action
      const fixAction = await this.createFixAction(document, diagnostic, token)
      if (fixAction) {
        actions.push(fixAction)
      }

      // Add "Disable rule for this line" action
      const disableLineAction = this.createDisableRuleForLineAction(document, diagnostic, range)
      if (disableLineAction) {
        actions.push(disableLineAction)
      }

      // Add "Disable rule for entire file" action
      const disableFileAction = this.createDisableRuleForFileAction(document, diagnostic)
      if (disableFileAction) {
        actions.push(disableFileAction)
      }

      // Add "Show rule documentation" action
      const docsAction = this.createShowRuleDocsAction(diagnostic)
      if (docsAction) {
        actions.push(docsAction)
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
      if (['noDebugger', 'quotes', 'indent', 'no-debugger', 'no-console'].includes(ruleId)) {
        return true
      }

      // Check for common fixable patterns
      const fixablePatterns = ['sort-', 'prefer-', 'import-dedupe', 'organize']
      if (fixablePatterns.some(pattern => ruleId.includes(pattern))) {
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

  private createDisableRuleForLineAction(
    document: vscode.TextDocument,
    diagnostic: vscode.Diagnostic,
    _range: vscode.Range | vscode.Selection,
  ): vscode.CodeAction | undefined {
    const ruleId = diagnostic.code?.toString()
    if (!ruleId) {
      return undefined
    }

    const action = new vscode.CodeAction(
      `Disable ${ruleId} for this line`,
      vscode.CodeActionKind.QuickFix,
    )

    action.diagnostics = [diagnostic]

    // Get the line before the diagnostic
    const line = diagnostic.range.start.line
    const lineText = document.lineAt(line).text
    const indent = lineText.match(/^\s*/)?.[0] || ''

    const edit = new vscode.WorkspaceEdit()
    const comment = `${indent}// eslint-disable-next-line ${ruleId}\n`
    edit.insert(document.uri, new vscode.Position(line, 0), comment)

    action.edit = edit
    action.isPreferred = false

    return action
  }

  private createDisableRuleForFileAction(
    document: vscode.TextDocument,
    diagnostic: vscode.Diagnostic,
  ): vscode.CodeAction | undefined {
    const ruleId = diagnostic.code?.toString()
    if (!ruleId) {
      return undefined
    }

    const action = new vscode.CodeAction(
      `Disable ${ruleId} for entire file`,
      vscode.CodeActionKind.QuickFix,
    )

    action.diagnostics = [diagnostic]

    const edit = new vscode.WorkspaceEdit()
    const comment = `/* eslint-disable ${ruleId} */\n`
    edit.insert(document.uri, new vscode.Position(0, 0), comment)

    action.edit = edit
    action.isPreferred = false

    return action
  }

  private createShowRuleDocsAction(
    diagnostic: vscode.Diagnostic,
  ): vscode.CodeAction | undefined {
    const ruleId = diagnostic.code?.toString()
    if (!ruleId) {
      return undefined
    }

    const action = new vscode.CodeAction(
      `📖 View documentation for ${ruleId}`,
      vscode.CodeActionKind.QuickFix,
    )

    action.diagnostics = [diagnostic]
    action.command = {
      title: 'Show Rule Documentation',
      command: 'pickier.showRuleDocumentation',
      arguments: [ruleId],
    }
    action.isPreferred = false

    return action
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
