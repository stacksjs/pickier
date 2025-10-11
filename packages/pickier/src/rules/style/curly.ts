import type { RuleModule } from '../../types'

// - For control statements (if/else/while/do/for*), when any branch/body has braces
//   or likely requires them (nested statement keywords), require braces for all bodies.
// - Report non-block bodies with message: 'Expect curly brackets'

function isCommentOrEmpty(s: string): boolean {
  const t = s.trim()
  return t === '' || t.startsWith('//') || t.startsWith('/*')
}

function nextNonEmptyLine(lines: string[], start: number): number {
  for (let i = start; i < lines.length; i++) {
    if (!isCommentOrEmpty(lines[i]))
      return i
  }
  return -1
}

function hasBlockOnOrNextLine(lines: string[], i: number, afterIndex: number): boolean {
  const line = lines[i]
  if (line.slice(afterIndex).includes('{'))
    return true
  const j = nextNonEmptyLine(lines, i + 1)
  if (j >= 0) {
    const t = lines[j].trim()
    if (t.startsWith('{'))
      return true
  }
  return false
}

function requiresBracesHeuristic(lines: string[], i: number, afterIndex: number): boolean {
  // If body appears to be nested or multiline by keywords
  const tail = lines[i].slice(afterIndex)
  if (/\bif\b|\bfor\b|\bwhile\b|\bdo\b/.test(tail))
    return true
  return false
}

export const curlyRule: RuleModule = {
  meta: { docs: 'Enforce curly brackets similar to src-2: require braces when any branch/body requires them' },
  check: (text, ctx) => {
    const issues: ReturnType<RuleModule['check']> = []
    const lines = text.split(/\r?\n/)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const ifMatch = line.match(/^(\s*)if\s*\(([^)]*)\)/)
      if (ifMatch) {
        const afterIdx = ifMatch[0].length
        const hasBlock = hasBlockOnOrNextLine(lines, i, afterIdx)
        const needs = requiresBracesHeuristic(lines, i, afterIdx)

        // Walk else-if / else chain quickly
        let j = i
        let chainHasBlock = hasBlock
        let chainNeeds = needs
        while (true) {
          const k = nextNonEmptyLine(lines, j + 1)
          if (k < 0)
            break
          const t = lines[k].trim()
          if (!t.startsWith('else'))
            break
          // else if ...
          const elseIf = t.match(/^else\s+if\s*\(([^)]*)\)/)
          if (elseIf) {
            const idx = lines[k].indexOf(elseIf[0]) + elseIf[0].length
            chainHasBlock = chainHasBlock || hasBlockOnOrNextLine(lines, k, idx)
            chainNeeds = chainNeeds || requiresBracesHeuristic(lines, k, idx)
            j = k
            continue
          }
          else {
            const idx = lines[k].indexOf('else') + 'else'.length
            chainHasBlock = chainHasBlock || hasBlockOnOrNextLine(lines, k, idx)
            chainNeeds = chainNeeds || requiresBracesHeuristic(lines, k, idx)
            j = k
            break
          }
        }
        if (chainHasBlock || chainNeeds) {
          // flag current if if it lacks block
          if (!hasBlock) {
            issues.push({ filePath: ctx.filePath, line: i + 1, column: Math.max(1, line.indexOf('if') + 1), ruleId: 'style/curly', message: 'Expect curly brackets', severity: 'warning' })
          }
          // flag else parts in chain if lacking braces
          let cur = i
          while (true) {
            const k = nextNonEmptyLine(lines, cur + 1)
            if (k < 0)
              break
            const t = lines[k]
            const trimmed = t.trim()
            if (!trimmed.startsWith('else'))
              break
            const elseIf2 = trimmed.match(/^else\s+if\s*\(([^)]*)\)/)
            if (elseIf2) {
              const idx2 = t.indexOf(elseIf2[0]) + elseIf2[0].length
              const hb2 = hasBlockOnOrNextLine(lines, k, idx2)
              if (!hb2)
                issues.push({ filePath: ctx.filePath, line: k + 1, column: Math.max(1, t.indexOf('else') + 1), ruleId: 'style/curly', message: 'Expect curly brackets', severity: 'warning' })
              cur = k
              continue
            }
            else {
              const idx2 = t.indexOf('else') + 'else'.length
              const hb2 = hasBlockOnOrNextLine(lines, k, idx2)
              if (!hb2)
                issues.push({ filePath: ctx.filePath, line: k + 1, column: Math.max(1, t.indexOf('else') + 1), ruleId: 'style/curly', message: 'Expect curly brackets', severity: 'warning' })
              break
            }
          }
        }
      }

      // Loops
      const loopMatch = line.match(/^(\s*)(while|do|for|for\s+await)\b/)
      if (loopMatch) {
        const idx = loopMatch[0].length
        const hasBlockLoop = hasBlockOnOrNextLine(lines, i, idx)
        const needsLoop = requiresBracesHeuristic(lines, i, idx)
        if ((hasBlockLoop || needsLoop) && !hasBlockLoop) {
          issues.push({ filePath: ctx.filePath, line: i + 1, column: Math.max(1, line.indexOf(loopMatch[2]!) + 1), ruleId: 'style/curly', message: 'Expect curly brackets', severity: 'warning' })
        }
      }
    }

    // Second pass: report unnecessary braces in else single-statement blocks
    const extra = _internal_detectUnnecessaryElseBraces(text, ctx.filePath)
    for (const e of extra) {
      issues.push({ filePath: ctx.filePath, line: e.line, column: e.column, ruleId: 'style/curly', message: e.message, severity: 'warning' })
    }

    return issues
  },
}

