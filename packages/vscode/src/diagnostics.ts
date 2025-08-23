// Dynamic imports will be used to avoid bundling issues
import * as vscode from 'vscode'

interface LintResult {
  errors: number
  warnings: number
  issues: Array<{
    filePath: string
    line: number
    column: number
    ruleId: string
    message: string
    severity: 'warning' | 'error'
  }>
}

// Bridge: VS Code CancellationToken -> AbortSignal
function tokenToAbortSignal(token: vscode.CancellationToken): AbortSignal {
  const controller = new AbortController()
  token.onCancellationRequested(() => controller.abort())
  return controller.signal
}

export class PickierDiagnosticProvider {
  constructor(
    private diagnosticCollection: vscode.DiagnosticCollection,
    private outputChannel: vscode.OutputChannel,
  ) {}

  async provideDiagnostics(document: vscode.TextDocument, token?: vscode.CancellationToken): Promise<void> {
    const config = vscode.workspace.getConfiguration('pickier')
    if (!config.get('enable', true)) {
      return
    }

    // Clear existing diagnostics for this document
    this.diagnosticCollection.delete(document.uri)

    try {
      if (token?.isCancellationRequested)
        return

      const diagnostics = await this.lintDocument(document, token)

      if (token?.isCancellationRequested)
        return

      this.diagnosticCollection.set(document.uri, diagnostics)
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.outputChannel.appendLine(`Lint error for ${document.fileName}: ${errorMessage}`)
    }
  }

  private async lintDocument(document: vscode.TextDocument, token?: vscode.CancellationToken): Promise<vscode.Diagnostic[]> {
    // Prefer programmatic API if available to avoid stdout capture and temp files
    try {
      const mod: any = await import('pickier')
      const cfg = await (async () => mod.defaultConfig as any)()
      if (typeof mod.lintText === 'function') {
        const signal = token ? tokenToAbortSignal(token) : undefined
        const issues = await mod.lintText(document.getText(), cfg, document.fileName, signal)
        if (token?.isCancellationRequested) return []
        return issues.map(convertIssueToDiagnostic)
      }
    }
    catch (e) {
      // If dynamic import or programmatic API fails, fall back to stdout approach
      this.outputChannel.appendLine(`Programmatic lint unavailable, falling back. Reason: ${(e as any)?.message || e}`)
    }

    // Fallback: temp file + stdout JSON capture
    const options = { reporter: 'json' as const, maxWarnings: -1 }
    const lintResult = await runPickierAndParseJson([document.fileName], options, this.outputChannel, token, document.getText())
    if (token?.isCancellationRequested) return []
    return lintResult.issues.map(convertIssueToDiagnostic)
  }
}

// Helper: run pickier on paths and return parsed JSON
async function runPickierAndParseJson(
  paths: string[],
  options: { reporter: 'json'; maxWarnings: number },
  output: vscode.OutputChannel,
  token?: vscode.CancellationToken,
  docTextForActive?: string,
): Promise<LintResult> {
  // Capture stdout to get JSON results
  // eslint-disable-next-line no-console
  const originalLog = console.log
  const originalError = console.error
  let capturedOutput = ''

  // eslint-disable-next-line no-console
  console.log = (message: string) => {
    capturedOutput += `${message}\n`
  }

  console.error = () => {} // Suppress error output

  try {
    const mod: any = await import('pickier')
    if (token?.isCancellationRequested)
      return { errors: 0, warnings: 0, issues: [] }
    // If only a single path represents the active unsaved doc, prefer lintText when available
    if (docTextForActive && typeof mod.lintText === 'function') {
      const signal = token ? tokenToAbortSignal(token) : undefined
      const issues = await mod.lintText(docTextForActive, mod.defaultConfig, paths[0], signal)
      return { errors: issues.filter((i: any) => i.severity === 'error').length, warnings: issues.filter((i: any) => i.severity === 'warning').length, issues }
    }
    await mod.runLint(paths, options)
  }
  finally {
    // eslint-disable-next-line no-console
    console.log = originalLog
    console.error = originalError
  }

  // Parse the JSON output
  try {
    if (token?.isCancellationRequested)
      return { errors: 0, warnings: 0, issues: [] }
    const jsonMatch = capturedOutput.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as LintResult
    }
    return { errors: 0, warnings: 0, issues: [] }
  }
  catch (parseError) {
    output.appendLine(`Failed to parse lint results: ${parseError}`)
    return { errors: 0, warnings: 0, issues: [] }
  }
}

// Helper: convert a single issue to a VS Code diagnostic
function convertIssueToDiagnostic(issue: LintResult['issues'][number]): vscode.Diagnostic {
  const line = Math.max(0, issue.line - 1)
  const column = Math.max(0, issue.column - 1)
  const range = new vscode.Range(
    new vscode.Position(line, column),
    new vscode.Position(line, column + 1),
  )
  const severity = issue.severity === 'error'
    ? vscode.DiagnosticSeverity.Error
    : vscode.DiagnosticSeverity.Warning
  const diagnostic = new vscode.Diagnostic(range, issue.message, severity)
  diagnostic.source = 'pickier'
  diagnostic.code = issue.ruleId
  return diagnostic
}

// Exported helper: lint multiple file paths and map diagnostics by file
export async function lintPathsToDiagnostics(paths: string[], output: vscode.OutputChannel): Promise<Record<string, vscode.Diagnostic[]>> {
  const options = { reporter: 'json' as const, maxWarnings: -1 }
  // Try programmatic batch lint first
  try {
    const mod: any = await import('pickier')
    if (typeof mod.runLintProgrammatic === 'function') {
      const res = await mod.runLintProgrammatic(paths, options)
      const map: Record<string, vscode.Diagnostic[]> = {}
      for (const issue of res.issues) {
        const list = map[issue.filePath] || (map[issue.filePath] = [])
        list.push(convertIssueToDiagnostic(issue))
      }
      return map
    }
  }
  catch (e) {
    output.appendLine(`Programmatic workspace lint unavailable, falling back. Reason: ${(e as any)?.message || e}`)
  }

  const result = await runPickierAndParseJson(paths, options, output)
  const map: Record<string, vscode.Diagnostic[]> = {}
  for (const issue of result.issues) {
    const list = map[issue.filePath] || (map[issue.filePath] = [])
    list.push(convertIssueToDiagnostic(issue))
  }
  return map
}
