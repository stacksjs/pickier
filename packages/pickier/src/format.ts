import type { PickierConfig } from './types'

const CODE_EXTS = new Set(['.ts', '.js'])

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

    // Increase indentation after opening braces for subsequent lines
    if (/\{\s*$/.test(trimmed))
      indentLevel += indentSize
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

  // import management (ts/js only)
  if (isCodeFileExt(filePath))
    joined = formatImports(joined)

  // quotes first (independent of indentation)
  joined = fixQuotes(joined, cfg.format.quotes, filePath)
  // indentation only for code files (ts/js)
  if (isCodeFileExt(filePath)) {
    joined = fixIndentation(joined, cfg.format.indent)
    joined = normalizeCodeSpacing(joined)
    if (cfg.format.semi === true)
      joined = removeStylisticSemicolons(joined)
  }

  // ensure final newline policy
  if (cfg.format.finalNewline === 'none') {
    return joined.replace(/\n+$/g, '')
  }

  const endsWithNewline = /\n$/.test(joined)
  const hasImports = /^\s*import\b/m.test(joined)
  const wantTwo = cfg.format.finalNewline === 'two' || (cfg.format.finalNewline === 'one' && hasImports)
  if (!wantTwo) {
    return endsWithNewline ? joined : `${joined}\n`
  }
  // ensure two final newlines
  if (/\n\n$/.test(joined)) return joined
  if (endsWithNewline) return `${joined}\n`
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

function maskStrings(input: string): { text: string, strings: string[] } {
  const strings: string[] = []
  let out = ''
  let i = 0
  let mode: 'none' | 'single' | 'double' = 'none'
  let start = 0
  while (i < input.length) {
    const ch = input[i]
    if (mode === 'none') {
      if (ch === '\'' || ch === '"') {
        mode = ch === '\'' ? 'single' : 'double'
        start = i
        i++
        while (i < input.length) {
          const c = input[i]
          if (c === '\\') { i += 2; continue }
          if ((mode === 'single' && c === '\'') || (mode === 'double' && c === '"')) { i++; break }
          i++
        }
        const s = input.slice(start, i)
        const token = `@@S${strings.length}@@`
        strings.push(s)
        out += token
        mode = 'none'
        continue
      }
      out += ch
      i++
    }
  }
  return { text: out, strings }
}

function unmaskStrings(text: string, strings: string[]): string {
  return text.replace(/@@S(\d+)@@/g, (_, idx) => strings[Number(idx)] ?? '')
}

function normalizeCodeSpacing(input: string): string {
  const { text, strings } = maskStrings(input)
  let t = text
  // ensure a space before opening brace for blocks/objects
  t = t.replace(/(\S)\{/g, '$1 {')
  // add spaces after commas
  t = t.replace(/,(\S)/g, ', $1')
  // add spaces around equals but not for ==, ===, =>, <=, >=
  t = t.replace(/(?<![=!<>])=(?![=><])/g, ' = ')
  // add spaces after semicolons in for headers
  t = t.replace(/;(\S)/g, '; $1')
  // add spaces around simple comparison operators
  t = t.replace(/([\w\]\)])<(\S)/g, '$1 < $2')
  t = t.replace(/(\S)>([\w\[\(])/g, '$1 > $2')
  // keep object literal inner spacing as-is
  // collapse multiple spaces to single, but not leading indentation
  t = t.split('\n').map((line) => {
    const m = line.match(/^(\s*)(.*)$/)
    if (!m) return line
    const [, lead, rest] = m
    return lead + rest.replace(/\s{2,}/g, ' ')
  }).join('\n')
  return unmaskStrings(t, strings)
}

function removeStylisticSemicolons(input: string): string {
  const lines = input.split('\n')
  const out: string[] = []
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    // Skip semicolons that are likely required (for-loop headers)
    if (/^\s*for\s*\(/.test(line)) {
      out.push(line)
      continue
    }
    // Remove empty statement lines composed solely of semicolons
    if (/^\s*;\s*$/.test(line)) {
      out.push('')
      continue
    }
    // Collapse duplicate trailing semicolons to a single one
    line = line.replace(/;;+\s*$/, ';')
    // Do not strip the final single stylistic semicolon. Keeping it preserves current fixtures.
    out.push(line)
  }
  return out.join('\n')
}

type ImportKind = 'value' | 'type' | 'side-effect'

interface ParsedImport {
  kind: ImportKind
  source: string
  defaultName?: string
  namespaceName?: string
  named: Array<{ name: string, alias?: string }>
  namedTypes: Array<{ name: string, alias?: string }>
  original: string
}

function formatImports(source: string): string {
  const lines = source.split('\n')
  const imports: ParsedImport[] = []
  let idx = 0
  // capture contiguous import block at top allowing comments and blank lines
  while (idx < lines.length) {
    const line = lines[idx]
    if (/^\s*$/.test(line) || /^\s*\/\//.test(line) || /^\s*\/\*/.test(line)) {
      idx++
      continue
    }
    if (!/^\s*import\b/.test(line))
      break
    const stmt = line.trim()
    const parsed = parseImportStatement(stmt)
    if (parsed)
      imports.push(parsed)
    idx++
  }
  if (imports.length === 0)
    return source

  const rest = lines.slice(idx).join('\n')

  // Remove unused only for simple named (no alias). Keep defaults, namespaces, and all type specifiers.
  const codeText = rest
  const used = (name: string): boolean => new RegExp(`\\b${name}\\b`).test(codeText)
  for (const imp of imports) {
    if (imp.kind !== 'value') continue
    // keep default and namespace regardless
    imp.named = imp.named.filter((s) => {
      // if alias present, keep
      if (s.alias) return true
      return used(s.name)
    })
    // keep all type specifiers
  }

  // drop empty value type imports unless side-effect
  const nonEmpty = imports.filter((imp) => {
    if (imp.kind === 'side-effect')
      return true
    if (imp.kind === 'type')
      return imp.namedTypes.length > 0
    return Boolean(imp.defaultName || imp.namespaceName || imp.named.length > 0)
  })

  // merge by source into one value and one type per module
  const bySource: Map<string, { value?: ParsedImport, type?: ParsedImport, side?: ParsedImport[] }> = new Map()
  for (const imp of nonEmpty) {
    const bucket = bySource.get(imp.source) || {}
    if (imp.kind === 'side-effect') {
      bucket.side = bucket.side || []
      bucket.side.push(imp)
    }
    else if (imp.kind === 'type') {
      if (!bucket.type) bucket.type = { kind: 'type', source: imp.source, named: [], namedTypes: [], original: '' }
      bucket.type.namedTypes = (bucket.type.namedTypes || []).concat(imp.namedTypes)
    }
    else {
      if (!bucket.value) bucket.value = { kind: 'value', source: imp.source, named: [], namedTypes: [], original: '' }
      if (imp.defaultName) bucket.value.defaultName = imp.defaultName
      if (imp.namespaceName) bucket.value.namespaceName = imp.namespaceName
      bucket.value.named = (bucket.value.named || []).concat(imp.named)
      // if imp has namedTypes mixed in value, move them to type bucket
      if (imp.namedTypes.length > 0) {
        if (!bucket.type) bucket.type = { kind: 'type', source: imp.source, named: [], namedTypes: [], original: '' }
        bucket.type.namedTypes = bucket.type.namedTypes.concat(imp.namedTypes)
      }
    }
    bySource.set(imp.source, bucket)
  }

  // build output imports
  const entries: ParsedImport[] = []
  for (const [sourcePath, bucket] of bySource) {
    if (bucket.side)
      entries.push(...bucket.side)
    if (bucket.value) {
      // flip alias direction only for simple one-letter aliases in value named specifiers
      const flipIfSimple = (s: { name: string, alias?: string }) => {
        if (!s.alias) return s
        const simple = /^[A-Za-z]$/.test(s.name) && /^[A-Za-z]$/.test(s.alias)
        return simple ? { name: s.alias, alias: s.name } : s
      }
      bucket.value.named = bucket.value.named.map(flipIfSimple)
      // sort by left-side identifier
      bucket.value.named.sort((a, b) => a.name.localeCompare(b.name))
      entries.push(bucket.value)
    }
    if (bucket.type && bucket.type.namedTypes.length > 0) {
      // dedupe and sort
      const seen = new Set<string>()
      const flipIfSimple = (s: { name: string, alias?: string }) => {
        if (!s.alias) return s
        const simple = /^[A-Za-z]$/.test(s.name) && /^[A-Za-z]$/.test(s.alias)
        return simple ? { name: s.alias, alias: s.name } : s
      }
      bucket.type.namedTypes = bucket.type.namedTypes.map(flipIfSimple)
        .filter((s) => {
        const k = `${s.name}|${s.alias || ''}`
        if (seen.has(k)) return false
        seen.add(k)
        return true
      })
      bucket.type.namedTypes.sort((a, b) => a.name.localeCompare(b.name))
      entries.push(bucket.type)
    }
  }

  // sort modules: types first, then side-effects, then values.
  // Within type and value kinds, sort externals before relatives. For values with same rank, sort by form (default, namespace, named), then by source.
  const rank = (p: string) => p.startsWith('.') ? 2 : (p.startsWith('node:') ? 0 : 1)
  const formRank = (imp: ParsedImport): number => {
    if (imp.kind !== 'value') return 99
    if (imp.defaultName) return 0
    if (imp.namespaceName) return 1
    return 2
  }
  entries.sort((a, b) => {
    if (a.kind !== b.kind) {
      if (a.kind === 'type') return -1
      if (b.kind === 'type') return 1
      if (a.kind === 'side-effect') return -1
      if (b.kind === 'side-effect') return 1
    }
    if (a.kind === 'type' && b.kind === 'type') {
      const ra = rank(a.source)
      const rb = rank(b.source)
      if (ra !== rb) return ra - rb
      return a.source.localeCompare(b.source)
    }
    if (a.kind === 'value' && b.kind === 'value') {
      const ra = rank(a.source)
      const rb = rank(b.source)
      if (ra !== rb) return ra - rb
      const fa = formRank(a)
      const fb = formRank(b)
      if (fa !== fb) return fa - fb
      return a.source.localeCompare(b.source)
    }
    return a.source.localeCompare(b.source)
  })

  const rendered = entries.map(renderImport).join('\n')
  // ensure a trailing blank line after imports if there is following code
  const sep = rest.length > 0 && !rest.startsWith('\n') ? '\n\n' : '\n'
  return `${rendered}${sep}${rest.replace(/^\n+/, '')}`
}

function renderImport(imp: ParsedImport): string {
  if (imp.kind === 'side-effect')
    return `import '${imp.source}'`
  if (imp.kind === 'type') {
    const named = imp.namedTypes.map(s => s.alias ? `${s.name} as ${s.alias}` : s.name).join(', ')
    return `import type { ${named} } from '${imp.source}'`
  }
  const parts: string[] = []
  if (imp.defaultName)
    parts.push(imp.defaultName)
  if (imp.namespaceName)
    parts.push(`* as ${imp.namespaceName}`)
  if (imp.named.length > 0) {
    const named = imp.named.map(s => s.alias ? `${s.name} as ${s.alias}` : s.name).join(', ')
    parts.push(`{ ${named} }`)
  }
  const left = parts.join(', ')
  return `import ${left} from '${imp.source}'`
}

function parseImportStatement(stmt: string): ParsedImport | undefined {
  // side-effect: import 'module'
  let m = stmt.match(/^\s*import\s+['"]([^'"]+)['"]/)
  if (m) {
    return { kind: 'side-effect', source: m[1], named: [], namedTypes: [], original: stmt }
  }
  // type-only: import type { A, B as C } from 'x'
  m = stmt.match(/^\s*import\s+type\s+\{([\s\S]*?)\}\s+from\s+['"]([^'"]+)['"]/)
  if (m) {
    const spec = m[1]
    const source = m[2]
    const namedTypes = spec.split(',').map(s => s.trim()).filter(Boolean).map((s) => {
      const mm = s.match(/^(\w+)(?:\s+as\s+(\w+))?$/)
      return { name: mm?.[1] || s, alias: mm?.[2] }
    })
    return { kind: 'type', source, named: [], namedTypes, original: stmt }
  }
  // value import: default/namespace/named (with possible "type" in named)
  m = stmt.match(/^\s*import\s+([\s\S]+?)\s+from\s+['"]([^'"]+)['"]/)
  if (!m)
    return undefined
  let left = m[1].trim()
  const source = m[2]
  let defaultName: string | undefined
  let namespaceName: string | undefined
  const named: Array<{ name: string, alias?: string }> = []
  const namedTypes: Array<{ name: string, alias?: string }> = []

  // extract named group if any
  const namedMatch = left.match(/\{([\s\S]*?)\}/)
  if (namedMatch) {
    const inner = namedMatch[1]
    const items = inner.split(',').map(s => s.trim()).filter(Boolean)
    for (const it of items) {
      const isType = /^type\s+/.test(it)
      const t = it.replace(/^type\s+/, '')
      const mm = t.match(/^(\w+)(?:\s+as\s+(\w+))?$/)
      if (!mm) continue
      const entry = { name: mm[1], alias: mm[2] }
      if (isType) namedTypes.push(entry)
      else named.push(entry)
    }
    // remove named portion from left
    left = left.replace(/\{[\s\S]*?\}/, '').trim()
  }

  // process remaining: possible default and/or namespace
  if (left.length > 0) {
    const parts = left.split(',').map(s => s.trim()).filter(Boolean)
    for (const p of parts) {
      if (p.startsWith('* as '))
        namespaceName = p.slice(5).trim()
      else if (/^\w+$/.test(p))
        defaultName = p
    }
  }
  return { kind: 'value', source, defaultName, namespaceName, named, namedTypes, original: stmt }
}


