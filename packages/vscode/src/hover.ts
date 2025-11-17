import * as vscode from 'vscode'

/**
 * Provides rich hover information for Pickier diagnostics
 * Shows verbose help text, rule documentation, and fix availability
 */
export class PickierHoverProvider implements vscode.HoverProvider {
  constructor(
    private diagnosticCollection: vscode.DiagnosticCollection,
  ) {}

  async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken,
  ): Promise<vscode.Hover | undefined> {
    // Get diagnostics for this document
    const diagnostics = this.diagnosticCollection.get(document.uri)
    if (!diagnostics || diagnostics.length === 0) {
      return undefined
    }

    // Find diagnostics at the current position
    const relevantDiagnostics = diagnostics.filter(d =>
      d.range.contains(position),
    )

    if (relevantDiagnostics.length === 0) {
      return undefined
    }

    // Build rich hover content
    const contents: vscode.MarkdownString[] = []

    for (const diagnostic of relevantDiagnostics) {
      const content = this.buildHoverContent(diagnostic)
      if (content) {
        contents.push(content)
      }
    }

    if (contents.length === 0) {
      return undefined
    }

    return new vscode.Hover(contents)
  }

  private buildHoverContent(diagnostic: vscode.Diagnostic): vscode.MarkdownString | undefined {
    const md = new vscode.MarkdownString()
    md.supportHtml = true
    md.isTrusted = true

    // Header with severity icon and rule name
    const icon = diagnostic.severity === vscode.DiagnosticSeverity.Error ? '$(error)' : '$(warning)'
    const ruleId = diagnostic.code?.toString() || 'unknown'

    md.appendMarkdown(`### ${icon} ${ruleId}\n\n`)

    // Main message
    md.appendMarkdown(`**${diagnostic.message}**\n\n`)

    // Help text from related information
    if (diagnostic.relatedInformation && diagnostic.relatedInformation.length > 0) {
      const helpInfo = diagnostic.relatedInformation[0]
      if (helpInfo.message && helpInfo.message !== 'No help available') {
        md.appendMarkdown(`---\n\n`)
        md.appendMarkdown(`💡 **How to fix:**\n\n`)
        md.appendMarkdown(`${helpInfo.message}\n\n`)
      }
    }

    // Check if auto-fixable
    const isFixable = this.isRuleFixable(ruleId)
    if (isFixable) {
      md.appendMarkdown(`---\n\n`)
      md.appendMarkdown(`✨ **Auto-fix available**\n\n`)
      md.appendMarkdown(`Use the Quick Fix menu ($(lightbulb)) or press \`Cmd+.\` to apply fixes.\n\n`)
    }

    // Add links
    md.appendMarkdown(`---\n\n`)
    md.appendMarkdown(`[View Rule Documentation](command:pickier.showRuleDocumentation?${encodeURIComponent(JSON.stringify(ruleId))})`)
    md.appendMarkdown(` • `)
    md.appendMarkdown(`[Disable Rule](command:pickier.disableRule?${encodeURIComponent(JSON.stringify(ruleId))})`)

    return md
  }

  private isRuleFixable(ruleId: string): boolean {
    // Built-in fixable rules
    const fixableBuiltIn = ['noDebugger', 'quotes', 'indent', 'no-debugger', 'no-console']
    if (fixableBuiltIn.includes(ruleId)) {
      return true
    }

    // Plugin rules that are typically fixable
    const fixablePatterns = [
      'sort-',
      'prefer-',
      'import-dedupe',
      'organize',
      'format',
    ]

    return fixablePatterns.some(pattern => ruleId.includes(pattern))
  }
}
