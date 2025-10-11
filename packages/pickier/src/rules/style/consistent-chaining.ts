import type { RuleModule } from '../../types'

// Heuristic port of src-2 `consistent-chaining`
// Goal: within a member-access/call chain, avoid mixing inline and newline styles.
// Supported patterns:
//   - single-line chains: obj.foo().bar().baz
//   - multi-line chains with leading dot style:
//       obj
//         .foo()
//         .bar()
//         .baz
// We flag when a chain spans multiple lines but some dots are inline and others are newline.

function findChains(text: string): Array<{ start: number, end: number }> {
  const chains: Array<{ start: number, end: number }> = []
  const lines = text.split(/\r?\n/)
  let offset = 0
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    // Detect a possible chain start:
    // 1) current line contains identifier followed by '.' (inline chaining), OR
    // 2) next line starts with '.' (leading dot style)
    const inlineStart = /\b[\w$)\]]+\s*\./.test(line)
    const nextStartsWithDot = i + 1 < lines.length && /^\s*\./.test(lines[i + 1])
    if (inlineStart || nextStartsWithDot) {
      // Expand forward while subsequent lines start with optional whitespace then '.'
      let j = i
      let last = i
      while (j + 1 < lines.length && /^\s*\./.test(lines[j + 1])) {
        j++
        last = j
      }
      if (last > i) {
        const start = offset // from start of the start line
        const end = offset + lines[i].length + 1 + lines.slice(i + 1, last + 1).join('\n').length
        chains.push({ start, end })
        i = last
      }
    }
    offset += line.length + 1
  }
  return chains
}

export const consistentChainingRule: RuleModule = {
  meta: { docs: 'Enforce consistent line breaks in member-access/call chains' },
  check: (text, ctx) => {
    const issues: ReturnType<RuleModule['check']> = []
    const _lines = text.split(/\r?\n/)

    // Inspect each chain and ensure consistency between adjacent dots
    const chains = findChains(text)
    for (const { start, end } of chains) {
      const segment = text.slice(start, end)
      const segLines = segment.split(/\r?\n/)
      // Determine the mode of the first separator between properties
      // Find occurrences of '.' tokens and see whether they are at line starts
      const dotInfo: Array<'inline' | 'newline'> = []
      for (let i = 0; i < segLines.length; i++) {
        const ln = segLines[i]
        // collect all dots on this line
        const indices = [...ln.matchAll(/\./g)].map(m => m.index || 0)
        for (const idx of indices) {
          // Skip dots that belong to the optional chaining operator '?.'
          if (idx > 0 && ln[idx - 1] === '?')
            continue
          // If the dot is the first non-space on the line, treat as newline style
          if (/^\s*\./.test(ln) && (idx === ln.indexOf('.')) && ln.slice(0, idx).trim() === '')
            dotInfo.push('newline')
          else
            dotInfo.push('inline')
        }
      }
      if (dotInfo.length <= 1)
        continue
      const expected = dotInfo[0]
      // Skip if all same
      if (dotInfo.every(d => d === expected))
        continue
      // Report at the first mismatch
      const mismatchIdx = dotInfo.findIndex(d => d !== expected)
      // Compute line/column for reporting
      // const line = 1;
      // const col = 1;
      let seenDots = 0
      for (let i = 0; i < segLines.length; i++) {
        const ln = segLines[i]
        const indices = [...ln.matchAll(/\./g)].map(m => m.index || 0)
        for (const idx of indices) {
          if (idx > 0 && ln[idx - 1] === '?')
            continue
          if (seenDots === mismatchIdx) {
            // Map to file position
            const pre = text.slice(0, start)
            const preLines = pre.split(/\r?\n/)
            const baseLine = preLines.length
            const baseCol = (preLines[preLines.length - 1] || '').length
            issues.push({
              filePath: ctx.filePath,
              line: baseLine + i,
              column: (i === 0 ? baseCol : 0) + idx + 1,
              ruleId: 'style/consistent-chaining',
              message: `Inconsistent chaining style: mix of ${expected} and ${expected === 'inline' ? 'newline' : 'inline'}.`,
              severity: 'warning',
            })
            i = segLines.length
            break
          }
          seenDots++
        }
      }
    }

    return issues
  },
}
