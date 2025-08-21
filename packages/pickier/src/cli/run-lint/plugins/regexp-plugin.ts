import type { PickierPlugin, LintIssue as PluginLintIssue } from '../../../types'

export const regexpPlugin: PickierPlugin = {
  name: 'regexp',
  rules: {
    'no-super-linear-backtracking': {
      meta: { docs: 'Detects potentially super-linear backtracking patterns in regex literals (heuristic)' },
      check: (text, ctx) => {
        const issues: PluginLintIssue[] = []
        const regexLiteral = /\/[^/\\]*(?:\\.[^/\\]*)*\//g
        const mark = (idx: number, len: number, msg: string) => {
          const before = text.slice(0, idx)
          const line = (before.match(/\n/g) || []).length + 1
          const col = idx - before.lastIndexOf('\n')
          issues.push({ filePath: ctx.filePath, line, column: col, ruleId: 'no-super-linear-backtracking', message: msg, severity: 'error' })
        }
        let m: RegExpExecArray | null
        // eslint-disable-next-line no-cond-assign
        while ((m = regexLiteral.exec(text))) {
          const literal = m[0]
          const idx = m.index
          const patt = literal.slice(1, literal.lastIndexOf('/'))
          const flat = patt.replace(/\[.*?\]/g, '') // strip char classes heuristically
          // Heuristics:
          // 1) Overlapping adjacent unlimited quantifiers that can exchange characters (e.g., .+?\s*, \s*.+?, .*\s*, \s*.*)
          const exch = flat.includes('.+?\\s*') || flat.includes('\\s*.+?') || flat.includes('.*\\s*') || flat.includes('\\s*.*')
          if (exch) {
            mark(idx, literal.length, 'The combination of \' .*\' or \' .+?\' with \'\\s*\' can cause super-linear backtracking due to exchangeable characters')
            continue
          }
          // 2) Repeated wildcards next to each other: ".*.*" or variations
          const collapsed = flat.replace(/\s+/g, '')
          if (/(?:\.\*\??){2,}/.test(collapsed) || /(?:\.\+\??){2,}/.test(collapsed) || /\.\*\??\.\+\??|\.\+\??\.\*\??/.test(collapsed)) {
            mark(idx, literal.length, 'Multiple adjacent unlimited wildcard quantifiers can cause super-linear backtracking')
            continue
          }
          // 3) Nested unlimited quantifiers like (.+)+, (.*)+, (?:...+)+
          // eslint-disable-next-line regexp/no-super-linear-backtracking
          if (/\((?:\?:)?[^)]*?[+*][^)]*\)\s*[+*]/.test(flat)) {
            mark(idx, literal.length, 'Nested unlimited quantifiers detected (e.g., (.+)+) which can cause catastrophic backtracking')
            continue
          }
        }
        return issues
      },
    },
  },
}
