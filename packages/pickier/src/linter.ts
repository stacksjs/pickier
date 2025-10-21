import type { LintIssue, LintOptions, PickierConfig, PickierPlugin, RuleContext, RulesConfigMap } from './types'
import { readFileSync, writeFileSync } from 'node:fs'
import { isAbsolute, relative, resolve } from 'node:path'
import process from 'node:process'
import { Logger } from '@stacksjs/clarity'
import { glob as tinyGlob } from 'tinyglobby'
import pLimit from 'p-limit'
import { detectQuoteIssues, hasIndentIssue } from './format'
import { formatStylish, formatVerbose } from './formatter'
import { getAllPlugins } from './plugins'
import { colors, expandPatterns, isCodeFile, loadConfigFromPath, shouldIgnorePath } from './utils'

const logger = new Logger('pickier:lint', {
  showTags: false,
})

function trace(...args: any[]) {
  if (process.env.PICKIER_TRACE === '1')

    logger.error('[pickier:trace]', args)
}

// Programmatic single-text lint with optional cancellation
export async function lintText(
  text: string,
  cfg: PickierConfig,
  filePath = 'untitled',
  signal?: AbortSignal,
): Promise<LintIssue[]> {
  if (signal?.aborted) {
    throw new Error('AbortError')
    // Avoid duplicate plugin execution inside scanContent
  }
  ;(cfg as any)._internalSkipPluginRulesInScan = true
  const issues = scanContent(filePath, text, cfg)
  if (signal?.aborted)
    throw new Error('AbortError')
  try {
    const pluginIssues = await applyPlugins(filePath, text, cfg)
    const suppress = parseDisableDirectives(text)
    const commentLines = getCommentLines(text)
    for (const i of pluginIssues) {
      if (signal?.aborted)
        throw new Error('AbortError')
      if (isSuppressed(i.ruleId as string, i.line, suppress))
        continue
      // Skip issues that are on comment-only lines
      if (commentLines.has(i.line))
        continue
      issues.push({
        filePath: i.filePath,
        line: i.line,
        column: i.column,
        ruleId: i.ruleId,
        message: i.message,
        severity: i.severity,
        ...(i.help && { help: i.help }),
      })
    }
  }
  catch {
    // Ignore plugin errors; scanContent already surfaced baseline issues
  }
  return issues
}

