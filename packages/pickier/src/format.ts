import type { PickierConfig } from './types'

const CODE_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx'])

function getFileExt(filePath: string): string {
  const idx = filePath.lastIndexOf('.')
  return idx >= 0 ? filePath.slice(idx) : ''
}

function isCodeFileExt(filePath: string): boolean {
  return CODE_EXTS.has(getFileExt(filePath))
}

function toSpaces(count: number): string {
  return ' '.repeat(Math.max(0, count))
}

function convertDoubleToSingle(str: string): string {
  // strip surrounding quotes
  const inner = str.slice(1, -1)
  // unescape escaped double quotes, keep other escapes intact
  const unescaped = inner.replace(/\\\"/g, '"')
  // escape single quotes
  const escapedSingles = unescaped.replace(/'/g, "\\'")
  return `'${escapedSingles}'`
}

function convertSingleToDouble(str: string): string {
  const inner = str.slice(1, -1)
  const unescaped = inner.replace(/\\'/g, "'")
  const escapedDoubles = unescaped.replace(/"/g, '\\"')
  return `"${escapedDoubles}"`
}

function fixQuotes(content: string, preferred: 'single' | 'double', filePath: string): string {
  if (!isCodeFileExt(filePath))
    return content

  // do not touch template literals or backticks
  if (preferred === 'single') {
    return content.replace(/"([^"\\]|\\.)*"/g, (m) => convertDoubleToSingle(m))
  }
  else {
    return content.replace(/'([^'\\]|\\.)*'/g, (m) => convertSingleToDouble(m))
  }
}

function fixIndentation(content: string, indentSize: number): string {
  const lines = content.split('\n')
  const out: string[] = []
  let indentLevel = 0 // in spaces
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.length === 0) {
      out.push('')
      continue
    }
    const match = line.match(/^[ \t]*/)
    const leading = match ? match[0] : ''
    const rest = line.slice(leading.length)
    const trimmed = rest.trimEnd()

    // If line starts with a closing brace, decrease indent before applying
    if (/^\}/.test(trimmed))
      indentLevel = Math.max(0, indentLevel - indentSize)

    const targetSpaces = Math.max(0, indentLevel)
    const fixed = `${toSpaces(targetSpaces)}${trimmed}`
    out.push(fixed)

    // Do not increase indentation after opening braces; maintain flat style inside blocks
  }
  return out.join('\n')
}

function collapseBlankLines(lines: string[], maxConsecutive: number): string[] {
  const out: string[] = []
  let blank = 0
  for (const l of lines) {
    if (l === '') {
      blank++
      if (blank <= maxConsecutive)
        out.push('')
    }
    else {
      blank = 0
      out.push(l)
    }
  }
  return out
}

export function formatCode(src: string, cfg: PickierConfig, filePath: string): string {
  if (src.length === 0)
    return ''

  // normalize newlines and trim trailing whitespace per line if enabled
  const rawLines = src.replace(/\r\n/g, '\n').split('\n')
  const trimmed = cfg.format.trimTrailingWhitespace
    ? rawLines.map(l => l.replace(/[ \t]+$/g, ''))
    : rawLines.slice()

  // collapse blank lines
  const collapsed = collapseBlankLines(trimmed, Math.max(0, cfg.format.maxConsecutiveBlankLines))
  let joined = collapsed.join('\n')

  // quotes first (independent of indentation)
  joined = fixQuotes(joined, cfg.format.quotes, filePath)
  // indentation
  joined = fixIndentation(joined, cfg.format.indent)

  // ensure final newline policy
  if (cfg.format.finalNewline === 'none') {
    return joined.replace(/\n+$/g, '')
  }

  const endsWithNewline = /\n$/.test(joined)
  if (cfg.format.finalNewline === 'one') {
    return endsWithNewline ? joined : `${joined}\n`
  }
  // 'two' => blank line + newline at end
  if (/\n\n$/.test(joined))
    return joined
  if (endsWithNewline)
    return `${joined}\n`
  return `${joined}\n\n`
}

export function detectQuoteIssues(line: string, preferred: 'single' | 'double'): number[] {
  // return character indices (0-based) where offending quote starts
  const indices: number[] = []
  if (preferred === 'single') {
    const re = /"([^"\\]|\\.)*"/g
    let m: RegExpExecArray | null
    while ((m = re.exec(line))) {
      indices.push(m.index)
    }
  }
  else {
    const re = /'([^'\\]|\\.)*'/g
    let m: RegExpExecArray | null
    while ((m = re.exec(line))) {
      indices.push(m.index)
    }
  }
  return indices
}

export function hasIndentIssue(leading: string, indentSize: number): boolean {
  if (/\t/.test(leading))
    return true
  const spaces = leading.length
  return spaces % indentSize !== 0
}


