import type { PickierConfig, PickierPlugin, LintIssue as PluginLintIssue, RuleContext, RulesConfigMap } from '../types'
import { readFileSync, writeFileSync } from 'node:fs'
import { extname, isAbsolute, relative, resolve } from 'node:path'
import process from 'node:process'
import fg from 'fast-glob'
import { config as defaultConfig } from '../config'
import { detectQuoteIssues, hasIndentIssue } from '../format'
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

function mergeConfig(base: PickierConfig, override: Partial<PickierConfig>): PickierConfig {
  return {
    ...base,
    ...override,
    lint: { ...base.lint, ...(override.lint || {}) },
    format: { ...base.format, ...(override.format || {}) },
    rules: { ...base.rules, ...(override.rules || {}) },
  }
}

async function loadConfigFromPath(pathLike: string | undefined): Promise<PickierConfig> {
  if (!pathLike)
    return defaultConfig

  const abs = isAbsolute(pathLike) ? pathLike : resolve(process.cwd(), pathLike)
  const ext = extname(abs).toLowerCase()

  if (ext === '.json') {
    const raw = readFileSync(abs, 'utf8')
    return mergeConfig(defaultConfig, JSON.parse(raw) as Partial<PickierConfig>)
  }

  const mod = await import(abs)
  return mergeConfig(defaultConfig, (mod.default || mod) as Partial<PickierConfig>)
}

