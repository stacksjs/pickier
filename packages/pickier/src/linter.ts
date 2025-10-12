import type { LintIssue, LintOptions, PickierConfig, PickierPlugin, RuleContext, RulesConfigMap } from './types'
import { readFileSync, writeFileSync } from 'node:fs'
import { isAbsolute, relative, resolve } from 'node:path'
import process from 'node:process'
import { Logger } from '@stacksjs/clarity'
import { glob as tinyGlob } from 'tinyglobby'
import { detectQuoteIssues, hasIndentIssue } from './format'
import { formatStylish } from './formatter'
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
    const suppress = parseDisableNextLine(text)
    for (const i of pluginIssues) {
      if (signal?.aborted)
        throw new Error('AbortError')
      if (isSuppressed(i.ruleId as string, i.line, suppress))
        continue
      issues.push({
        filePath: i.filePath,
        line: i.line,
        column: i.column,
        ruleId: i.ruleId,
        message: i.message,
        severity: i.severity,
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
        ignore: cfg.ignores,
        onlyFiles: true,
        absolute: true,
      }), timeoutMs, 'tinyGlob')
    }
  }
  else if (!entries.length) {
    entries = await withTimeout(tinyGlob(patterns, {
      dot: false,
      ignore: cfg.ignores,
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

  let allIssues: LintIssue[] = []
  for (const file of files) {
    if (signal?.aborted)
      throw new Error('AbortError')
    const src = readFileSync(file, 'utf8')
    ;(cfg as any)._internalSkipPluginRulesInScan = true
    let issues = scanContent(file, src, cfg)
    try {
      const pluginIssues = await applyPlugins(file, src, cfg)
      const suppress = parseDisableNextLine(src)
      for (const i of pluginIssues) {
        if (signal?.aborted)
          throw new Error('AbortError')
        if (isSuppressed(i.ruleId as string, i.line, suppress))
          continue
        issues.push({
          filePath: i.filePath,
          line: i.line,
          column: i.column,
          ruleId: i.ruleId,
          message: i.message,
          severity: i.severity,
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
      if (!options.dryRun && fixed !== src)
        writeFileSync(file, fixed, 'utf8')
      issues = scanContent(file, fixed, cfg)
    }

    allIssues = allIssues.concat(issues)
  }

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
function parseDisableNextLine(content: string): SuppressMap {
  const map: SuppressMap = new Map()
  const lines = content.split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim()
    // support eslint- and pickier- prefixes
    const m = t.match(/^\/\/\s*(?:eslint|pickier)-disable-next-line\s+(\S.*)$/)
    if (!m)
      continue
    const list = m[1].split(',').map(s => s.trim()).filter(Boolean)
    if (!list.length)
      continue
    const target = i + 2 // next line (1-indexed)
    const set = map.get(target) || new Set<string>()
    for (const item of list) set.add(item)
    map.set(target, set)
  }
  return map
}
function isSuppressed(ruleId: string, line: number, sup: SuppressMap): boolean {
  const set = sup.get(line)
  if (!set || set.size === 0)
    return false
  if (set.has('*'))
    return true
  // exact match
  if (set.has(ruleId))
    return true
  // core kebab/camel equivalence
  const keb = camelToKebab(ruleId)
  if (set.has(keb) || set.has(kebabToCamel(ruleId)))
    return true
  // bare plugin id: allow matching suffix after '/'
  for (const pat of set) {
    if (!pat.includes('/')) {
      if (ruleId.endsWith(`/${pat}`))
        return true
    }
  }
  return false
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
          if (overrideSeverity)
            issues.push({ ...i, severity: overrideSeverity })
          else
            issues.push(i)
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

export function scanContent(filePath: string, content: string, cfg: PickierConfig): LintIssue[] {
  const issues: LintIssue[] = []

  // Base formatting-related checks (lightweight heuristics)
  const lines = content.split(/\r?\n/)
  const suppress = parseDisableNextLine(content)
  const preferredQuotes = cfg.format.quotes
  let quotesReported = false
  const sevMap = (s: 'warn' | 'error' | 'off' | undefined): 'warning' | 'error' | undefined =>
    s === 'warn' ? 'warning' : s === 'error' ? 'error' : undefined
  const wantDebugger = sevMap(cfg.rules.noDebugger)
  const wantConsole = sevMap(cfg.rules.noConsole)
  const wantNoTemplateCurly = sevMap((cfg.rules as any).noTemplateCurlyInString)
  const wantNoCondAssign = sevMap((cfg.rules as any).noCondAssign)
  const consoleCall = /\bconsole\.(?:log|warn|error|info|debug|trace)\s*\(/
  const debuggerStmt = /^\s*debugger\b/
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const indices = detectQuoteIssues(line, preferredQuotes)
    if (indices.length > 0 && !quotesReported) {
      const lineNo = i + 1
      if (!isSuppressed('quotes', lineNo, suppress)) {
        issues.push({ filePath, line: lineNo, column: (indices[0] || 0) + 1, ruleId: 'quotes', message: 'Inconsistent quote style', severity: 'warning' })
      }
      quotesReported = true
    }
    // indentation check: pass leading whitespace only
    const leadingMatch = line.match(/^[ \t]*/)
    const leading = leadingMatch ? leadingMatch[0] : ''
    if (leading.length > 0 && hasIndentIssue(leading, cfg.format.indent, cfg.format.indentStyle)) {
      const lineNo = i + 1
      if (!isSuppressed('indent', lineNo, suppress))
        issues.push({ filePath, line: lineNo, column: 1, ruleId: 'indent', message: 'Incorrect indentation detected', severity: 'warning' })
    }

    // built-in lint rules
    if (wantDebugger && debuggerStmt.test(line)) {
      const lineNo = i + 1
      if (!isSuppressed('noDebugger', lineNo, suppress))
        issues.push({ filePath, line: lineNo, column: 1, ruleId: 'noDebugger', message: 'Unexpected debugger statement', severity: wantDebugger })
    }
    if (wantConsole && consoleCall.test(line)) {
      const lineNo = i + 1
      const col = Math.max(1, line.indexOf('console.') + 1)
      if (!isSuppressed('noConsole', lineNo, suppress))
        issues.push({ filePath, line: lineNo, column: col, ruleId: 'noConsole', message: 'Unexpected console call', severity: wantConsole })
    }

    // no-template-curly-in-string: flag ${...} inside normal strings (" or '), not in template literals
    if (wantNoTemplateCurly) {
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
            const lineNo = i + 1
            if (!isSuppressed('noTemplateCurlyInString', lineNo, suppress)) {
              issues.push({ filePath, line: lineNo, column: k + 1, ruleId: 'noTemplateCurlyInString', message: 'Unexpected template string expression in normal string', severity: wantNoTemplateCurly })
            }
            break
          }
        }
        prev = ch
      }
    }

    // no-cond-assign: forbid assignments inside condition parentheses
    if (wantNoCondAssign) {
      const checkCond = (cond: string) => /[^=!<>]=(?![=])/.test(cond)
      const m1 = line.match(/\b(?:if|while)\s*\(([^)]*)\)/)
      if (m1) {
        const cond = m1[1]
        if (checkCond(cond)) {
          const lineNo = i + 1
          if (!isSuppressed('noCondAssign', lineNo, suppress))
            issues.push({ filePath, line: lineNo, column: Math.max(1, line.indexOf('(') + 1), ruleId: 'noCondAssign', message: 'Unexpected assignment within a conditional expression', severity: wantNoCondAssign })
        }
      }
      const mFor = line.match(/\bfor\s*\(([^)]*)\)/)
      if (mFor) {
        const inside = mFor[1]
        const parts = inside.split(';')
        if (parts.length >= 2) {
          const cond = parts[1]
          if (checkCond(cond)) {
            const lineNo = i + 1
            if (!isSuppressed('noCondAssign', lineNo, suppress))
              issues.push({ filePath, line: lineNo, column: Math.max(1, line.indexOf('(') + 1), ruleId: 'noCondAssign', message: 'Unexpected assignment within a conditional expression', severity: wantNoCondAssign })
          }
        }
      }
    }
  }

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
          ignore: cfg.ignores,
          onlyFiles: true,
          absolute: true,
        }), timeoutMs, 'tinyGlob')
      }
    }
    else if (!entries.length) {
      entries = await withTimeout(tinyGlob(patterns, {
        dot: false,
        ignore: cfg.ignores,
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

    let allIssues: LintIssue[] = []
    for (const file of files) {
      trace('scan start', relative(process.cwd(), file))
      const src = readFileSync(file, 'utf8')
      // Set internal flag to avoid duplicate plugin execution inside scanContent
      ;(cfg as any)._internalSkipPluginRulesInScan = true
      let issues = scanContent(file, src, cfg)
      // Run plugin rules (async with timeouts) and merge
      try {
        const pluginIssues = await applyPlugins(file, src, cfg)
        const suppress = parseDisableNextLine(src)
        for (const i of pluginIssues) {
          if (isSuppressed(i.ruleId as string, i.line, suppress))
            continue
          issues.push({
            filePath: i.filePath,
            line: i.line,
            column: i.column,
            ruleId: i.ruleId,
            message: i.message,
            severity: i.severity,
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
        if (!options.dryRun && fixed !== src)
          writeFileSync(file, fixed, 'utf8')
        // recompute issues after simulated or real fix
        issues = scanContent(file, fixed, cfg)

        if (options.dryRun && src !== fixed && (options.verbose || cfg.verbose)) {
          logger.debug(colors.gray(`dry-run: would apply fixes in ${relative(process.cwd(), file)}`))
        }
      }

      allIssues = allIssues.concat(issues)
      trace('scan done', relative(process.cwd(), file), issues.length)
    }

    const errors = allIssues.filter(i => i.severity === 'error').length
    const warnings = allIssues.filter(i => i.severity === 'warning').length
    trace('issues:summary', { errors, warnings })

    const reporter = options.reporter || cfg.lint.reporter
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
      console.log(formatStylish(allIssues))
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
      fixableRuleIds.add('noDebugger')

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

    if (options.verbose || cfg.verbose) {
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