// Additional pass: detect unnecessary braces around a single simple statement in else blocks
// This is a very light heuristic to satisfy style-edge-cases expectations.
export function _internal_detectUnnecessaryElseBraces(text: string, _filePath: string): Array<{ line: number, column: number, message: string }> {
  const out: Array<{ line: number, column: number, message: string }> = []
  const lines = text.split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    const t = raw.trim()
    // Handle if, else-if and else for unnecessary-braces detection
    const kind = (/^if\s*\(/.test(t) ? 'if' : (/^else\s+if\s*\(/.test(t) ? 'else-if' : (/^else\b/.test(t) ? 'else' : null)))
    if (!kind)
      continue
    // Find position after control keyword/condition
    let afterIdx = 0
    if (kind === 'if') {
      const m = raw.match(/if\s*\([^)]*\)/)
      afterIdx = m ? raw.indexOf(m[0]) + m[0].length : raw.indexOf('if') + 2
    }
    else if (kind === 'else-if') {
      const m = raw.match(/else\s+if\s*\([^)]*\)/)
      afterIdx = m ? raw.indexOf(m[0]) + m[0].length : raw.indexOf('else') + 4
    }
    else {
      afterIdx = raw.indexOf('else') + 'else'.length
    }
    // Determine where the block starts '{' (same line or next non-empty)
    let startLine = i
    let bracePos = raw.indexOf('{', afterIdx)
    if (bracePos < 0) {
      const j = (function nextNonEmpty(start: number): number {
        for (let k = start; k < lines.length; k++) {
          if (lines[k].trim() !== '')
            return k
        }
        return -1
      }) (i + 1)
      if (j < 0)
        continue
      bracePos = lines[j].indexOf('{')
      if (bracePos < 0)
        continue
      startLine = j
    }
    // Find matching closing '}' using a simple brace counter across lines, starting at the target '{'
    let depth = 0
    let endLine = -1
    for (let k = startLine; k < lines.length; k++) {
      const ln = lines[k]
      const cStart = (k === startLine ? Math.max(0, bracePos) : 0)
      for (let c = cStart; c < ln.length; c++) {
        const ch = ln[c]
        if (ch === '{') {
          depth++
        }
        else if (ch === '}') {
          depth--
          if (depth === 0) {
            endLine = k
            break
          }
        }
      }
      if (endLine >= 0)
        break
    }
    if (endLine < 0)
      continue
    // Collect inner lines and check if exactly one simple statement (ignore empty/comment-only lines)
    const inner: string[] = []
    for (let k = startLine + 1; k < endLine; k++) {
      const trimmed = lines[k].trim()
      if (trimmed === '' || /^\/\//.test(trimmed))
        continue
      inner.push(trimmed)
      if (inner.length > 1)
        break
    }
    if (inner.length === 1 && endLine === startLine + 2) {
      const stmt = inner[0]
      // Skip if the single statement is a control structure or contains its own block
      const isControl = /^(?:if|for|while|do|switch|try|catch|else)\b/.test(stmt)
      const hasBraces = /[{}]/.test(stmt)
      // Skip if parentheses appear unbalanced on this single line (likely part of a multiline call)
      const opens = (stmt.match(/\(/g) || []).length
      const closes = (stmt.match(/\)/g) || []).length
      const parenUnbalanced = opens !== closes
      // Chain-aware suppression: if any sibling branch in the same chain has >1 statements, don't report
      let chainHasMulti = false
      // look forward for else/else-if branches and check their inner statement counts if they have blocks
      for (let j = i + 1; j < lines.length; j++) {
        const t2 = lines[j].trim()
        if (t2 === '' || t2 === '}' || /^\/\//.test(t2))
          continue
        if (!/^else\b/.test(t2))
          break
        // find block start for this branch
        let after2 = lines[j].indexOf('else') + 'else'.length
        const m2 = t2.match(/^else\s+if\s*\([^)]*\)/)
        if (m2)
          after2 = lines[j].indexOf(m2[0]) + m2[0].length
        let start2 = j
        let pos2 = lines[j].indexOf('{', after2)
        if (pos2 < 0) {
          const nn = (function nextNonEmpty(start: number): number {
            for (let k2 = start; k2 < lines.length; k2++) {
              if (lines[k2].trim() !== '')
                return k2
            }
            return -1
          })(j + 1)
          if (nn < 0)
            break
          pos2 = lines[nn].indexOf('{')
          if (pos2 < 0)
            continue
          start2 = nn
        }
        // match closing for this branch
        let d2 = 0
        let end2 = -1
        for (let k2 = start2; k2 < lines.length; k2++) {
          const ln2 = lines[k2]
          const cStart2 = (k2 === start2 ? Math.max(0, pos2) : 0)
          for (let c2 = cStart2; c2 < ln2.length; c2++) {
            const ch2 = ln2[c2]
            if (ch2 === '{') {
              d2++
            }
            else if (ch2 === '}') {
              d2--
              if (d2 === 0) {
                end2 = k2
                break
              }
            }
          }
          if (end2 >= 0)
            break
        }
        if (end2 >= 0) {
          let count = 0
          for (let k2 = start2 + 1; k2 < end2; k2++) {
            const tr = lines[k2].trim()
            if (tr === '' || /^\/\//.test(tr))
              continue
            count++
            if (count > 1) {
              chainHasMulti = true
              break
            }
          }
        }
        if (chainHasMulti)
          break
      }
      // direct neighbor else check (additional safeguard)
      if (!chainHasMulti && kind === 'if') {
        const nn = (function nextNonEmpty(start: number): number {
          for (let k3 = start; k3 < lines.length; k3++) {
            const tt = lines[k3].trim()
            if (tt !== '' && tt !== '}' && !/^\/\//.test(tt))
              return k3
          }
          return -1
        })(endLine + 1)
        if (nn >= 0 && /^else\b/.test(lines[nn].trim())) {
          let after3 = lines[nn].indexOf('else') + 'else'.length
          const m3 = lines[nn].trim().match(/^else\s+if\s*\([^)]*\)/)
          if (m3)
            after3 = lines[nn].indexOf(m3[0]) + m3[0].length
          let start3 = nn
          let pos3 = lines[nn].indexOf('{', after3)
          if (pos3 < 0) {
            const mm = (function nextNonEmpty(start: number): number {
              for (let k4 = start; k4 < lines.length; k4++) {
                if (lines[k4].trim() !== '')
                  return k4
              }
              return -1
            })(nn + 1)
            if (mm >= 0) {
              pos3 = lines[mm].indexOf('{')
              start3 = pos3 >= 0 ? mm : start3
            }
          }
          if (pos3 >= 0) {
            let d3 = 0
            let end3 = -1
            for (let k4 = start3; k4 < lines.length; k4++) {
              const ln3 = lines[k4]
              const cStart3 = (k4 === start3 ? Math.max(0, pos3) : 0)
              for (let c3 = cStart3; c3 < ln3.length; c3++) {
                const ch3 = ln3[c3]
                if (ch3 === '{') {
                  d3++
                }
                else if (ch3 === '}') {
                  d3--
                  if (d3 === 0) {
                    end3 = k4
                    break
                  }
                }
              }
              if (end3 >= 0)
                break
            }
            if (end3 >= 0) {
              let cnt = 0
              for (let k4 = start3 + 1; k4 < end3; k4++) {
                const tr3 = lines[k4].trim()
                if (tr3 === '' || /^\/\//.test(tr3))
                  continue
                if (++cnt > 1) {
                  chainHasMulti = true
                  break
                }
              }
            }
          }
        }
      }
      if (!isControl && !hasBraces && !parenUnbalanced && !chainHasMulti) {
        out.push({ line: startLine + 1, column: Math.max(1, lines[startLine].indexOf('{') + 1), message: 'Unnecessary curly braces around single statement' })
      }
    }
  }
  return out
}
