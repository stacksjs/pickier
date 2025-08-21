/* eslint-disable no-cond-assign, regexp/no-super-linear-backtracking, unused-imports/no-unused-vars, regexp/no-unused-capturing-group */
import type { PickierConfig, PickierPlugin, LintIssue as PluginLintIssue, RuleContext, RulesConfigMap } from '../../types'
import type { LintIssue } from './types'
import { detectQuoteIssues, hasIndentIssue } from '../../format'
import { getAllPlugins } from './plugins'

export function applyPlugins(filePath: string, content: string, cfg: PickierConfig): PluginLintIssue[] {
  const issues: PluginLintIssue[] = []
  const pluginDefs: Array<PickierPlugin> = getAllPlugins()

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
      const conf = (configured as any)[ruleName] ?? (configured as any)[fullName]
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

export function scanContent(filePath: string, content: string, cfg: PickierConfig): LintIssue[] {
  const issues: LintIssue[] = []
  const lines = content.split(/\r?\n/)

  // Support inline suppression for next line via both ESLint and Pickier prefixes
  // Examples:
  // // eslint-disable-next-line no-console, quotes
  // // pickier-disable-next-line sort-objects
  // /* eslint-disable-next-line no-console */
  const disabledNextLine: Map<number, { all: boolean, rules: Set<string> }> = new Map()
  const registerDisable = (targetLine: number, rulesPart: string | undefined) => {
    if (targetLine < 1)
      return
    const entry = { all: false, rules: new Set<string>() }
    const part = (rulesPart || '').trim()
    if (!part) {
      entry.all = true
    }
    else {
      // split by commas or whitespace
      const tokens = part.split(/[\s,]+/).map(s => s.trim()).filter(Boolean)
      for (const t of tokens)
        entry.rules.add(t)
    }
    disabledNextLine.set(targetLine, entry)
  }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    // line comments
    const m1 = line.match(/^\s*\/\/\s*(?:eslint|pickier)-disable-next-line(?:\s+(.+))?\s*$/)
    if (m1)
      registerDisable(i + 2, m1[1])
    // block comments in one line
    const m2 = line.match(/^\s*\/\*\s*(?:eslint|pickier)-disable-next-line(?:\s+(.+?))?\s*\*\/\s*$/)
    if (m2)
      registerDisable(i + 2, m2[1])
  }
  const isSuppressed = (ruleId: string, lineNo: number): boolean => {
    const ent = disabledNextLine.get(lineNo)
    if (!ent)
      return false
    if (ent.all)
      return true
    // match exact, plugin-prefixed, or suffix form
    for (const t of ent.rules) {
      if (t === ruleId)
        return true
      if (t.endsWith(`/${ruleId}`))
        return true
      if (ruleId.endsWith(`/${t}`))
        return true
    }
    return false
  }

  const debuggerStmt = /^\s*debugger\b/ // statement-only, not inside strings

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNo = i + 1

    if (cfg.rules.noDebugger !== 'off' && debuggerStmt.test(line)) {
      const col = line.search(/\S|$/) + 1
      if (!isSuppressed('no-debugger', lineNo)) {
        issues.push({
          filePath,
          line: lineNo,
          column: col,
          ruleId: 'no-debugger',
          message: 'Unexpected debugger statement.',
          severity: cfg.rules.noDebugger === 'error' ? 'error' : 'warning',
        })
      }
    }

    if (cfg.rules.noConsole !== 'off') {
      const conCol = line.indexOf('console.')
      if (conCol !== -1) {
        if (!isSuppressed('no-console', lineNo)) {
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
    }

    // quote preference diagnostics (only for code files)
    if (/\.(?:ts|tsx|js|jsx)$/.test(filePath)) {
      const quoteIdx = detectQuoteIssues(line, cfg.format.quotes)
      for (const idx of quoteIdx) {
        if (!isSuppressed('quotes', lineNo)) {
          issues.push({
            filePath,
            line: lineNo,
            column: idx + 1,
            ruleId: 'quotes',
            message: `Strings must use ${cfg.format.quotes} quotes.`,
            severity: 'warning',
          })
        }
      }

      // indentation diagnostics
      const leadingMatch = line.match(/^[ \t]*/)
      const leading = leadingMatch ? leadingMatch[0] : ''
      if (hasIndentIssue(leading, cfg.format.indent, cfg.format.indentStyle || 'spaces')) {
        const firstNonWs = line.search(/\S|$/)
        if (!isSuppressed('indent', lineNo)) {
          issues.push({
            filePath,
            line: lineNo,
            column: Math.max(1, firstNonWs),
            ruleId: 'indent',
            message: cfg.format.indentStyle === 'tabs'
              ? 'Indentation must use tabs.'
              : `Indentation must be a multiple of ${cfg.format.indent} spaces.`,
            severity: 'warning',
          })
        }
      }
    }
  }

  // RegExp: no-unused-capturing-group (heuristic across entire file)
  if (cfg.rules.noUnusedCapturingGroup && cfg.rules.noUnusedCapturingGroup !== 'off') {
    const addIssue = (line: number, col: number) => {
      if (isSuppressed('regexp/no-unused-capturing-group', line))
        return
      issues.push({
        filePath,
        line,
        column: col,
        ruleId: 'regexp/no-unused-capturing-group',
        message: 'Capturing group number 1 is defined but never used',
        severity: cfg.rules.noUnusedCapturingGroup === 'error' ? 'error' : 'warning',
      })
    }
    const regexLiteral = /\/[^/\\]*(?:\\.[^/\\]*)*\//g
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      regexLiteral.lastIndex = 0
      let m: RegExpExecArray | null
      while ((m = regexLiteral.exec(line))) {
        const pattern = m[0]
        // skip if backreferences present (\\1, \\k<name>)
        if (/\\\d|\\k<[^>]+>/.test(line))
          continue
        const capCount = (pattern.match(/\((?!\?:|\?<)[^)]*\)/g) || []).length
        if (capCount > 0)
          addIssue(i + 1, m.index + 1)
      }
    }
  }

  // no-cond-assign: flag assignments inside if/while/do-while/for conditions
  if (cfg.rules.noCondAssign && cfg.rules.noCondAssign !== 'off') {
    const addIssue = (l: number, c: number) => {
      if (isSuppressed('no-cond-assign', l))
        return
      issues.push({ filePath, line: l, column: c, ruleId: 'no-cond-assign', message: 'Unexpected assignment within a \'while\' statement', severity: cfg.rules.noCondAssign === 'error' ? 'error' : 'warning' })
    }
    const conds = [/^\s*if\s*\((.*)\)/, /^\s*while\s*\((.*)\)/, /^\s*do\s*\{?/, /^\s*for\s*\((.*)\)/]
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      // simple detection for while/if/for on single line
      const checkAssign = (s: string) => /(^|[^=!<>])=(?!=)/.test(s)
      const ifm = line.match(/^\s*if\s*\((.*)\)/)
      if (ifm && checkAssign(ifm[1]))
        addIssue(i + 1, (ifm.index || 0) + 1)
      const whm = line.match(/^\s*while\s*\((.*)\)/)
      if (whm && checkAssign(whm[1]))
        addIssue(i + 1, (whm.index || 0) + 1)
      const form = line.match(/^\s*for\s*\((.*)\)/)
      if (form) {
        const inner = form[1]
        // for(init; condition; update) — flag only in condition segment
        const parts = inner.split(';')
        if (parts.length >= 2 && checkAssign(parts[1]))
          addIssue(i + 1, (form.index || 0) + 1)
      }
    }
  }

  // no-template-curly-in-string: flag template literal syntax in regular strings
  if (cfg.rules.noTemplateCurlyInString && cfg.rules.noTemplateCurlyInString !== 'off') {
    const addIssue = (l: number, c: number) => {
      if (isSuppressed('no-template-curly-in-string', l))
        return
      issues.push({
        filePath,
        line: l,
        column: c,
        ruleId: 'no-template-curly-in-string',
        message: 'Unexpected template string expression.',
        severity: cfg.rules.noTemplateCurlyInString === 'error' ? 'error' : 'warning',
      })
    }

    // Check for ${...} patterns in single and double quoted strings
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineNo = i + 1

      // Match quoted strings and check for template patterns inside them
      const stringPattern = /(['"])((?:\\.|(?!\1)[^\\])*)\1/g
      let stringMatch: RegExpExecArray | null

      while ((stringMatch = stringPattern.exec(line))) {
        const [, , rawStringContent] = stringMatch

        // Process escape sequences to get the actual string content
        const stringContent = rawStringContent.replace(/\\(.)/g, (match, char) => {
          switch (char) {
            case 'n': return '\n'
            case 't': return '\t'
            case 'r': return '\r'
            case '\\': return '\\'
            case '"': return '"'
            case '\'': return '\''
            default: return match // Keep the original escape sequence for unknown escapes
          }
        })

        // Check for ${...} patterns, excluding escaped ones
        const templatePattern = /\$\{[^}]*\}/g
        let templateMatch: RegExpExecArray | null

        while ((templateMatch = templatePattern.exec(stringContent))) {
          const templatePos = templateMatch.index || 0
          // Check if the $ is escaped by looking at the character before it
          if (templatePos > 0 && stringContent[templatePos - 1] === '\\') {
            // Count consecutive backslashes to determine if it's actually escaped
            let backslashCount = 0
            for (let j = templatePos - 1; j >= 0 && stringContent[j] === '\\'; j--) {
              backslashCount++
            }
            // If odd number of backslashes, the $ is escaped
            if (backslashCount % 2 === 1) {
              continue
            }
          }

          // Calculate the position in the original line
          // We need to map from processed string position back to raw string position
          let rawPos = 0
          let processedPos = 0
          while (processedPos < templatePos && rawPos < rawStringContent.length) {
            if (rawStringContent[rawPos] === '\\' && rawPos + 1 < rawStringContent.length) {
              rawPos += 2 // Skip escape sequence
            }
            else {
              rawPos++
            }
            processedPos++
          }

          const startPos = stringMatch.index || 0
          addIssue(lineNo, startPos + rawPos + 1) // +1 to account for quote
        }
      }
    }
  }

  // plugin-based rules
  const pluginIssues = applyPlugins(filePath, content, cfg)
  const filteredPluginIssues = pluginIssues.filter(i => !isSuppressed(i.ruleId, i.line))
  return issues.concat(filteredPluginIssues)
}
