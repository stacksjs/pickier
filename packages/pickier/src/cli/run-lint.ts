import { readFileSync, writeFileSync } from 'node:fs'
import { relative } from 'node:path'
import process from 'node:process'
import fg from 'fast-glob'
import { colors } from '../utils'

export interface LintOptions {
  fix?: boolean
  dryRun?: boolean
  maxWarnings?: number
  reporter?: 'stylish' | 'json' | 'compact'
  config?: string
  ignorePath?: string
  ext?: string
  cache?: boolean
  verbose?: boolean
}

interface LintIssue {
  filePath: string
  line: number
  column: number
  ruleId: string
  message: string
  severity: 'warning' | 'error'
}

function expandPatterns(patterns: string[]): string[] {
  return patterns.map((p) => {
    const hasMagic = /[\\*?[\]{}()!]/.test(p)
    if (hasMagic)
      return p
    // treat as directory; search all files under it
    return `${p.replace(/\/$/, '')}/**/*`
  })
}

function isCodeFile(file: string, allowedExts: Set<string>): boolean {
  const idx = file.lastIndexOf('.')
  if (idx < 0)
    return false
  const ext = file.slice(idx)
  return allowedExts.has(ext)
}

function scanContent(filePath: string, content: string): LintIssue[] {
  const issues: LintIssue[] = []
  const lines = content.split(/\r?\n/)

  const debuggerStmt = /^\s*debugger\b/ // statement-only, not inside strings

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNo = i + 1

    if (debuggerStmt.test(line)) {
      const col = line.search(/\S|$/) + 1
      issues.push({
        filePath,
        line: lineNo,
        column: col,
        ruleId: 'no-debugger',
        message: 'Unexpected debugger statement.',
        severity: 'error',
      })
    }

    const conCol = line.indexOf('console.')
    if (conCol !== -1) {
      issues.push({
        filePath,
        line: lineNo,
        column: conCol + 1,
        ruleId: 'no-console',
        message: 'Unexpected console usage.',
        severity: 'warning',
      })
    }
  }

  return issues
}

function applyFixes(filePath: string, content: string): string {
  const lines = content.split(/\r?\n/)
  const fixed: string[] = []
  const debuggerStmt = /^\s*debugger\b/
  for (const line of lines) {
    if (debuggerStmt.test(line))
      continue
    fixed.push(line)
  }
  return fixed.join('\n')
}

function formatStylish(issues: LintIssue[]): string {
  const rel = (p: string) => relative(process.cwd(), p)
  let out = ''
  let lastFile = ''
  for (const issue of issues) {
    if (issue.filePath !== lastFile) {
      lastFile = issue.filePath
      out += `\n${colors.bold(rel(issue.filePath))}\n`
    }
    const sev = issue.severity === 'error' ? colors.red('error') : colors.yellow('warn ')
    out += `${sev}  ${colors.gray(String(issue.line))}:${colors.gray(String(issue.column))}  ${colors.blue(issue.ruleId)}  ${issue.message}\n`
  }
  return out
}

export async function runLint(globs: string[], options: LintOptions): Promise<number> {
  const raw = globs.length ? globs : ['.']
  const patterns = expandPatterns(raw)
  const extSet = new Set((options.ext || '.ts,.tsx,.js,.jsx').split(',').map(s => s.trim()))

  const entries = await fg(patterns, {
    dot: false,
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
    onlyFiles: true,
    unique: true,
    absolute: true,
  })

  const files = entries.filter(f => isCodeFile(f, extSet))

  let allIssues: LintIssue[] = []
  for (const file of files) {
    const src = readFileSync(file, 'utf8')
    let issues = scanContent(file, src)

    if (options.fix && issues.some(i => i.ruleId === 'no-debugger')) {
      const fixed = applyFixes(file, src)
      if (!options.dryRun && fixed !== src)
        writeFileSync(file, fixed, 'utf8')
      // recompute issues after simulated or real fix
      issues = scanContent(file, fixed)

      if (options.dryRun && src !== fixed && options.verbose) {
        console.log(colors.gray(`dry-run: would apply fixes in ${relative(process.cwd(), file)}`))
      }
    }

    allIssues = allIssues.concat(issues)
  }

  const errors = allIssues.filter(i => i.severity === 'error').length
  const warnings = allIssues.filter(i => i.severity === 'warning').length

  if (options.reporter === 'json') {
    console.log(JSON.stringify({ errors, warnings, issues: allIssues }, null, 2))
  }
  else if (options.reporter === 'compact') {
    for (const i of allIssues) {
      console.log(`${relative(process.cwd(), i.filePath)}:${i.line}:${i.column} ${i.severity} ${i.ruleId} ${i.message}`)
    }
  }
  else if (allIssues.length > 0) {
    console.log(formatStylish(allIssues))
  }

  if (options.verbose) {
    console.log(colors.gray(`Scanned ${files.length} files, found ${errors} errors and ${warnings} warnings.`))
  }

  if (errors > 0)
    return 1
  if ((options.maxWarnings ?? -1) >= 0 && warnings > (options.maxWarnings ?? -1))
    return 1
  return 0
}
