import * as vscode from 'vscode'
// Dynamic imports will be used to avoid bundling issues
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

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

export class PickierDiagnosticProvider {
  constructor(
    private diagnosticCollection: vscode.DiagnosticCollection,
    private outputChannel: vscode.OutputChannel
  ) {}

  async provideDiagnostics(document: vscode.TextDocument): Promise<void> {
    const config = vscode.workspace.getConfiguration('pickier')
    if (!config.get('enable', true)) {
      return
    }

    // Clear existing diagnostics for this document
    this.diagnosticCollection.delete(document.uri)

    try {
      const diagnostics = await this.lintDocument(document)
      this.diagnosticCollection.set(document.uri, diagnostics)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.outputChannel.appendLine(`Lint error for ${document.fileName}: ${errorMessage}`)
    }
  }

  private async lintDocument(document: vscode.TextDocument): Promise<vscode.Diagnostic[]> {
    // Create a temporary file to lint since pickier expects file paths
    const tempDir = os.tmpdir()
    const tempFile = path.join(tempDir, `pickier-temp-${Date.now()}${path.extname(document.fileName)}`)
    
    try {
      // Write document content to temp file
      fs.writeFileSync(tempFile, document.getText(), 'utf8')
      
      const options = {
        reporter: 'json' as const,
        maxWarnings: -1
      }
      
      // Capture stdout to get JSON results
      const originalLog = console.log
      const originalError = console.error
      let capturedOutput = ''
      
      console.log = (message: string) => {
        capturedOutput += message + '\n'
      }
      console.error = () => {} // Suppress error output
      
      try {
        const { runLint } = await import('pickier')
        await runLint([tempFile], options)
      } finally {
        console.log = originalLog
        console.error = originalError
      }
      
      // Parse the JSON output
      let lintResult: LintResult
      try {
        // Try to extract JSON from captured output
        const jsonMatch = capturedOutput.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          lintResult = JSON.parse(jsonMatch[0])
        } else {
          // If no JSON found, create empty result
          lintResult = { errors: 0, warnings: 0, issues: [] }
        }
      } catch (parseError) {
        this.outputChannel.appendLine(`Failed to parse lint results: ${parseError}`)
        return []
      }
      
      // Convert lint issues to VS Code diagnostics
      const diagnostics: vscode.Diagnostic[] = []
      
      for (const issue of lintResult.issues) {
        const line = Math.max(0, issue.line - 1) // Convert to 0-based
        const column = Math.max(0, issue.column - 1) // Convert to 0-based
        
        const range = new vscode.Range(
          new vscode.Position(line, column),
          new vscode.Position(line, column + 1)
        )
        
        const severity = issue.severity === 'error' 
          ? vscode.DiagnosticSeverity.Error 
          : vscode.DiagnosticSeverity.Warning
        
        const diagnostic = new vscode.Diagnostic(
          range,
          issue.message,
          severity
        )
        
        diagnostic.source = 'pickier'
        diagnostic.code = issue.ruleId
        
        diagnostics.push(diagnostic)
      }
      
      return diagnostics
      
    } finally {
      // Clean up temp file
      try {
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile)
        }
      } catch (cleanupError) {
        this.outputChannel.appendLine(`Failed to cleanup temp file: ${cleanupError}`)
      }
    }
  }
}