// Programmatic batch lint returning structured result, with optional cancellation
export async function runLintProgrammatic(
  globs: string[],
  options: LintOptions,
  signal?: AbortSignal,
): Promise<{ errors: number, warnings: number, issues: LintIssue[] }> {
  trace('runLintProgrammatic:start', { globs, options })
  const cfg = await loadConfigFromPath(options.config)
  if (signal?.aborted)
    throw new Error('AbortError')

  const raw = globs.length ? globs : ['.']
  const patterns = expandPatterns(raw)
  const extCsv = options.ext || cfg.lint.extensions.join(',')
  const extSet = new Set<string>(extCsv.split(',').map((s: string) => {
    const t = s.trim()
    return t.startsWith('.') ? t : `.${t}`
  }))

  const timeoutMs = Number(process.env.PICKIER_TIMEOUT_MS || '8000')

  // Filter ignore patterns based on whether we're globbing inside or outside the project
  const isGlobbingOutsideProject = patterns.some((p) => {
    const base = p.replace(/\/?\*\*\/*\*\*?$/, '')
    const absBase = isAbsolute(base) ? base : resolve(process.cwd(), base)
    return !absBase.startsWith(process.cwd())
  })

  const universalIgnores = ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**']
  const globIgnores = isGlobbingOutsideProject
    ? cfg.ignores.filter(pattern => universalIgnores.includes(pattern))
    : cfg.ignores

  let entries: string[] = []
  const nonGlobSingle = patterns.length === 1 && !/[*?[\]{}()!]/.test(patterns[0])
  if (nonGlobSingle) {
    try {
      const { statSync } = await import('node:fs')
      const st = statSync(patterns[0])
      if (st.isFile()) {
        const abs = isAbsolute(patterns[0]) ? patterns[0] : resolve(process.cwd(), patterns[0])
        entries = [abs]
      }
    }
    catch {}
  }

  const simpleDirPattern = patterns.length === 1 && /\*\*\/*\*$/.test(patterns[0])
  if (!entries.length && simpleDirPattern) {
    const base = patterns[0].replace(/\/?\*\*\/*\*\*?$/, '')
    const rootBase = isAbsolute(base) ? base : resolve(process.cwd(), base)
    try {
      const { readdirSync, statSync } = await import('node:fs')
      const { join } = await import('node:path')
      const stack: string[] = [rootBase]
      while (stack.length) {
        if (signal?.aborted)
          throw new Error('AbortError')
        const dir = stack.pop()!
        const items = readdirSync(dir)
        for (const it of items) {
          const full = join(dir, it)
          const st = statSync(full)
          if (shouldIgnorePath(full, cfg.ignores))
            continue
          if (st.isDirectory())
            stack.push(full)
          else entries.push(full)
        }
      }
    }
    catch {
      entries = await withTimeout(tinyGlob(patterns, {
        dot: false,
        ignore: globIgnores,
        onlyFiles: true,
        absolute: true,
      }), timeoutMs, 'tinyGlob')
    }
  }
  else if (!entries.length) {
    entries = await withTimeout(tinyGlob(patterns, {
      dot: false,
      ignore: globIgnores,
      onlyFiles: true,
      absolute: true,
    }), timeoutMs, 'tinyGlob')
  }

  if (signal?.aborted)
    throw new Error('AbortError')
  // filter with trace counters
  let cntTotal = 0
  let cntIncluded = 0
  let cntNodeModules = 0
  let cntIgnored = 0
  let cntWrongExt = 0
  const files: string[] = []
  for (const f of entries) {
    cntTotal++
    const p = f.replace(/\\/g, '/')
    if (p.includes('/node_modules/')) {
      cntNodeModules++
      continue
    }
    if (shouldIgnorePath(f, cfg.ignores)) {
      cntIgnored++
      continue
    }
    if (!isCodeFile(f, extSet)) {
      cntWrongExt++
      continue
    }
    files.push(f)
    cntIncluded++
  }
  trace('filter:programmatic', { total: cntTotal, included: cntIncluded, node_modules: cntNodeModules, ignored: cntIgnored, wrongExt: cntWrongExt })

  // OPTIMIZATION: Parallel file processing with concurrency limit
  const concurrency = Number(process.env.PICKIER_CONCURRENCY) || 8
  const limit = pLimit(concurrency)

  const processFile = async (file: string): Promise<LintIssue[]> => {
    if (signal?.aborted)
      throw new Error('AbortError')
    const src = readFileSync(file, 'utf8')

    // OPTIMIZATION: Parse directives and comment lines ONCE upfront
    const suppress = parseDisableDirectives(src)
    const commentLines = getCommentLines(src)

    ;(cfg as any)._internalSkipPluginRulesInScan = true
    // Pass pre-computed data to avoid re-parsing
    let issues = scanContentOptimized(file, src, cfg, suppress, commentLines)

    try {
      const pluginIssues = await applyPlugins(file, src, cfg)
      for (const i of pluginIssues) {
        if (signal?.aborted)
          throw new Error('AbortError')
        if (isSuppressed(i.ruleId as string, i.line, suppress))
          continue
        // Skip issues that are on comment-only lines
        if (commentLines.has(i.line))
          continue
        issues.push({
          filePath: i.filePath,
          line: i.line,
          column: i.column,
          ruleId: i.ruleId,
          message: i.message,
          severity: i.severity,
          ...(i.help && { help: i.help }),
        })
      }
    }
    catch {}

    if (options.fix) {
      const dbgLine = /^\s*debugger\b/
      let fixed = src
      const dbgEnabled = cfg.rules.noDebugger === 'error' || cfg.rules.noDebugger === 'warn'
      if (dbgEnabled) {
        const parts = fixed.split(/\r?\n/)
        const next: string[] = []
        for (const ln of parts) {
          if (dbgLine.test(ln))
            continue
          next.push(ln)
        }
        fixed = next.join('\n')
      }
      fixed = applyPluginFixes(file, fixed, cfg)
      if (!options.dryRun && fixed !== src) {
        writeFileSync(file, fixed, 'utf8')
        // OPTIMIZATION: Only re-scan if content actually changed
        const newSuppress = parseDisableDirectives(fixed)
        const newCommentLines = getCommentLines(fixed)
        issues = scanContentOptimized(file, fixed, cfg, newSuppress, newCommentLines)
      }
    }

    return issues
  }

  const issueArrays = await Promise.all(files.map(file => limit(() => processFile(file))))
  const allIssues = issueArrays.flat()

  const errors = allIssues.filter(i => i.severity === 'error').length
  const warnings = allIssues.filter(i => i.severity === 'warning').length
  return { errors, warnings, issues: allIssues }
}

// --- disable-next-line directives ---
function camelToKebab(s: string): string {
  return s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}
function kebabToCamel(s: string): string {
  return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
}
type SuppressMap = Map<number, Set<string>>
interface DisableDirectives {
  nextLine: SuppressMap // Map of line number -> disabled rules
  fileLevel: Set<string> // Rules disabled for entire file
  rangeDisable: Map<number, Set<string>> // Line where rules are disabled
  rangeEnable: Map<number, Set<string>> // Line where rules are re-enabled
  // OPTIMIZATION: Pre-sorted arrays for binary search
  sortedDisableLines: number[]
  sortedEnableLines: number[]
}

function parseDisableDirectives(content: string): DisableDirectives {
  const nextLine: SuppressMap = new Map()
  const fileLevel = new Set<string>()
  const rangeDisable = new Map<number, Set<string>>()
  const rangeEnable = new Map<number, Set<string>>()
  const lines = content.split(/\r?\n/)

  // Track which rules are currently disabled (for range-based disable/enable)
  const currentlyDisabled = new Set<string>()

  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim()
    const lineNo = i + 1

    // Match disable-next-line comments
    const nextLineMatch = t.match(/^\/\/\s*(?:eslint|pickier)-disable-next-line\s+(\S.*)$/)
    if (nextLineMatch) {
      const list = nextLineMatch[1].split(',').map(s => s.trim()).filter(Boolean)
      if (list.length > 0) {
        const target = lineNo + 1 // next line (1-indexed)
        const set = nextLine.get(target) || new Set<string>()
        for (const item of list) set.add(item)
        nextLine.set(target, set)
      }
      continue
    }

    // Match block comment disable directives (/* eslint-disable */ or /* pickier-disable */)
    const blockDisableMatch = t.match(/^\/\*\s*(?:eslint|pickier)-disable(?:\s+([^*]*))?.*\*\//)
    if (blockDisableMatch) {
      const ruleList = blockDisableMatch[1]?.trim()
      if (!ruleList || ruleList === '') {
        // Disable all rules for the entire file from this line onwards
        rangeDisable.set(lineNo, new Set(['*']))
        currentlyDisabled.add('*')
      }
      else {
        // Disable specific rules
        const list = ruleList.split(',').map(s => s.trim()).filter(Boolean)
        const set = rangeDisable.get(lineNo) || new Set<string>()
        for (const item of list) {
          set.add(item)
          currentlyDisabled.add(item)
        }
        rangeDisable.set(lineNo, set)
      }
      // If this is on line 1, also treat it as file-level
      if (i === 0) {
        if (!ruleList || ruleList === '') {
          fileLevel.add('*')
        }
        else {
          const list = ruleList.split(',').map(s => s.trim()).filter(Boolean)
          for (const item of list) fileLevel.add(item)
        }
      }
      continue
    }

    // Match block comment enable directives (/* eslint-enable */ or /* pickier-enable */)
    const blockEnableMatch = t.match(/^\/\*\s*(?:eslint|pickier)-enable(?:\s+([^*]*))?.*\*\//)
    if (blockEnableMatch) {
      const ruleList = blockEnableMatch[1]?.trim()
      if (!ruleList || ruleList === '') {
        // Re-enable all rules
        rangeEnable.set(lineNo, new Set(['*']))
        currentlyDisabled.clear()
      }
      else {
        // Re-enable specific rules
        const list = ruleList.split(',').map(s => s.trim()).filter(Boolean)
        const set = rangeEnable.get(lineNo) || new Set<string>()
        for (const item of list) {
          set.add(item)
          currentlyDisabled.delete(item)
        }
        rangeEnable.set(lineNo, set)
      }
      continue
    }

    // Match inline comment disable directives (// eslint-disable or // pickier-disable)
    const inlineDisableMatch = t.match(/^\/\/\s*(?:eslint|pickier)-disable(?:\s+(\S.*))?$/)
    if (inlineDisableMatch) {
      const ruleList = inlineDisableMatch[1]?.trim()
      if (!ruleList || ruleList === '') {
        rangeDisable.set(lineNo, new Set(['*']))
        currentlyDisabled.add('*')
      }
      else {
        const list = ruleList.split(',').map(s => s.trim()).filter(Boolean)
        const set = rangeDisable.get(lineNo) || new Set<string>()
        for (const item of list) {
          set.add(item)
          currentlyDisabled.add(item)
        }
        rangeDisable.set(lineNo, set)
      }
      continue
    }

    // Match inline comment enable directives (// eslint-enable or // pickier-enable)
    const inlineEnableMatch = t.match(/^\/\/\s*(?:eslint|pickier)-enable(?:\s+(\S.*))?$/)
    if (inlineEnableMatch) {
      const ruleList = inlineEnableMatch[1]?.trim()
      if (!ruleList || ruleList === '') {
        rangeEnable.set(lineNo, new Set(['*']))
        currentlyDisabled.clear()
      }
      else {
        const list = ruleList.split(',').map(s => s.trim()).filter(Boolean)
        const set = rangeEnable.get(lineNo) || new Set<string>()
        for (const item of list) {
          set.add(item)
          currentlyDisabled.delete(item)
        }
        rangeEnable.set(lineNo, set)
      }
    }
  }

  // OPTIMIZATION: Pre-sort directive line numbers for binary search
  const sortedDisableLines = Array.from(rangeDisable.keys()).sort((a, b) => a - b)
  const sortedEnableLines = Array.from(rangeEnable.keys()).sort((a, b) => a - b)

  return { nextLine, fileLevel, rangeDisable, rangeEnable, sortedDisableLines, sortedEnableLines }
}

// Legacy function for backwards compatibility - now calls parseDisableDirectives
function parseDisableNextLine(content: string): SuppressMap {
  return parseDisableDirectives(content).nextLine
}

// OPTIMIZATION: Binary search helper to find largest value < target
function binarySearchLargestLessThan(arr: number[], target: number): number {
  if (arr.length === 0 || arr[0] >= target)
    return -1

  let left = 0
  let right = arr.length - 1
  let result = -1

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    if (arr[mid] < target) {
      result = arr[mid]
      left = mid + 1
    }
    else {
      right = mid - 1
    }
  }

  return result
}

function isSuppressed(ruleId: string, line: number, directives: SuppressMap | DisableDirectives): boolean {
  // Handle legacy SuppressMap format
  if (directives instanceof Map) {
    const set = directives.get(line)
    if (!set || set.size === 0)
      return false
    return matchesRule(ruleId, set)
  }

  // Check file-level disables first
  if (directives.fileLevel.size > 0) {
    if (matchesRule(ruleId, directives.fileLevel))
      return true
  }

  // Check disable-next-line
  const nextLineSet = directives.nextLine.get(line)
  if (nextLineSet && matchesRule(ruleId, nextLineSet))
    return true

  // OPTIMIZATION: Use binary search on pre-sorted arrays
  const lastDisableLine = binarySearchLargestLessThan(directives.sortedDisableLines, line)
  const lastEnableLine = binarySearchLargestLessThan(directives.sortedEnableLines, line)

  // If there's a disable directive and no more recent enable, check if the rule is disabled
  if (lastDisableLine !== -1 && lastDisableLine > lastEnableLine) {
    const disabledRules = directives.rangeDisable.get(lastDisableLine)!
    if (matchesRule(ruleId, disabledRules))
      return true
  }

  return false
}

function matchesRule(ruleId: string, ruleSet: Set<string>): boolean {
  if (ruleSet.size === 0)
    return false
  if (ruleSet.has('*'))
    return true
  // exact match
  if (ruleSet.has(ruleId))
    return true
  // core kebab/camel equivalence
  const keb = camelToKebab(ruleId)
  if (ruleSet.has(keb) || ruleSet.has(kebabToCamel(ruleId)))
    return true
  // bare plugin id: allow matching suffix after '/'
  for (const pat of ruleSet) {
    if (!pat.includes('/')) {
      if (ruleId.endsWith(`/${pat}`))
        return true
    }
  }
  return false
}

/**
 * Generate default help text for a lint issue if it doesn't already have help.
 * Creates actionable guidance based on the rule ID and message.
 */
function ensureHelpText(issue: LintIssue, ruleId: string): LintIssue {
  if (issue.help) {
    return issue
  }

  // Extract rule name from full rule ID (e.g., "pickier/no-unused-vars" -> "no-unused-vars")
  const ruleName = ruleId.includes('/') ? ruleId.split('/')[1] : ruleId

  // Generate context-aware help based on common rule patterns
  let help: string

  // Pattern matching for common rule types
  if (ruleName.startsWith('no-')) {
    // "no-X" rules - suggest removing the problematic pattern
    const what = ruleName.replace('no-', '').replace(/-/g, ' ')
    help = `Remove or refactor this ${what}. Check the rule documentation for more details or disable with: // eslint-disable-next-line ${ruleId}`
  }
  else if (ruleName.startsWith('prefer-')) {
    // "prefer-X" rules - suggest using the preferred pattern
    const what = ruleName.replace('prefer-', '').replace(/-/g, ' ')
    help = `Consider using ${what} instead. This is a best practice recommendation. Disable with: // eslint-disable-next-line ${ruleId} if needed`
  }
  else if (ruleName.includes('sort') || ruleName.includes('order')) {
    // Sorting/ordering rules
    help = `Reorder these items according to the rule requirements, or use --fix to auto-sort. Disable with: // eslint-disable-next-line ${ruleId}`
  }
  else if (ruleName.includes('indent') || ruleName.includes('spacing') || ruleName.includes('newline')) {
    // Formatting rules
    help = `Fix the formatting issue. Run with --fix to automatically format. Disable with: // eslint-disable-next-line ${ruleId}`
  }
  else {
    // Generic help for other rules
    help = `Fix this issue or disable the rule with: // eslint-disable-next-line ${ruleId}. Check the rule documentation for more details`
  }

  return { ...issue, help }
}

async function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  let to: any
  const timeout = new Promise<never>((_, reject) => {
    to = setTimeout(() => reject(new Error(`Timeout after ${ms}ms at ${label}`)), ms)
  })
  try {
    const res = await Promise.race([p, timeout])
    clearTimeout(to)
    return res as T
  }
  catch (e) {
    // Always surface timeouts to stderr so users see an error without enabling trace

    logger.error(`[pickier:error] ${label} failed:`, (e as any)?.message || e)
    trace('withTimeout error:', label, e)
    throw e
  }
}

export async function applyPlugins(filePath: string, content: string, cfg: PickierConfig): Promise<Array<any>> /* PluginLintIssue[] */ {
  const issues: Array<any> = []
  let pluginDefs: Array<PickierPlugin> = getAllPlugins()

  if (cfg.plugins && cfg.plugins.length > 0) {
    const coreNames = new Set(['pickier', 'style', 'regexp', 'ts'])
    const userPlugins = cfg.plugins.filter(p => typeof p !== 'string') as PickierPlugin[]
    const hasCoreMatch = userPlugins.some(p => coreNames.has(p.name))
    // If user provided plugins and none are core, only use user plugins
    pluginDefs = hasCoreMatch ? pluginDefs : []
    for (const p of userPlugins)
      pluginDefs.push(p)
  }

  // Merge bare rules into pluginRules for convenience
  const rulesConfig: RulesConfigMap = { ...(cfg.pluginRules || {}) as RulesConfigMap }
  if (cfg.rules?.noUnusedCapturingGroup)
    rulesConfig['regexp/no-unused-capturing-group'] = cfg.rules.noUnusedCapturingGroup
  // Also support bare rule IDs (without plugin prefix) by mapping to any plugins that define them
  for (const key of Object.keys(cfg.pluginRules || {})) {
    if (!key.includes('/')) {
      for (const p of pluginDefs) {
        if (p.rules && Object.prototype.hasOwnProperty.call(p.rules, key)) {
          (rulesConfig as any)[`${p.name}/${key}`] = (cfg.pluginRules as any)[key]
        }
      }
    }
  }

  function getRuleSetting(ruleId: string): { enabled: boolean, severity?: 'error' | 'warning', options?: any } {
    const raw = rulesConfig[ruleId as keyof RulesConfigMap] as any
    let sev: 'error' | 'warning' | undefined
    let opts: any
    if (typeof raw === 'string') {
      if (raw === 'error')
        sev = 'error'
      else if (raw === 'warn' || raw === 'warning')
        sev = 'warning'
    }
    else if (Array.isArray(raw) && typeof raw[0] === 'string') {
      const s = raw[0]
      if (s === 'error')
        sev = 'error'
      else if (s === 'warn' || s === 'warning')
        sev = 'warning'
      opts = raw[1]
    }
    return { enabled: !!sev, severity: sev, options: opts }
  }

  const baseCtx: RuleContext = { filePath, config: cfg }

  for (const plugin of pluginDefs) {
    const r = plugin.rules
    for (const ruleName in r) {
      const fullRuleId = `${plugin.name}/${ruleName}`
      const setting = getRuleSetting(fullRuleId)
      if (!setting.enabled)
        continue
      const rule = r[ruleName]!
      const overrideSeverity = setting.severity
      if (!rule || typeof (rule as any).check !== 'function') {
        // If a rule is referenced in config but has no implementation (e.g. JSON-stripped functions),
        // only raise an internal error when configured as 'error'. Otherwise, skip silently.
        if (overrideSeverity === 'error') {
          issues.push({
            filePath,
            line: 1,
            column: 1,
            ruleId: `${fullRuleId}-internal` as any,
            message: 'Rule missing implementation (check function is undefined)',
            severity: 'error',
          })
        }
        continue
      }
      try {
        trace('rule:start', fullRuleId)
        const ruleTimeoutMs = Number(process.env.PICKIER_RULE_TIMEOUT_MS || '5000')
        const ctx: RuleContext = { ...baseCtx, options: setting.options }
        const out = await withTimeout(Promise.resolve().then(() => (rule as any).check(content, ctx)), ruleTimeoutMs, `rule:${fullRuleId}`)
        trace('rule:end', fullRuleId, Array.isArray(out) ? out.length : 0)
        for (const i of out) {
          // Ensure all issues have help text
          const issueWithHelp = ensureHelpText(i, fullRuleId)
          if (overrideSeverity)
            issues.push({ ...issueWithHelp, severity: overrideSeverity })
          else
            issues.push(issueWithHelp)
        }
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

function applyPluginFixes(filePath: string, content: string, cfg: PickierConfig): string {
  const pluginDefs: Array<PickierPlugin> = getAllPlugins()
  if (cfg.plugins && cfg.plugins.length > 0) {
    for (const p of cfg.plugins) {
      if (typeof p === 'string')
        continue
      pluginDefs.push(p)
    }
  }

  // Merge bare rules into pluginRules for convenience
  const rulesConfig: RulesConfigMap = { ...(cfg.pluginRules || {}) as RulesConfigMap }
  if (cfg.rules?.noUnusedCapturingGroup)
    (rulesConfig as any)['regexp/no-unused-capturing-group'] = cfg.rules.noUnusedCapturingGroup
  // Support bare rule IDs by mapping to matching plugins
  for (const key of Object.keys(cfg.pluginRules || {})) {
    if (!key.includes('/')) {
      for (const p of pluginDefs) {
        if (p.rules && Object.prototype.hasOwnProperty.call(p.rules, key))
          (rulesConfig as any)[`${p.name}/${key}`] = (cfg.pluginRules as any)[key]
      }
    }
  }

  const getRuleSetting = (ruleId: string): { enabled: boolean, options?: any } => {
    const raw = rulesConfig[ruleId as keyof RulesConfigMap] as any
    if (typeof raw === 'string')
      return { enabled: raw === 'error' || raw === 'warn' || raw === 'warning' }
    if (Array.isArray(raw) && typeof raw[0] === 'string')
      return { enabled: raw[0] === 'error' || raw[0] === 'warn' || raw[0] === 'warning', options: raw[1] }
    return { enabled: false }
  }

  const baseCtx: RuleContext = { filePath, config: cfg }
  let out = content
  let changed = true
  let passes = 0
  const maxPasses = 5
  while (changed && passes++ < maxPasses) {
    changed = false
    for (const plugin of pluginDefs) {
      for (const ruleName in plugin.rules) {
        const fullRuleId = `${plugin.name}/${ruleName}`
        const setting = getRuleSetting(fullRuleId)
        if (!setting.enabled)
          continue
        const rule = plugin.rules[ruleName]!
        if (typeof rule.fix !== 'function')
          continue
        const ctx: RuleContext = { ...baseCtx, options: setting.options }
        const next = rule.fix(out, ctx)
        if (next !== out) {
          out = next
          changed = true
        }
      }
    }
  }
  return out
}

// Helper function to remove regex literals from a line
function stripRegexLiterals(line: string): string {
  let result = ''
  let i = 0
  while (i < line.length) {
    // Check if we're at the start of a regex literal
    if (line[i] === '/' && i > 0) {
      // Look back to see if this could be a regex (after =, (, [, {, :, etc.)
      const before = line.slice(0, i).trimEnd()
      if (/[=([{,:;!&|?]$/.test(before) || before.endsWith('return')) {
        // This looks like a regex literal, skip to the closing /
        i++ // skip opening /
        while (i < line.length) {
          if (line[i] === '\\') {
            i += 2 // skip escape sequence
            continue
          }
          if (line[i] === '/') {
            i++ // skip closing /
            // skip any regex flags (g, i, m, etc.)
            while (i < line.length && /[gimsuvy]/.test(line[i])) {
              i++
            }
            break
          }
          i++
        }
        continue
      }
    }
    result += line[i]
    i++
  }
  return result
}

// Strip comments from a line, preserving string content
function stripComments(line: string): string {
  let result = ''
  let i = 0
  let inString: 'single' | 'double' | 'template' | null = null
  let escaped = false

  while (i < line.length) {
    const ch = line[i]
    const next = line[i + 1]

    if (escaped) {
      result += ch
      escaped = false
      i++
      continue
    }

    if (ch === '\\' && inString) {
      escaped = true
      result += ch
      i++
      continue
    }

    // Handle string boundaries
    if (!inString) {
      if (ch === '"') {
        inString = 'double'
        result += ch
        i++
        continue
      }
      if (ch === '\'') {
        inString = 'single'
        result += ch
        i++
        continue
      }
      if (ch === '`') {
        inString = 'template'
        result += ch
        i++
        continue
      }

      // Check for single-line comment
      if (ch === '/' && next === '/') {
        // Rest of line is a comment, stop here
        break
      }

      // Check for block comment start
      if (ch === '/' && next === '*') {
        // Skip until we find */
        i += 2
        while (i < line.length) {
          if (line[i] === '*' && line[i + 1] === '/') {
            i += 2
            break
          }
          i++
        }
        // Add a space to preserve word boundaries
        result += ' '
        continue
      }

      result += ch
      i++
    }
    else {
      // Inside string, check for end
      if ((inString === 'double' && ch === '"')
        || (inString === 'single' && ch === '\'')
        || (inString === 'template' && ch === '`')) {
        inString = null
      }
      result += ch
      i++
    }
  }

  return result
}

// Build a set of line numbers that are entirely inside comments
function getCommentLines(content: string): Set<number> {
  const commentLines = new Set<number>()
  const lines = content.split(/\r?\n/)
  let inBlockComment = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNo = i + 1
    const trimmed = line.trim()

    // If we're inside a block comment from previous lines
    if (inBlockComment) {
      commentLines.add(lineNo)

      // Check if block comment ends on this line
      if (line.includes('*/')) {
        inBlockComment = false
      }
      continue
    }

    // Check for single-line comment (entire line is a comment)
    if (trimmed.startsWith('//')) {
      commentLines.add(lineNo)
      continue
    }

    // Check for block comment start
    // First, remove any single-line comment from consideration
    const beforeSingleComment = line.split('//')[0]
    const blockStartIdx = beforeSingleComment.indexOf('/*')

    if (blockStartIdx !== -1) {
      // There's a block comment on this line
      const beforeBlock = beforeSingleComment.substring(0, blockStartIdx).trim()
      const afterBlockStart = beforeSingleComment.substring(blockStartIdx)
      const blockEndIdx = afterBlockStart.indexOf('*/')

      // Check if this line has only the block comment (no code before it)
      if (beforeBlock === '') {
        commentLines.add(lineNo)

        // Check if block comment ends on the same line
        if (blockEndIdx === -1) {
          // Block comment continues to next lines
          inBlockComment = true
        }
      }
      // If there's code before the block comment, we don't mark the line as a comment
    }
  }

  return commentLines
}

// Optimized version that accepts pre-computed directive and comment data
export function scanContentOptimized(
  filePath: string,
  content: string,
  cfg: PickierConfig,
  suppress: DisableDirectives,
  commentLines: Set<number>,
): LintIssue[] {
  const issues: LintIssue[] = []

  // Base formatting-related checks (lightweight heuristics)
  const lines = content.split(/\r?\n/)
  const preferredQuotes = cfg.format.quotes
  let quotesReported = false
  const sevMap = (s: 'warn' | 'error' | 'off' | undefined): 'warning' | 'error' | undefined =>
    s === 'warn' ? 'warning' : s === 'error' ? 'error' : undefined
  const wantDebugger = sevMap(cfg.rules.noDebugger)
  const wantConsole = sevMap(cfg.rules.noConsole)
  const wantNoTemplateCurly = sevMap((cfg.rules as any).noTemplateCurlyInString)
  const wantNoCondAssign = sevMap((cfg.rules as any).noCondAssign)
  const consoleCall = /\bconsole\.log\s*\(/
  const debuggerStmt = /^\s*debugger\b/

  // Build a set of line numbers that are inside multi-line template literals
  const linesInTemplate = new Set<number>()
  let inTemplate = false
  let escaped = false
  let currentLine = 1
  for (let i = 0; i < content.length; i++) {
    const ch = content[i]

    if (escaped) {
      escaped = false
      if (ch === '\n')
        currentLine++
      continue
    }

    if (ch === '\\') {
      escaped = true
      continue
    }

    if (ch === '\n') {
      currentLine++
      continue
    }

    if (ch === '`') {
      inTemplate = !inTemplate
      continue
    }

    if (inTemplate) {
      linesInTemplate.add(currentLine)
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNo = i + 1

    // Skip lines that are entirely comments
    if (commentLines.has(lineNo)) {
      continue
    }

    // Skip quote detection for lines inside multi-line template literals
    if (!linesInTemplate.has(lineNo)) {
      // Strip comments and regex literals to avoid false positives
      const strippedLine = stripComments(stripRegexLiterals(line))
      const indices = detectQuoteIssues(strippedLine, preferredQuotes)
      if (indices.length > 0 && !quotesReported) {
        if (!isSuppressed('quotes', lineNo, suppress)) {
          issues.push({ filePath, line: lineNo, column: (indices[0] || 0) + 1, ruleId: 'quotes', message: 'Inconsistent quote style', severity: 'warning', help: `Use ${preferredQuotes} quotes consistently throughout your code. You can change the preferred quote style in your config with format.quotes: '${preferredQuotes === 'single' ? 'double' : 'single'}'` })
        }
        quotesReported = true
      }
    }
    // indentation check: pass leading whitespace only
    const leadingMatch = line.match(/^[ \t]*/)
    const leading = leadingMatch ? leadingMatch[0] : ''
    if (leading.length > 0 && hasIndentIssue(leading, cfg.format.indent, cfg.format.indentStyle)) {
      if (!isSuppressed('indent', lineNo, suppress))
        issues.push({ filePath, line: lineNo, column: 1, ruleId: 'indent', message: 'Incorrect indentation detected', severity: 'warning', help: `Use ${cfg.format.indentStyle === 'spaces' ? `${cfg.format.indent} spaces` : 'tabs'} for indentation. Configure with format.indent and format.indentStyle in your config` })
    }

    // built-in lint rules
    if (wantDebugger && debuggerStmt.test(line)) {
      if (!isSuppressed('no-debugger', lineNo, suppress))
        issues.push({ filePath, line: lineNo, column: 1, ruleId: 'no-debugger', message: 'Unexpected debugger statement', severity: wantDebugger, help: 'Remove debugger statements before committing code. Use breakpoints in your IDE instead, or run with --fix to auto-remove' })
    }
    // Skip console detection for lines inside multi-line template literals
    if (wantConsole && !linesInTemplate.has(lineNo) && consoleCall.test(line)) {
      // Skip if console appears in a comment
      const commentIdx = line.indexOf('//')
      const consoleIdx = line.indexOf('console.')
      if (commentIdx !== -1 && consoleIdx > commentIdx) {
        // console is inside a comment, skip it
      }
      else {
        // Check if console is inside a string literal
        let inString: 'single' | 'double' | 'template' | null = null
        for (let k = 0; k < line.length; k++) {
          const ch = line[k]
          if (!inString) {
            if (ch === '"') {
              inString = 'double'
            }
            else if (ch === '\'') {
              inString = 'single'
            }
            else if (ch === '`') {
              inString = 'template'
            }
            else if (line.slice(k).startsWith('console.')) {
              // Found console outside of string, this is a real console call
              const col = k + 1
              if (!isSuppressed('no-console', lineNo, suppress))
                issues.push({ filePath, line: lineNo, column: col, ruleId: 'no-console', message: 'Unexpected console call', severity: wantConsole, help: 'Remove console statements before committing. Use a proper logging library or disable this rule if console output is intentional' })
              break
            }
          }
          else {
            // Check for string end
            if ((inString === 'double' && ch === '"') || (inString === 'single' && ch === '\'') || (inString === 'template' && ch === '`')) {
              if (k === 0 || line[k - 1] !== '\\')
                inString = null
            }
            // If console.log is found inside a string, we just skip it (no action needed)
          }
        }
      }
    }

    // no-template-curly-in-string: flag ${...} inside normal strings (" or '), not in template literals
    // Skip this check for lines inside multi-line template literals (test content)
    if (wantNoTemplateCurly && !linesInTemplate.has(lineNo)) {
      const ln = line
      let inStr: 'single' | 'double' | 'template' | null = null
      let prev = ''
      for (let k = 0; k < ln.length; k++) {
        const ch = ln[k]
        if (!inStr) {
          if (ch === '"') {
            inStr = 'double'
            prev = ch
            continue
          }
          if (ch === '\'') {
            inStr = 'single'
            prev = ch
            continue
          }
          if (ch === '`') {
            inStr = 'template'
            prev = ch
            continue
          }
        }
        else {
          if ((inStr === 'double' && ch === '"') || (inStr === 'single' && ch === '\'') || (inStr === 'template' && ch === '`')) {
            if (prev !== '\\')
              inStr = null
          }
          else if (ch === '$' && ln[k + 1] === '{' && prev !== '\\' && inStr !== 'template') {
            if (!isSuppressed('no-template-curly-in-string', lineNo, suppress)) {
              issues.push({ filePath, line: lineNo, column: k + 1, ruleId: 'no-template-curly-in-string', message: 'Unexpected template string expression in normal string', severity: wantNoTemplateCurly, help: 'Change the string quotes from \' or " to backticks (`) to use template literal interpolation, or escape the $ if you meant to use it literally' })
            }
            break
          }
        }
        prev = ch
      }
    }

    // no-cond-assign: forbid assignments inside condition parentheses
    // Skip this check for lines inside multi-line template literals (test content)
    if (wantNoCondAssign && !linesInTemplate.has(lineNo)) {
      // Strip comments and regex literals to avoid false positives
      const strippedLine = stripComments(stripRegexLiterals(line))
      // Check for assignment (single =) but exclude comparisons (==, ===) and arrow functions (=>)
      const checkCond = (cond: string) => /[^=!<>]=(?![=>])/.test(cond)
      const m1 = strippedLine.match(/\b(?:if|while)\s*\(([^)]*)\)/)
      if (m1) {
        const cond = m1[1]
        if (checkCond(cond)) {
          if (!isSuppressed('no-cond-assign', lineNo, suppress))
            issues.push({ filePath, line: lineNo, column: Math.max(1, line.indexOf('(') + 1), ruleId: 'no-cond-assign', message: 'Unexpected assignment within a conditional expression', severity: wantNoCondAssign, help: 'Use === or == for comparison instead of = (assignment). If assignment was intentional, wrap it in parentheses: if ((x = value))' })
        }
      }
      const mFor = strippedLine.match(/\bfor\s*\(([^)]*)\)/)
      if (mFor) {
        const inside = mFor[1]
        const parts = inside.split(';')
        if (parts.length >= 2) {
          const cond = parts[1]
          if (checkCond(cond)) {
            if (!isSuppressed('no-cond-assign', lineNo, suppress))
              issues.push({ filePath, line: lineNo, column: Math.max(1, line.indexOf('(') + 1), ruleId: 'no-cond-assign', message: 'Unexpected assignment within a conditional expression', severity: wantNoCondAssign, help: 'Use === or == for comparison instead of = (assignment). If assignment was intentional, wrap it in parentheses: for (let i = 0; (x = arr[i]); i++)' })
          }
        }
      }
    }
  }

  return issues
}

export function scanContent(filePath: string, content: string, cfg: PickierConfig): LintIssue[] {
  // Parse directives and comment lines ONCE
  const suppress = parseDisableDirectives(content)
  const commentLines = getCommentLines(content)

  // Use optimized version for base scanning
  const issues = scanContentOptimized(filePath, content, cfg, suppress, commentLines)

  // Synchronous plugin rule checks for callers that directly use scanContent (e.g. unit tests).
  // When runLint orchestrates, it sets an internal flag to skip this to avoid duplication.
  if (!(cfg as any)._internalSkipPluginRulesInScan) {
    try {
      let pluginDefs: Array<PickierPlugin> = getAllPlugins()
      if (cfg.plugins && cfg.plugins.length > 0) {
        const coreNames = new Set(['pickier', 'style', 'regexp', 'ts'])
        const userPlugins = cfg.plugins.filter(p => typeof p !== 'string') as PickierPlugin[]
        const hasCoreMatch = userPlugins.some(p => coreNames.has(p.name))
        pluginDefs = hasCoreMatch ? pluginDefs : []
        for (const p of userPlugins) pluginDefs.push(p)
      }

      const rulesConfig: RulesConfigMap = { ...(cfg.pluginRules || {}) as RulesConfigMap }
      if (cfg.rules?.noUnusedCapturingGroup)
        (rulesConfig as any)['regexp/no-unused-capturing-group'] = cfg.rules.noUnusedCapturingGroup
      for (const key of Object.keys(cfg.pluginRules || {})) {
        if (!key.includes('/')) {
          for (const p of pluginDefs) {
            if (p.rules && Object.prototype.hasOwnProperty.call(p.rules, key))
              (rulesConfig as any)[`${p.name}/${key}`] = (cfg.pluginRules as any)[key]
          }
        }
      }

      const isRuleEnabled = (ruleId: string): boolean => {
        const raw = (rulesConfig as any)[ruleId]
        const setting = typeof raw === 'string' ? raw : undefined
        return setting === 'error' || setting === 'warn' || setting === 'warning'
      }
      const getRuleSeverity = (ruleId: string): 'error' | 'warning' | undefined => {
        const raw = (rulesConfig as any)[ruleId]
        const setting = typeof raw === 'string' ? raw : undefined
        if (setting === 'error')
          return 'error'
        if (setting === 'warn' || setting === 'warning')
          return 'warning'
        return undefined
      }

      const ctx: RuleContext = { filePath, config: cfg }
      for (const plugin of pluginDefs) {
        const r = plugin.rules
        for (const ruleName in r) {
          const fullRuleId = `${plugin.name}/${ruleName}`
          if (!isRuleEnabled(fullRuleId))
            continue
          const rule = r[ruleName]!
          if (!rule || typeof (rule as any).check !== 'function')
            continue
          const out = (rule as any).check(content, ctx)
          for (const i of out) {
            if (!isSuppressed(i.ruleId as string, i.line, suppress)) {
              const sev = getRuleSeverity(fullRuleId)
              issues.push(sev ? { ...i, severity: sev } : i)
            }
          }
        }
      }
    }
    catch {
      // swallow plugin errors in scanContent to keep behavior simple for tests
    }
  }

  return issues
}

export async function runLint(globs: string[], options: LintOptions): Promise<number> {
  trace('runLint:start', { globs, options })
  try {
    const cfg = await loadConfigFromPath(options.config)
    trace('config:loaded', { reporter: cfg.lint.reporter, ext: cfg.lint.extensions.join(',') })

    const raw = globs.length ? globs : ['.']
    const patterns = expandPatterns(raw)
    trace('patterns', patterns)
    const extCsv = options.ext || cfg.lint.extensions.join(',')
    const extSet = new Set<string>(extCsv.split(',').map((s: string) => {
      const t = s.trim()
      return t.startsWith('.') ? t : `.${t}`
    }))

    const timeoutMs = Number(process.env.PICKIER_TIMEOUT_MS || '8000')

    // Filter ignore patterns based on whether we're globbing inside or outside the project
    // Universal ignores (like **/node_modules/**, **/dist/**) always apply
    // Project-specific ignores (like **/*.test.ts, docs/**) only apply within the project
    const isGlobbingOutsideProject = patterns.some((p) => {
      const base = p.replace(/\/?\*\*\/*\*\*?$/, '')
      const absBase = isAbsolute(base) ? base : resolve(process.cwd(), base)
      return !absBase.startsWith(process.cwd())
    })

    // Universal ignore patterns that should apply everywhere
    const universalIgnores = ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**']
    const globIgnores = isGlobbingOutsideProject
      ? cfg.ignores.filter(pattern => universalIgnores.includes(pattern))
      : cfg.ignores

    // Fallbacks to avoid globby hangs: handle explicit file paths and simple directory scans
    let entries: string[] = []
    // Fast path: if a single concrete file (no glob magic) is provided, just use it directly
    const nonGlobSingle = patterns.length === 1 && !/[*?[\]{}()!]/.test(patterns[0])
    if (nonGlobSingle) {
      try {
        const { statSync } = await import('node:fs')
        const st = statSync(patterns[0])
        if (st.isFile()) {
          const abs = isAbsolute(patterns[0]) ? patterns[0] : resolve(process.cwd(), patterns[0])
          entries = [abs]
        }
      }
      catch {
        // fall through to other strategies
      }
    }

    const simpleDirPattern = patterns.length === 1 && /\*\*\/*\*$/.test(patterns[0])
    if (!entries.length && simpleDirPattern) {
      const base = patterns[0].replace(/\/?\*\*\/*\*\*?$/, '')
      try {
        const { readdirSync, statSync } = await import('node:fs')
        const { join } = await import('node:path')
        const rootBase = isAbsolute(base) ? base : resolve(process.cwd(), base)
        const stack: string[] = [rootBase]
        while (stack.length) {
          const dir = stack.pop()!
          const items = readdirSync(dir)
          for (const it of items) {
            const full = join(dir, it)
            const st = statSync(full)
            if (shouldIgnorePath(full, cfg.ignores))
              continue
            if (st.isDirectory())
              stack.push(full)
            else
              entries.push(full)
          }
        }
      }
      catch {
        // If fallback fails, use tinyglobby with timeout
        entries = await withTimeout(tinyGlob(patterns, {
          dot: false,
          ignore: globIgnores,
          onlyFiles: true,
          absolute: true,
        }), timeoutMs, 'tinyGlob')
      }
    }
    else if (!entries.length) {
      entries = await withTimeout(tinyGlob(patterns, {
        dot: false,
        ignore: globIgnores,
        onlyFiles: true,
        absolute: true,
      }), timeoutMs, 'tinyGlob')
    }

    trace('globbed entries', entries.length)
    // filter with trace counters
    let cntTotal = 0
    let cntIncluded = 0
    let cntNodeModules = 0
    let cntIgnored = 0
    let cntWrongExt = 0
    const files: string[] = []
    for (const f of entries) {
      cntTotal++
      const p = f.replace(/\\/g, '/')
      if (p.includes('/node_modules/')) {
        cntNodeModules++
        continue
      }
      if (shouldIgnorePath(f, cfg.ignores)) {
        cntIgnored++
        continue
      }
      if (!isCodeFile(f, extSet)) {
        cntWrongExt++
        continue
      }
      files.push(f)
      cntIncluded++
    }
    trace('filter:cli', { total: cntTotal, included: cntIncluded, node_modules: cntNodeModules, ignored: cntIgnored, wrongExt: cntWrongExt })
    trace('filtered files', files.length)

    // OPTIMIZATION: Parallel file processing with concurrency limit
    const concurrency = Number(process.env.PICKIER_CONCURRENCY) || 8
    const limit = pLimit(concurrency)

    const processFile = async (file: string): Promise<LintIssue[]> => {
      trace('scan start', relative(process.cwd(), file))
      const src = readFileSync(file, 'utf8')

      // OPTIMIZATION: Parse directives and comment lines ONCE upfront
      const suppress = parseDisableDirectives(src)
      const commentLines = getCommentLines(src)

      // Set internal flag to avoid duplicate plugin execution inside scanContent
      ;(cfg as any)._internalSkipPluginRulesInScan = true
      let issues = scanContentOptimized(file, src, cfg, suppress, commentLines)

      // Run plugin rules (async with timeouts) and merge
      try {
        const pluginIssues = await applyPlugins(file, src, cfg)
        for (const i of pluginIssues) {
          if (isSuppressed(i.ruleId as string, i.line, suppress))
            continue
          // Skip issues that are on comment-only lines
          if (commentLines.has(i.line))
            continue
          issues.push({
            filePath: i.filePath,
            line: i.line,
            column: i.column,
            ruleId: i.ruleId,
            message: i.message,
            severity: i.severity,
            ...(i.help && { help: i.help }),
          })
        }
      }
      catch {
        // Already surfaced via applyPlugins error path; keep going
      }

      if (options.fix) {
        // Built-in simple fixer: remove lines that are actual debugger statements (not in strings/comments)
        const dbgLine = /^\s*debugger\b/
        let fixed = src
        const dbgEnabled = cfg.rules.noDebugger === 'error' || cfg.rules.noDebugger === 'warn'
        if (dbgEnabled) {
          const parts = fixed.split(/\r?\n/)
          const next: string[] = []
          for (const ln of parts) {
            if (dbgLine.test(ln))
              continue
            next.push(ln)
          }
          fixed = next.join('\n')
        }
        // Apply plugin rule fixers only (no global formatting in lint --fix)
        fixed = applyPluginFixes(file, fixed, cfg)
        if (!options.dryRun && fixed !== src) {
          writeFileSync(file, fixed, 'utf8')
          // OPTIMIZATION: Only re-scan if content actually changed
          const newSuppress = parseDisableDirectives(fixed)
          const newCommentLines = getCommentLines(fixed)
          issues = scanContentOptimized(file, fixed, cfg, newSuppress, newCommentLines)
        }

        if (options.dryRun && src !== fixed && (options.verbose !== undefined ? options.verbose : cfg.verbose)) {
          logger.debug(colors.gray(`dry-run: would apply fixes in ${relative(process.cwd(), file)}`))
        }
      }

      trace('scan done', relative(process.cwd(), file), issues.length)
      return issues
    }

    const issueArrays = await Promise.all(files.map(file => limit(() => processFile(file))))
    const allIssues = issueArrays.flat()

    const errors = allIssues.filter(i => i.severity === 'error').length
    const warnings = allIssues.filter(i => i.severity === 'warning').length
    trace('issues:summary', { errors, warnings })

    const reporter = options.reporter || cfg.lint.reporter
    // Determine verbose mode with proper precedence: CLI option > config > default
    const isVerbose = options.verbose !== undefined ? options.verbose : cfg.verbose

    if (reporter === 'json') {
      // eslint-disable-next-line no-console
      console.log(JSON.stringify({ errors, warnings, issues: allIssues }, null, 2))
    }
    else if (reporter === 'compact') {
      for (const i of allIssues) {
        // eslint-disable-next-line no-console
        console.log(`${relative(process.cwd(), i.filePath)}:${i.line}:${i.column} ${i.severity} ${i.ruleId} ${i.message}`)
      }
    }
    else if (allIssues.length > 0) {
      // eslint-disable-next-line no-console
      console.log(isVerbose ? formatVerbose(allIssues) : formatStylish(allIssues))
    }

    // Print summary (similar to ESLint)
    if (allIssues.length > 0 && reporter !== 'json') {
      const total = errors + warnings
      const problemsText = total === 1 ? 'problem' : 'problems'
      const errorsText = errors === 1 ? 'error' : 'errors'
      const warningsText = warnings === 1 ? 'warning' : 'warnings'

      // Count fixable issues (rules with fix functions)
      const pluginDefs = getAllPlugins()
      const fixableRuleIds = new Set<string>()

      // Built-in fixable rules
      fixableRuleIds.add('no-debugger')

      // Plugin rules with fix functions
      for (const plugin of pluginDefs) {
        for (const ruleName in plugin.rules) {
          const rule = plugin.rules[ruleName]
          if (rule && typeof rule.fix === 'function') {
            fixableRuleIds.add(`${plugin.name}/${ruleName}`)
          }
        }
      }

      let fixableErrors = 0
      let fixableWarnings = 0
      for (const issue of allIssues) {
        const ruleId = issue.ruleId as string
        // Check both full rule ID (plugin/rule) and short form (rule)
        const isFixable = fixableRuleIds.has(ruleId)
          || Array.from(fixableRuleIds).some(id => id.endsWith(`/${ruleId}`))

        if (isFixable) {
          if (issue.severity === 'error')
            fixableErrors++
          else if (issue.severity === 'warning')
            fixableWarnings++
        }
      }

      // eslint-disable-next-line no-console
      console.log()
      // eslint-disable-next-line no-console
      console.log(colors.red(`✖ ${total} ${problemsText} (${errors} ${errorsText}, ${warnings} ${warningsText})`))

      if (fixableErrors > 0 || fixableWarnings > 0) {
        const fixableErrorsText = fixableErrors === 1 ? 'error' : 'errors'
        const fixableWarningsText = fixableWarnings === 1 ? 'warning' : 'warnings'
        // eslint-disable-next-line no-console
        console.log(colors.gray(`  ${fixableErrors} ${fixableErrorsText} and ${fixableWarnings} ${fixableWarningsText} potentially fixable with the \`--fix\` option.`))
      }
    }

    // Don't print summary for JSON reporter (would invalidate JSON output)
    if (isVerbose && reporter !== 'json') {
      // eslint-disable-next-line no-console
      console.log(colors.gray(`Scanned ${files.length} files, found ${errors} errors and ${warnings} warnings.`))
    }

    const maxWarnings = options.maxWarnings ?? cfg.lint.maxWarnings
    const failOnWarnings = process.env.PICKIER_FAIL_ON_WARNINGS === '1'
    if (errors > 0) {
      trace('runLint:end', 1)
      return 1
    }
    if (failOnWarnings && warnings > 0) {
      trace('runLint:end', 1)
      return 1
    }
    if (maxWarnings >= 0 && warnings > maxWarnings) {
      trace('runLint:end', 1)
      return 1
    }
    trace('runLint:end', 0)
    return 0
  }
  catch (e: any) {
    logger.error('[pickier:error] runLint failed:', e?.message || e)
    trace('runLint:exception', e)
    return 1
  }
}
