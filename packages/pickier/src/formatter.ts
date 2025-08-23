/* eslint-disable no-console */
import type { FormatOptions, LintIssue, PickierConfig, PickierPlugin, RulesConfigMap } from './types'
import { readFileSync, writeFileSync } from 'node:fs'
import { relative } from 'node:path'
import process from 'node:process'
import { glob as tinyGlob } from 'tinyglobby'
import { formatCode } from './format'
import { getAllPlugins } from './plugins'
import { colors, expandPatterns, loadConfigFromPath } from './utils'

function trace(...args: any[]) {
  if (process.env.PICKIER_TRACE === '1')
    console.log('[pickier:trace]', ...args)
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
    console.error(`[pickier:error] ${label} failed:`, (e as any)?.message || e)
    trace('withTimeout error:', label, e)
    throw e
  }
}

export function applyPluginFixes(filePath: string, content: string, cfg: PickierConfig): string {
  const pluginDefs: Array<PickierPlugin> = getAllPlugins()

  const rulesConfig: RulesConfigMap = (cfg.pluginRules || {}) as RulesConfigMap
  const isRuleEnabled = (ruleId: string) => (rulesConfig as any)[ruleId] !== 'off'

  let current = content
  let changed = true
  let passes = 0
  const maxPasses = 3

  while (changed && passes < maxPasses) {
    changed = false
    passes++
    for (const plugin of pluginDefs) {
      for (const ruleName in plugin.rules) {
        const fullRuleId = `${plugin.name}/${ruleName}`
        if (!isRuleEnabled(fullRuleId))
          continue
        const rule = plugin.rules[ruleName]!
        if (!rule.fix)
          continue
        const fixed = rule.fix(current, { filePath, config: cfg })
        if (fixed !== current) {
          current = fixed
          changed = true
        }
      }
    }
    trace('format pass', relative(process.cwd(), filePath), changed ? 'changed' : 'unchanged')
  }

  return current
}

export function applyFixes(filePath: string, content: string, cfg: PickierConfig): string {
  let current = content
  // 1) quick built-in fix: strip debugger statements if rule enabled
  const lines = current.split(/\r?\n/)
  const kept: string[] = []
  const debuggerStmt = /^\s*debugger\b/
  for (const line of lines) {
    if (cfg.rules.noDebugger !== 'off' && debuggerStmt.test(line))
      continue
    kept.push(line)
  }
  current = kept.join('\n')

  // 2) apply plugin rule fixers iteratively
  current = applyPluginFixes(filePath, current, cfg)

  // 3) apply global formatter as a canonical fixer (until all formatters are migrated to rules)
  current = formatCode(current, cfg, filePath)

  return current
}

export function formatStylish(issues: LintIssue[]): string {
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

export async function runFormat(globs: string[], options: FormatOptions): Promise<number> {
  trace('runFormat:start', { globs, options })
  const cfg = await loadConfigFromPath(options.config)
  const raw = globs.length ? globs : ['.']
  const patterns = expandPatterns(raw)
  trace('patterns', patterns)
  const extSet = new Set((options.ext || cfg.format.extensions.join(',')).split(',').map((s: string) => {
    const t = s.trim()
    return t.startsWith('.') ? t : `.${t}`
  }))

  const timeoutMs = Number(process.env.PICKIER_TIMEOUT_MS || '8000')
  let entries: string[] = []
  const simpleDirPattern = patterns.length === 1 && /\*\*\/*\*$/.test(patterns[0])
  if (simpleDirPattern) {
    const base = patterns[0].replace(/\/?\*\*\/*\*\*?$/, '')
    try {
      const { readdirSync, statSync } = await import('node:fs')
      const { join } = await import('node:path')
      const stack: string[] = [base]
      while (stack.length) {
        const dir = stack.pop()!
        const items = readdirSync(dir)
        for (const it of items) {
          const full = join(dir, it)
          const st = statSync(full)
          if (st.isDirectory())
            stack.push(full)
          else
            entries.push(full)
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
  else {
    entries = await withTimeout(tinyGlob(patterns, {
      dot: false,
      ignore: cfg.ignores,
      onlyFiles: true,
      absolute: true,
    }), timeoutMs, 'tinyGlob')
  }

  trace('globbed entries', entries.length)

  const files = entries.filter((f) => {
    const idx = f.lastIndexOf('.')
    if (idx < 0)
      return true // include files without extensions (edge-case test expects this)
    const ext = f.slice(idx)
    return extSet.has(ext)
  })
  trace('filtered files', files.length)

  let changed = 0
  let checked = 0
  for (const file of files) {
    trace('format start', relative(process.cwd(), file))
    const src = readFileSync(file, 'utf8')
    const fmt = formatCode(src, cfg, file)
    if (options.check) {
      if (fmt !== src) {
        console.log(`${relative(process.cwd(), file)} needs formatting`)
        changed++
      }
      checked++
    }
    else if (options.write) {
      if (fmt !== src) {
        writeFileSync(file, fmt, 'utf8')
        changed++
      }
      checked++
    }
    else {
      // default to check mode when neither flag specified
      if (fmt !== src) {
        console.log(`${relative(process.cwd(), file)} needs formatting`)
        changed++
      }
      checked++
    }
  }

  if (options.verbose) {
    console.log(colors.gray(`Checked ${checked} files, ${changed} changed.`))
  }

  // In check mode, non-zero exit when changes are needed; otherwise 0
  return options.check && changed > 0 ? 1 : 0
}
