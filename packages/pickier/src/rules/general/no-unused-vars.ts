/* eslint-disable regexp/no-super-linear-backtracking */
import type { RuleModule } from '../../types'

export const noUnusedVarsRule: RuleModule = {
  meta: { docs: 'Report variables and parameters that are declared/assigned but never used' },
  check: (text, ctx) => {
    const issues: ReturnType<RuleModule['check']> = []
    const opts: any = ctx.options || {}
    const varsIgnorePattern = typeof opts.varsIgnorePattern === 'string' ? opts.varsIgnorePattern : '^_'
    const argsIgnorePattern = typeof opts.argsIgnorePattern === 'string' ? opts.argsIgnorePattern : '^_'
    const varIgnoreRe = new RegExp(varsIgnorePattern, 'u')
    const argIgnoreRe = new RegExp(argsIgnorePattern, 'u')

    const lines = text.split(/\r?\n/)
    const full = text

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const decl = line.match(/^\s*(?:const|let|var)\s+(.+?);?\s*$/)
      if (!decl)
        continue
      const after = decl[1]

      // Smart comma split: ignore commas inside < >, [ ], { }, ( ), and strings
      const parts: string[] = []
      let current = ''
      let depth = 0
      let angleDepth = 0
      let inString: 'single' | 'double' | 'template' | null = null
      let escaped = false
      for (let k = 0; k < after.length; k++) {
        const ch = after[k]

        // Handle escape sequences in strings
        if (escaped) {
          escaped = false
          current += ch
          continue
        }

        if (ch === '\\' && inString) {
          escaped = true
          current += ch
          continue
        }

        // Track string boundaries
        if (!inString) {
          if (ch === '\'') inString = 'single'
          else if (ch === '"') inString = 'double'
          else if (ch === '`') inString = 'template'
          else if (ch === '<') angleDepth++
          else if (ch === '>') angleDepth--
          else if (ch === '(' || ch === '[' || ch === '{') depth++
          else if (ch === ')' || ch === ']' || ch === '}') depth--
          else if (ch === ',' && depth === 0 && angleDepth === 0) {
            parts.push(current)
            current = ''
            continue
          }
        }
        else {
          // Inside string - check for end
          if ((inString === 'single' && ch === '\'') ||
              (inString === 'double' && ch === '"') ||
              (inString === 'template' && ch === '`')) {
            inString = null
          }
        }
        current += ch
      }
      if (current) parts.push(current)

      for (const partRaw of parts) {
        const part = partRaw.trim()
        if (!part)
          continue
        const simple = part.match(/^([$A-Z_][\w$]*)/i)
        const destruct = part.match(/^[{[](.+)[}\]]/)
        const names: string[] = []
        if (simple) {
          names.push(simple[1])
        }
        else if (destruct) {
          const inner = destruct[1]
          const tokens = inner.split(/[^$\w]+/).filter(Boolean)
          for (const t of tokens) names.push(t)
        }
        for (const name of names) {
          if (varIgnoreRe.test(name))
            continue
          const restStartIdx = full.indexOf(line)
          const rest = full.slice(restStartIdx + line.length)
          const refRe = new RegExp(`\\b${name}\\b`, 'g')
          if (!refRe.test(rest)) {
            issues.push({ filePath: ctx.filePath, line: i + 1, column: Math.max(1, line.indexOf(name) + 1), ruleId: 'pickier/no-unused-vars', message: `'${name}' is assigned a value but never used. Allowed unused vars must match pattern: ${varsIgnorePattern}`, severity: 'error' })
          }
        }
      }
    }

    // Function parameters: function foo(a,b) { ... } | const f = (a,b)=>{...} | const f=(x)=>x
    const getParamNames = (raw: string): string[] => {
      // Strip TypeScript type annotations (everything after : including brackets)
      // Example: 'args: any[]' -> 'args', 'x: number' -> 'x'
      const cleaned = raw.replace(/:\s*[^,)]+/g, '')
      return cleaned.split(/[^$\w]+/).filter(Boolean)
    }
    const findBodyRange = (startLine: number, startColFrom?: number): { from: number, to: number } | null => {
      let openFound = false
      let depth = 0
      for (let ln = startLine; ln < lines.length; ln++) {
        const s = lines[ln]
        let startIdx = 0
        if (!openFound) {
          const idx = s.indexOf('{', typeof startColFrom === 'number' ? startColFrom : 0)
          if (idx === -1)
            continue
          openFound = true
          depth = 1
          startIdx = idx + 1
        }
        for (let k = startIdx; k < s.length; k++) {
          const ch = s[k]
          if (ch === '{') {
            depth++
          }
          else if (ch === '}') {
            depth--
            if (depth === 0)
              return { from: startLine, to: ln }
          }
        }
      }
      return null
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      // function declarations or expressions
      let m = line.match(/\bfunction\b/)
      if (m) {
        // Find the opening ( for parameters
        const funcIdx = m.index!
        const openParenIdx = line.indexOf('(', funcIdx)
        if (openParenIdx === -1)
          continue

        // Find matching closing ) by counting parentheses
        let depth = 0
        let closeParenIdx = -1
        for (let k = openParenIdx; k < line.length; k++) {
          if (line[k] === '(') depth++
          else if (line[k] === ')') {
            depth--
            if (depth === 0) {
              closeParenIdx = k
              break
            }
          }
        }
        if (closeParenIdx === -1)
          continue

        // Extract parameters between the parentheses
        const paramStr = line.slice(openParenIdx + 1, closeParenIdx)
        const params = getParamNames(paramStr)
        const bodyRange = findBodyRange(i)
        const bodyText = bodyRange ? lines.slice(bodyRange.from, bodyRange.to + 1).join('\n') : ''
        for (const name of params) {
          if (!name || argIgnoreRe.test(name))
            continue
          const re = new RegExp(`\\b${name}\\b`, 'g')
          const afterParamsIdx = closeParenIdx + 1
          const localSlice = (`${line.slice(afterParamsIdx)}\n${bodyText}`)
          if (!re.test(localSlice)) {
            issues.push({ filePath: ctx.filePath, line: i + 1, column: Math.max(1, line.indexOf(name) + 1), ruleId: 'pickier/no-unused-vars', message: `'${name}' is defined but never used (function parameter). Allowed unused args must match pattern: ${argsIgnorePattern}`, severity: 'error' })
          }
        }
        continue
      }

      // arrow functions (parenthesized params) - match patterns like: const f = (a,b) => ..., or standalone (a,b) => ...
      // Use word boundary or assignment context to avoid matching function calls like registerCommand('...', () => ...)
      // Also skip 'async' keyword: (async () => ...)
      m = line.match(/(?:^|[=,;{([]\s*)(?:const|let|var)?\s*(\w*)\s*=?\s*(?!async\s)\(([^)]*)\)\s*=>/)
      if (m) {
        const params = getParamNames(m[m.length - 1]) // last capture group is the params
        const arrowIdx = line.indexOf('=>')
        let bodyText = ''
        if (line.includes('{', arrowIdx)) {
          const bodyRange = findBodyRange(i, arrowIdx)
          bodyText = bodyRange ? lines.slice(bodyRange.from, bodyRange.to + 1).join('\n') : ''
        }
        else {
          bodyText = line.slice(arrowIdx + 2)
        }
        for (const name of params) {
          if (!name || argIgnoreRe.test(name))
            continue
          const re = new RegExp(`\\b${name}\\b`, 'g')
          if (!re.test(bodyText)) {
            issues.push({ filePath: ctx.filePath, line: i + 1, column: Math.max(1, line.indexOf(name) + 1), ruleId: 'pickier/no-unused-vars', message: `'${name}' is defined but never used (function parameter). Allowed unused args must match pattern: ${argsIgnorePattern}`, severity: 'error' })
          }
        }
        continue
      }

      // arrow functions (single identifier param without parentheses): x => ... possibly embedded, e.g., arr.map(x=>x)
      {
        const reSingleArrow = /(?:^|[=,:({\s])\s*([$A-Z_][\w$]*)\s*=>/gi
        let match: RegExpExecArray | null
        // eslint-disable-next-line no-cond-assign
        while ((match = reSingleArrow.exec(line)) !== null) {
          const name = match[1]
          if (!name || argIgnoreRe.test(name))
            continue
          const arrowIdx = match.index + match[0].lastIndexOf('=>')
          let bodyText = ''
          if (line.includes('{', arrowIdx)) {
            const bodyRange = findBodyRange(i, arrowIdx)
            bodyText = bodyRange ? lines.slice(bodyRange.from, bodyRange.to + 1).join('\n') : ''
          }
          else {
            bodyText = line.slice(arrowIdx + 2)
          }
          const useRe = new RegExp(`\\b${name}\\b`, 'g')
          if (!useRe.test(bodyText)) {
            issues.push({ filePath: ctx.filePath, line: i + 1, column: Math.max(1, line.indexOf(name) + 1), ruleId: 'pickier/no-unused-vars', message: `'${name}' is defined but never used (function parameter). Allowed unused args must match pattern: ${argsIgnorePattern}`, severity: 'error' })
          }
        }
      }
    }

    return issues
  },
}