function expandPatterns(patterns: string[]): string[] {
  return patterns.map((p) => {
    const hasMagic = /[\\*?[\]{}()!]/.test(p)
    if (hasMagic)
      return p
    // if it looks like a file path with an extension, keep as-is
    if (/\.[A-Z0-9]+$/i.test(p))
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

function applyPlugins(filePath: string, content: string, cfg: PickierConfig): PluginLintIssue[] {
  const issues: PluginLintIssue[] = []
  const pluginDefs: Array<PickierPlugin> = []
  if (cfg.plugins && cfg.plugins.length > 0) {
    for (const p of cfg.plugins) {
      if (typeof p === 'string')
        continue // string form not yet supported for runtime import here
      pluginDefs.push(p)
    }
  }
  if (pluginDefs.length === 0)
    return issues

  const configured: RulesConfigMap = cfg.pluginRules || {}
  for (const plugin of pluginDefs) {
    for (const [ruleName, rule] of Object.entries(plugin.rules)) {
      const fullName = `${plugin.name}/${ruleName}`
      const conf = configured[fullName]
      const sev = Array.isArray(conf) ? conf[0] : conf
      const options = Array.isArray(conf) ? conf[1] : undefined
      if (!conf || sev === 'off')
        continue
      const context: RuleContext = { filePath, config: cfg, options }
      try {
        const res = rule.check(content, context)
        for (const i of res) {
          issues.push(i)
        }
      }
      catch (e) {
        // mark WIP rules as errors when requested via meta
        if (rule.meta?.wip) {
          issues.push({
            filePath,
            line: 1,
            column: 1,
            ruleId: `${fullName}:wip-error`,
            message: `Rule ${fullName} is marked as WIP and threw: ${String(e)}`,
            severity: 'error',
          })
        }
      }
    }
  }
  return issues
}

function scanContent(filePath: string, content: string, cfg: PickierConfig): LintIssue[] {
  const issues: LintIssue[] = []
  const lines = content.split(/\r?\n/)

  const debuggerStmt = /^\s*debugger\b/ // statement-only, not inside strings

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNo = i + 1

    if (cfg.rules.noDebugger !== 'off' && debuggerStmt.test(line)) {
      const col = line.search(/\S|$/) + 1
      issues.push({
        filePath,
        line: lineNo,
        column: col,
        ruleId: 'no-debugger',
        message: 'Unexpected debugger statement.',
        severity: cfg.rules.noDebugger === 'error' ? 'error' : 'warning',
      })
    }

    if (cfg.rules.noConsole !== 'off') {
      const conCol = line.indexOf('console.')
      if (conCol !== -1) {
        issues.push({
          filePath,
          line: lineNo,
          column: conCol + 1,
          ruleId: 'no-console',
          message: 'Unexpected console usage.',
          severity: cfg.rules.noConsole === 'error' ? 'error' : 'warning',
        })
      }
    }

    // quote preference diagnostics (only for code files)
    if (/\.(?:ts|tsx|js|jsx)$/.test(filePath)) {
      const quoteIdx = detectQuoteIssues(line, cfg.format.quotes)
      for (const idx of quoteIdx) {
        issues.push({
          filePath,
          line: lineNo,
          column: idx + 1,
          ruleId: 'quotes',
          message: `Strings must use ${cfg.format.quotes} quotes.`,
          severity: 'warning',
        })
      }

      // indentation diagnostics
      const leadingMatch = line.match(/^[ \t]*/)
      const leading = leadingMatch ? leadingMatch[0] : ''
      if (hasIndentIssue(leading, cfg.format.indent)) {
        const firstNonWs = line.search(/\S|$/)
        issues.push({
          filePath,
          line: lineNo,
          column: Math.max(1, firstNonWs),
          ruleId: 'indent',
          message: `Indentation must be a multiple of ${cfg.format.indent} spaces.`,
          severity: 'warning',
        })
      }
    }
  }

  // plugin-based rules
  const pluginIssues = applyPlugins(filePath, content, cfg)
  return issues.concat(pluginIssues)
}

function applyFixes(filePath: string, content: string, cfg: PickierConfig): string {
  // Only remove debugger statements for --fix in lint. Formatting stays in formatter.
  const lines = content.split(/\r?\n/)
  const fixed: string[] = []
  const debuggerStmt = /^\s*debugger\b/
  for (const line of lines) {
    if (cfg.rules.noDebugger !== 'off' && debuggerStmt.test(line))
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
  const cfg = await loadConfigFromPath(options.config)

  const raw = globs.length ? globs : ['.']
  const patterns = expandPatterns(raw)
  const extCsv = options.ext || cfg.lint.extensions.join(',')
  const extSet = new Set(extCsv.split(',').map((s) => {
    const t = s.trim()
    return t.startsWith('.') ? t : `.${t}`
  }))

  const entries = await fg(patterns, {
    dot: false,
    ignore: cfg.ignores,
    onlyFiles: true,
    unique: true,
    absolute: true,
  })

  const files = entries.filter(f => isCodeFile(f, extSet))

  let allIssues: LintIssue[] = []
  for (const file of files) {
    const src = readFileSync(file, 'utf8')
    let issues = scanContent(file, src, cfg)

    if (options.fix) {
      const fixed = applyFixes(file, src, cfg)
      if (!options.dryRun && fixed !== src)
        writeFileSync(file, fixed, 'utf8')
      // recompute issues after simulated or real fix
      issues = scanContent(file, fixed, cfg)

      if (options.dryRun && src !== fixed && (options.verbose || cfg.verbose)) {
        console.log(colors.gray(`dry-run: would apply fixes in ${relative(process.cwd(), file)}`))
      }
    }

    allIssues = allIssues.concat(issues)
  }

  const errors = allIssues.filter(i => i.severity === 'error').length
  const warnings = allIssues.filter(i => i.severity === 'warning').length

  const reporter = options.reporter || cfg.lint.reporter
  if (reporter === 'json') {
    console.log(JSON.stringify({ errors, warnings, issues: allIssues }, null, 2))
  }
  else if (reporter === 'compact') {
    for (const i of allIssues) {
      console.log(`${relative(process.cwd(), i.filePath)}:${i.line}:${i.column} ${i.severity} ${i.ruleId} ${i.message}`)
    }
  }
  else if (allIssues.length > 0) {
    console.log(formatStylish(allIssues))
  }

  if (options.verbose || cfg.verbose) {
    console.log(colors.gray(`Scanned ${files.length} files, found ${errors} errors and ${warnings} warnings.`))
  }

  const maxWarnings = options.maxWarnings ?? cfg.lint.maxWarnings
  if (errors > 0)
    return 1
  if (maxWarnings >= 0 && warnings > maxWarnings)
    return 1
  return 0
}
