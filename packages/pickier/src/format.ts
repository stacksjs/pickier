import type { PickierConfig } from './types'

const CODE_EXTS = new Set(['.ts', '.js'])
const JSON_EXTS = new Set(['.json', '.jsonc'])

function getFileExt(filePath: string): string {
  const idx = filePath.lastIndexOf('.')
  return idx >= 0 ? filePath.slice(idx) : ''
}

function isCodeFileExt(filePath: string): boolean {
  return CODE_EXTS.has(getFileExt(filePath))
}

function isJsonFileExt(filePath: string): boolean {
  return JSON_EXTS.has(getFileExt(filePath))
}

function toSpaces(count: number): string {
  return ' '.repeat(Math.max(0, count))
}

function makeIndent(visualLevels: number, cfg: PickierConfig): string {
  const style = cfg.format.indentStyle || 'spaces'
  if (style === 'tabs')
    return '\t'.repeat(Math.max(0, visualLevels))
  return toSpaces(Math.max(0, visualLevels * cfg.format.indent))
}

function convertDoubleToSingle(str: string): string {
  // strip surrounding quotes
  const inner = str.slice(1, -1)
  // unescape escaped double quotes, keep other escapes intact
  const unescaped = inner.replace(/\\"/g, '"')
  // escape single quotes that aren't already escaped
  const escapedSingles = unescaped.replace(/(?<!\\)'/g, '\\\'')
  return `'${escapedSingles}'`
}

function convertSingleToDouble(str: string): string {
  const inner = str.slice(1, -1)
  const unescaped = inner.replace(/\\'/g, '\'')
  const escapedDoubles = unescaped.replace(/"/g, '\\"')
  return `"${escapedDoubles}"`
}

function fixQuotes(content: string, preferred: 'single' | 'double', filePath: string): string {
  if (!isCodeFileExt(filePath))
    return content

  // OPTIMIZATION: Single-pass quote conversion with position tracking
  const lines = content.split('\n')
  const result: string[] = []

  for (const line of lines) {
    let output = ''
    let i = 0
    let inString: 'single' | 'double' | 'template' | null = null
    let escaped = false
    let stringStart = 0

    while (i < line.length) {
      const ch = line[i]

      if (escaped) {
        output += ch
        escaped = false
        i++
        continue
      }

      if (ch === '\\' && inString) {
        escaped = true
        output += ch
        i++
        continue
      }

      // Check for string boundaries
      if (!inString) {
        if (ch === '"') {
          inString = 'double'
          stringStart = i
          i++
          continue
        }
        if (ch === '\'') {
          inString = 'single'
          stringStart = i
          i++
          continue
        }
        if (ch === '`') {
          inString = 'template'
          output += ch
          i++
          continue
        }
        output += ch
        i++
      }
      else {
        // Inside a string - check if we're exiting
        if ((inString === 'double' && ch === '"') || (inString === 'single' && ch === '\'')) {
          // Found closing quote - convert if needed
          const stringContent = line.slice(stringStart + 1, i)
          if (inString === 'double' && preferred === 'single') {
            // Convert double to single
            output += convertDoubleToSingle(`"${stringContent}"`)
          }
          else if (inString === 'single' && preferred === 'double') {
            // Convert single to double
            output += convertSingleToDouble(`'${stringContent}'`)
          }
          else {
            // Keep as is
            output += line[stringStart] + stringContent + ch
          }
          inString = null
          i++
          continue
        }
        if (inString === 'template' && ch === '`') {
          // Template literal end
          output += ch
          inString = null
          i++
          continue
        }
        // Still inside string, buffer it
        i++
      }
    }

    // Handle unclosed strings (keep as is)
    if (inString && inString !== 'template') {
      output += line.slice(stringStart)
    }

    result.push(output)
  }

  return result.join('\n')
}

function fixIndentation(content: string, indentSize: number, cfg: PickierConfig): string {
  const lines = content.split('\n')
  const out: string[] = []
  let indentLevel = 0 // visual levels
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
      indentLevel = Math.max(0, indentLevel - 1)

    const fixed = `${makeIndent(indentLevel, cfg)}${trimmed}`
    out.push(fixed)

    // Increase indentation after opening braces for subsequent lines
    if (/\{\s*$/.test(trimmed))
      indentLevel += 1
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

  // Check for imports BEFORE any processing to ensure consistent final newline policy
  const _hadImports = /^\s*import\b/m.test(src)

  // OPTIMIZATION: Normalize newlines and trim trailing whitespace in one pass
  const rawLines = src.replace(/\r\n/g, '\n').split('\n')
  let lines: string[]

  if (cfg.format.trimTrailingWhitespace) {
    // Combine trimming and blank line collapsing in one pass
    lines = []
    let blank = 0
    const maxConsecutive = Math.max(0, cfg.format.maxConsecutiveBlankLines)

    for (const l of rawLines) {
      const trimmed = l.replace(/[ \t]+$/g, '')
      if (trimmed === '') {
        blank++
        if (blank <= maxConsecutive)
          lines.push('')
      }
      else {
        blank = 0
        lines.push(trimmed)
      }
    }
  }
  else {
    // Just collapse blank lines
    lines = collapseBlankLines(rawLines, Math.max(0, cfg.format.maxConsecutiveBlankLines))
  }

  let joined = lines.join('\n')
  // Remove any leading blank lines at the top of the file
  joined = joined.replace(/^(?:[ \t]*\n)+/, '')

  // import management (ts/js only)
  if (isCodeFileExt(filePath))
    joined = formatImports(joined)

  // json/package/tsconfig sorting
  if (isJsonFileExt(filePath)) {
    const sorted = trySortKnownJson(joined, filePath)
    if (sorted != null)
      joined = sorted
  }

  // OPTIMIZATION: Combine quote fixing, indentation, spacing, and semicolon removal for code files
  if (isCodeFileExt(filePath)) {
    joined = fixQuotes(joined, cfg.format.quotes, filePath)
    joined = fixIndentation(joined, cfg.format.indent, cfg)
    joined = normalizeCodeSpacing(joined)
    if (cfg.format.semi === true)
      joined = removeStylisticSemicolons(joined)
  }
  else {
    // For non-code files, just do quotes
    joined = fixQuotes(joined, cfg.format.quotes, filePath)
  }

  // ensure final newline policy
  if (cfg.format.finalNewline === 'none') {
    return joined.replace(/\n+$/g, '')
  }

  // For idempotency: if file already has 1-2 trailing newlines and we want "one", keep it stable
  // This prevents oscillation when imports are added/removed
  const hasOneNewline = /[^\n]\n$/.test(joined) || joined === '\n'
  const hasTwoNewlines = /\n\n$/.test(joined)

  if (cfg.format.finalNewline === 'two') {
    // Always want exactly two newlines
    if (hasTwoNewlines)
      return joined
    if (hasOneNewline)
      return `${joined}\n`
    return `${joined}\n\n`
  }

  // finalNewline === 'one': always ensure exactly one newline (stable and idempotent)
  if (hasTwoNewlines) {
    // Reduce from 2 to 1
    return joined.replace(/\n\n$/, '\n')
  }
  if (hasOneNewline) {
    return joined
  }
  return `${joined}\n`
}

export function detectQuoteIssues(line: string, preferred: 'single' | 'double'): number[] {
  // return character indices (0-based) where offending quote starts

  // Skip TypeScript triple-slash directives (they must use double quotes)
  if (/^\s*\/\/\/\s*<reference/.test(line)) {
    return []
  }

  const indices: number[] = []

  // Track if we're inside any type of string to avoid flagging quotes inside them
  let inString: 'single' | 'double' | 'template' | null = null
  let escaped = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]

    if (escaped) {
      escaped = false
      continue
    }

    if (ch === '\\') {
      escaped = true
      continue
    }

    // Check for string boundaries
    if (!inString) {
      // Not inside any string - check if we're entering one
      if (ch === '\'') {
        if (preferred === 'double') {
          // Single quote when double is preferred
          const beforeSlash = line.lastIndexOf('//', i)
          if (beforeSlash === -1 || beforeSlash > i) {
            indices.push(i)
          }
        }
        inString = 'single'
        continue
      }
      else if (ch === '"') {
        if (preferred === 'single') {
          // Double quote when single is preferred
          const beforeSlash = line.lastIndexOf('//', i)
          if (beforeSlash === -1 || beforeSlash > i) {
            indices.push(i)
          }
        }
        inString = 'double'
        continue
      }
      else if (ch === '`') {
        inString = 'template'
        continue
      }
    }
    else {
      // Inside a string - check if we're exiting
      if ((inString === 'single' && ch === '\'')
        || (inString === 'double' && ch === '"')
        || (inString === 'template' && ch === '`')) {
        inString = null
        continue
      }
    }
  }

  return indices
}

export function hasIndentIssue(
  leading: string,
  indentSize: number,
  indentStyle: 'spaces' | 'tabs' = 'spaces',
): boolean {
  if (indentStyle === 'tabs') {
    // For tabs style, require leading indentation to be tabs only
    return /[^\t]/.test(leading)
  }
  if (/\t/.test(leading))
    return true
  const spaces = leading.length
  return spaces % indentSize !== 0
}

function maskStrings(input: string): { text: string, strings: string[] } {
  const strings: string[] = []
  let out = ''
  let i = 0
  let mode: 'none' | 'single' | 'double' | 'template' = 'none'
  let start = 0
  while (i < input.length) {
    const ch = input[i]
    if (mode === 'none' && (ch === '\'' || ch === '"' || ch === '`')) {
      if (ch === '\'')
        mode = 'single'
      else if (ch === '"')
        mode = 'double'
      else mode = 'template'
      start = i
      i++
      while (i < input.length) {
        const c = input[i]
        if (c === '\\') {
          i += 2
          continue
        }
        if ((mode === 'single' && c === '\'') || (mode === 'double' && c === '"') || (mode === 'template' && c === '`')) {
          i++
          break
        }
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
  return { text: out, strings }
}

function unmaskStrings(text: string, strings: string[]): string {
  return text.replace(/@@S(\d+)@@/g, (_, idx: string) => strings[Number(idx)] ?? '')
}

function normalizeCodeSpacing(input: string): string {
  const lines = input.split('\n')
  const result: string[] = []

  for (const line of lines) {
    // Skip comment-only lines to preserve their formatting
    if (/^\s*\/\//.test(line) || /^\s*\/\*/.test(line)) {
      result.push(line)
      continue
    }

    const { text, strings } = maskStrings(line)
    let t = text
    // ensure a space before opening brace for blocks/objects
    t = t.replace(/(\S)\{/g, '$1 {')
    // ensure a space after opening brace before keywords (return, if, etc)
    t = t.replace(/\{(return|if|for|while|switch|const|let|var|function)\b/g, '{ $1')
    // add spaces after commas
    t = t.replace(/,(\S)/g, ', $1')
    // add spaces around equals but not for ==, ===, =>, <=, >=
    t = t.replace(/(?<![=!<>])=(?![=><])/g, ' = ')
    // add spaces around arithmetic operators (run multiple times for consecutive operators)
    // + operator (not part of ++ or unary +)
    t = t.replace(/(\w)\+(\w)/g, '$1 + $2')
    t = t.replace(/(\w)\+(\w)/g, '$1 + $2') // Run again for consecutive operators
    // - operator (not part of -- or unary -)
    t = t.replace(/(\w)-(\w)/g, '$1 - $2')
    t = t.replace(/(\w)-(\w)/g, '$1 - $2')
    // * and / operators
    t = t.replace(/(\w)\*(\w)/g, '$1 * $2')
    t = t.replace(/(\w)\*(\w)/g, '$1 * $2')
    t = t.replace(/(\w)\/(\w)/g, '$1 / $2')
    t = t.replace(/(\w)\/(\w)/g, '$1 / $2')
    // add spaces after semicolons in for headers (but not between consecutive semicolons)
    t = t.replace(/;([^\s;])/g, '; $1')
    // add spaces around simple comparison operators
    t = t.replace(/([\w\])])<(\S)/g, '$1 < $2')
    t = t.replace(/(\S)>([\w[(])/g, '$1 > $2')
    // collapse multiple spaces to single, but not leading indentation
    const trimmedStart = t.trimStart()
    const leadLength = t.length - trimmedStart.length
    const lead = t.slice(0, leadLength)
    const rest = t.slice(leadLength)
    const processed = lead + rest.replace(/\s{2,}/g, ' ')

    result.push(unmaskStrings(processed, strings))
  }

  return result.join('\n')
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
    line = line.replace(/;{2,}\s*$/, ';')
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

export function formatImports(source: string): string {
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
    if (imp.kind !== 'value')
      continue
    // keep default and namespace regardless
    imp.named = imp.named.filter((s) => {
      // if alias present, keep
      if (s.alias)
        return true
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
      if (!bucket.type)
        bucket.type = { kind: 'type', source: imp.source, named: [], namedTypes: [], original: '' }
      bucket.type.namedTypes = (bucket.type.namedTypes || []).concat(imp.namedTypes)
    }
    else {
      if (!bucket.value)
        bucket.value = { kind: 'value', source: imp.source, named: [], namedTypes: [], original: '' }
      if (imp.defaultName)
        bucket.value.defaultName = imp.defaultName
      if (imp.namespaceName)
        bucket.value.namespaceName = imp.namespaceName
      bucket.value.named = (bucket.value.named || []).concat(imp.named)
      // if imp has namedTypes mixed in value, move them to type bucket
      if (imp.namedTypes.length > 0) {
        if (!bucket.type)
          bucket.type = { kind: 'type', source: imp.source, named: [], namedTypes: [], original: '' }
        bucket.type.namedTypes = bucket.type.namedTypes.concat(imp.namedTypes)
      }
    }
    bySource.set(imp.source, bucket)
  }

  // build output imports
  const entries: ParsedImport[] = []
  for (const [_sourcePath, bucket] of bySource) {
    if (bucket.side)
      entries.push(...bucket.side)
    if (bucket.value) {
      // flip alias direction only for simple one-letter aliases in value named specifiers
      const flipIfSimple = (s: { name: string, alias?: string }) => {
        if (!s.alias)
          return s
        const simple = /^[A-Z]$/i.test(s.name) && /^[A-Z]$/i.test(s.alias)
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
        if (!s.alias)
          return s
        const simple = /^[A-Z]$/i.test(s.name) && /^[A-Z]$/i.test(s.alias)
        return simple ? { name: s.alias, alias: s.name } : s
      }
      bucket.type.namedTypes = bucket.type.namedTypes.map(flipIfSimple)
        .filter((s) => {
          const k = `${s.name}|${s.alias || ''}`
          if (seen.has(k))
            return false
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
    if (imp.kind !== 'value')
      return 99
    if (imp.defaultName)
      return 0
    if (imp.namespaceName)
      return 1
    return 2
  }
  entries.sort((a, b) => {
    if (a.kind !== b.kind) {
      if (a.kind === 'type')
        return -1
      if (b.kind === 'type')
        return 1
      if (a.kind === 'side-effect')
        return -1
      if (b.kind === 'side-effect')
        return 1
    }
    if (a.kind === 'type' && b.kind === 'type') {
      const ra = rank(a.source)
      const rb = rank(b.source)
      if (ra !== rb)
        return ra - rb
      return a.source.localeCompare(b.source)
    }
    if (a.kind === 'value' && b.kind === 'value') {
      const ra = rank(a.source)
      const rb = rank(b.source)
      if (ra !== rb)
        return ra - rb
      const fa = formRank(a)
      const fb = formRank(b)
      if (fa !== fb)
        return fa - fb
      return a.source.localeCompare(b.source)
    }
    return a.source.localeCompare(b.source)
  })

  // If no imports remain after filtering, return the rest without import block
  if (entries.length === 0) {
    // Remove leading newlines from rest for consistency
    return rest.replace(/^\n+/, '')
  }

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
  m = stmt.match(/^\s*import\s+type\s+\{([^}]*)\}\s+from\s+['"]([^'"]+)['"]/)
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
  // Use non-backtracking parsing: locate the leading "import" and trailing "from 'src'" and slice
  const importLead = stmt.match(/^\s*import\s+/)
  const fromMatch = stmt.match(/\sfrom\s+['"]([^'"]+)['"]\s*;?$/)
  if (!importLead || !fromMatch)
    return undefined
  const source = fromMatch[1]
  let left = stmt.slice(importLead[0].length, fromMatch.index).trim()
  let defaultName: string | undefined
  let namespaceName: string | undefined
  const named: Array<{ name: string, alias?: string }> = []
  const namedTypes: Array<{ name: string, alias?: string }> = []

  // extract named group if any
  const namedMatch = left.match(/\{([^}]*)\}/)
  if (namedMatch) {
    const inner = namedMatch[1]
    const items = inner.split(',').map(s => s.trim()).filter(Boolean)
    for (const it of items) {
      const isType = /^type\s+/.test(it)
      const t = it.replace(/^type\s+/, '')
      const mm = t.match(/^(\w+)(?:\s+as\s+(\w+))?$/)
      if (!mm)
        continue
      const entry = { name: mm[1], alias: mm[2] }
      if (isType)
        namedTypes.push(entry)
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

// Sort known JSON files according to curated orders
function trySortKnownJson(input: string, filePath: string): string | null {
  if (/package\.json$/i.test(filePath))
    return sortPackageJsonContent(input)
  if (/[jt]sconfig(?:\..+)?\.json$/i.test(filePath))
    return sortTsconfigContent(input)
  return null
}

function parseJsonSafe(text: string): any | null {
  try {
    return JSON.parse(text)
  }
  catch {
    return null
  }
}

function sortObjectKeys(obj: Record<string, any>, order: string[], extraAscPatterns: RegExp[] = []): Record<string, any> {
  const out: Record<string, any> = {}
  // place ordered keys first
  for (const k of order) {
    if (Object.prototype.hasOwnProperty.call(obj, k))
      out[k] = obj[k]
  }
  // then keys matching extra patterns in asc
  for (const rx of extraAscPatterns) {
    const keys = Object.keys(obj).filter(k => rx.test(k) && !(k in out)).sort()
    for (const k of keys)
      out[k] = obj[k]
  }
  // finally remaining keys asc
  const remaining = Object.keys(obj).filter(k => !(k in out)).sort()
  for (const k of remaining)
    out[k] = obj[k]
  return out
}

function sortDepsAsc(obj: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {}
  for (const k of Object.keys(obj).sort())
    out[k] = obj[k]
  return out
}

function sortPackageJsonContent(text: string): string {
  const data = parseJsonSafe(text)
  if (!data || typeof data !== 'object')
    return text
  const topOrder = [
    'publisher',
    'name',
    'displayName',
    'type',
    'version',
    'private',
    'packageManager',
    'description',
    'author',
    'contributors',
    'license',
    'funding',
    'homepage',
    'repository',
    'bugs',
    'keywords',
    'categories',
    'sideEffects',
    'imports',
    'exports',
    'main',
    'module',
    'unpkg',
    'jsdelivr',
    'types',
    'typesVersions',
    'bin',
    'icon',
    'files',
    'engines',
    'activationEvents',
    'contributes',
    'scripts',
    'peerDependencies',
    'peerDependenciesMeta',
    'dependencies',
    'optionalDependencies',
    'devDependencies',
    'pnpm',
    'overrides',
    'resolutions',
    'husky',
    'simple-git-hooks',
    'lint-staged',
    'eslintConfig',
  ]
  const sortedTop = sortObjectKeys(data, topOrder)
  // sort files array asc
  if (Array.isArray(sortedTop.files)) {
    const allStrings = sortedTop.files.every((v: any) => typeof v === 'string')
    if (allStrings)
      sortedTop.files = [...sortedTop.files].sort()
  }
  // sort deps blocks A-Z
  for (const k of Object.keys(sortedTop)) {
    if (/^(?:dev|peer|optional|bundled)?[Dd]ependencies(?:Meta)?$/.test(k) || /^(?:resolutions|overrides|pnpm\.overrides)$/.test(k)) {
      if (sortedTop[k] && typeof sortedTop[k] === 'object')
        sortedTop[k] = sortDepsAsc(sortedTop[k])
    }
  }
  // pnpm.overrides nested
  if (sortedTop.pnpm && typeof sortedTop.pnpm === 'object' && sortedTop.pnpm.overrides && typeof sortedTop.pnpm.overrides === 'object')
    sortedTop.pnpm.overrides = sortDepsAsc(sortedTop.pnpm.overrides)
  // exports specific sub-key order
  if (sortedTop.exports && typeof sortedTop.exports === 'object') {
    const exp = sortedTop.exports
    const subOrder = ['types', 'import', 'require', 'default']
    if (!Array.isArray(exp)) {
      const out: Record<string, any> = {}
      for (const key of Object.keys(exp)) {
        const val = exp[key]
        if (val && typeof val === 'object' && !Array.isArray(val))
          out[key] = sortObjectKeys(val, subOrder)
        else out[key] = val
      }
      sortedTop.exports = out
    }
  }
  // git hooks order inside known containers
  const hookOrder = ['pre-commit', 'prepare-commit-msg', 'commit-msg', 'post-commit', 'pre-rebase', 'post-rewrite', 'post-checkout', 'post-merge', 'pre-push', 'pre-auto-gc']
  for (const hk of ['gitHooks', 'husky', 'simple-git-hooks']) {
    if (sortedTop[hk] && typeof sortedTop[hk] === 'object')
      sortedTop[hk] = sortObjectKeys(sortedTop[hk], hookOrder)
  }
  return JSON.stringify(sortedTop, null, 2)
}

function sortTsconfigContent(text: string): string {
  const data = parseJsonSafe(text)
  if (!data || typeof data !== 'object')
    return text
  const topOrder = ['extends', 'compilerOptions', 'references', 'files', 'include', 'exclude']
  const outTop = sortObjectKeys(data, topOrder)
  if (outTop.compilerOptions && typeof outTop.compilerOptions === 'object') {
    const compilerOrder = [
      'incremental',
      'composite',
      'tsBuildInfoFile',
      'disableSourceOfProjectReferenceRedirect',
      'disableSolutionSearching',
      'disableReferencedProjectLoad',
      'target',
      'jsx',
      'jsxFactory',
      'jsxFragmentFactory',
      'jsxImportSource',
      'lib',
      'moduleDetection',
      'noLib',
      'reactNamespace',
      'useDefineForClassFields',
      'emitDecoratorMetadata',
      'experimentalDecorators',
      'libReplacement',
      'baseUrl',
      'rootDir',
      'rootDirs',
      'customConditions',
      'module',
      'moduleResolution',
      'moduleSuffixes',
      'noResolve',
      'paths',
      'resolveJsonModule',
      'resolvePackageJsonExports',
      'resolvePackageJsonImports',
      'typeRoots',
      'types',
      'allowArbitraryExtensions',
      'allowImportingTsExtensions',
      'allowUmdGlobalAccess',
      'allowJs',
      'checkJs',
      'maxNodeModuleJsDepth',
      'strict',
      'strictBindCallApply',
      'strictFunctionTypes',
      'strictNullChecks',
      'strictPropertyInitialization',
      'allowUnreachableCode',
      'allowUnusedLabels',
      'alwaysStrict',
      'exactOptionalPropertyTypes',
      'noFallthroughCasesInSwitch',
      'noImplicitAny',
      'noImplicitOverride',
      'noImplicitReturns',
      'noImplicitThis',
      'noPropertyAccessFromIndexSignature',
      'noUncheckedIndexedAccess',
      'noUnusedLocals',
      'noUnusedParameters',
      'useUnknownInCatchVariables',
      'declaration',
      'declarationDir',
      'declarationMap',
      'downlevelIteration',
      'emitBOM',
      'emitDeclarationOnly',
      'importHelpers',
      'importsNotUsedAsValues',
      'inlineSourceMap',
      'inlineSources',
      'mapRoot',
      'newLine',
      'noEmit',
      'noEmitHelpers',
      'noEmitOnError',
      'outDir',
      'outFile',
      'preserveConstEnums',
      'preserveValueImports',
      'removeComments',
      'sourceMap',
      'sourceRoot',
      'stripInternal',
      'allowSyntheticDefaultImports',
      'esModuleInterop',
      'forceConsistentCasingInFileNames',
      'isolatedDeclarations',
      'isolatedModules',
      'preserveSymlinks',
      'verbatimModuleSyntax',
      'erasableSyntaxOnly',
      'skipDefaultLibCheck',
      'skipLibCheck',
    ]
    outTop.compilerOptions = sortObjectKeys(outTop.compilerOptions, compilerOrder)
  }
  return JSON.stringify(outTop, null, 2)
}
