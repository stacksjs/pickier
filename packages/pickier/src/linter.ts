import type { LintIssue, LintOptions, PickierConfig, PickierPlugin, RuleContext, RulesConfigMap } from './types'
import { readFileSync, writeFileSync } from 'node:fs'
import { relative } from 'node:path'
import process from 'node:process'
import { glob as tinyGlob } from 'tinyglobby'
import { colors, expandPatterns, isCodeFile, loadConfigFromPath } from './utils'
import { detectQuoteIssues, hasIndentIssue } from './format'
import { getAllPlugins } from './plugins'
import { applyFixes, formatStylish } from './formatter'

export function applyPlugins(filePath: string, content: string, cfg: PickierConfig): Array<any> /* PluginLintIssue[] */ {
  const issues: Array<any> = []
  const pluginDefs: Array<PickierPlugin> = getAllPlugins()

  if (cfg.plugins && cfg.plugins.length > 0) {
    for (const p of cfg.plugins) {
      if (typeof p === 'string')
        continue // string form not yet supported for runtime import here
      pluginDefs.push(p)
    }
  }

  const rulesConfig: RulesConfigMap = (cfg.pluginRules || {}) as RulesConfigMap

  function isRuleEnabled(ruleId: string): boolean {
    const setting = rulesConfig[ruleId as keyof RulesConfigMap]
    return setting !== 'off'
  }

  const ctx: RuleContext = {
    filePath,
    config: cfg,
  }

  for (const plugin of pluginDefs) {
    const r = plugin.rules
    for (const ruleName in r) {
      const fullRuleId = `${plugin.name}/${ruleName}`
      if (!isRuleEnabled(fullRuleId))
        continue
      try {
        const rule = r[ruleName]!
        const out = rule.check(content, ctx)
        for (const i of out)
          issues.push(i)
      }
      catch (e: any) {
        issues.push({
          filePath,
          line: 1,
          column: 1,
          ruleId: `${fullRuleId}-internal` as any,
          message: `Rule threw: ${e?.message || e}`,
          severity: 'error',
        })
      }
    }
  }
  return issues
}

export function scanContent(filePath: string, content: string, cfg: PickierConfig): LintIssue[] {
  const issues: LintIssue[] = []

  // Base formatting-related checks (lightweight heuristics)
  const lines = content.split(/\r?\n/)
  const preferredQuotes = cfg.format.quotes
  let quotesReported = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const indices = detectQuoteIssues(line, preferredQuotes)
    if (indices.length > 0 && !quotesReported) {
      issues.push({ filePath, line: i + 1, column: (indices[0] || 0) + 1, ruleId: 'quotes', message: 'Inconsistent quote style', severity: 'warning' })
      quotesReported = true
    }
    // indentation check: pass leading whitespace only
    const leadingMatch = line.match(/^[ \t]*/)
    const leading = leadingMatch ? leadingMatch[0] : ''
    if (leading.length > 0 && hasIndentIssue(leading, cfg.format.indent, cfg.format.indentStyle)) {
      issues.push({ filePath, line: i + 1, column: 1, ruleId: 'indent', message: 'Incorrect indentation detected', severity: 'warning' })
    }
  }

  // Plugin-based checks
  const pluginIssues: any[] = applyPlugins(filePath, content, cfg)
  for (const i of pluginIssues) {
    // map plugin issue to LintIssue shape if needed
    issues.push({
      filePath: i.filePath,
      line: i.line,
      column: i.column,
      ruleId: i.ruleId,
      message: i.message,
      severity: i.severity,
    })
  }

  return issues
}

export async function runLint(globs: string[], options: LintOptions): Promise<number> {
  const cfg = await loadConfigFromPath(options.config)

  const raw = globs.length ? globs : ['.']
  const patterns = expandPatterns(raw)
  const extCsv = options.ext || cfg.lint.extensions.join(',')
  const extSet = new Set<string>(extCsv.split(',').map((s: string) => {
    const t = s.trim()
    return t.startsWith('.') ? t : `.${t}`
  }))

  const entries: string[] = await tinyGlob(patterns, {
    dot: false,
    ignore: cfg.ignores,
    onlyFiles: true,
    absolute: true,
  })

  const files = entries.filter((f: string) => isCodeFile(f, extSet))

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
