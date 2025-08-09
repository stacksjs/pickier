import { readFileSync, writeFileSync } from 'node:fs'
import { relative } from 'node:path'
import process from 'node:process'
import fg from 'fast-glob'
import { colors } from '../utils'

export interface FormatOptions {
  write?: boolean
  check?: boolean
  config?: string
  ignorePath?: string
  ext?: string
  verbose?: boolean
}

function expandPatterns(patterns: string[]): string[] {
  return patterns.map((p) => {
    const hasMagic = /[\\*?[\]{}()!]/.test(p)
    if (hasMagic)
      return p
    return `${p.replace(/\/$/, '')}/**/*`
  })
}

function normalizeWhitespace(src: string): string {
  // basic, fast formatting strategy: trim trailing spaces, ensure LF, collapse excessive blank lines to max 1
  if (src.length === 0)
    return ''
  const lines = src.replace(/\r\n/g, '\n').split('\n')
  const out: string[] = []
  let blank = 0
  for (const l of lines) {
    const t = l.replace(/[ \t]+$/g, '')
    if (t === '') {
      blank++
      if (blank > 1)
        continue
      out.push('')
    }
    else {
      blank = 0
      out.push(t)
    }
  }
  const joined = out.join('\n')
  const lastIsBlank = out[out.length - 1] === ''
  if (lastIsBlank) {
    // ensure two trailing newlines: one for blank line + one final newline
    return joined.endsWith('\n\n') ? joined : joined.endsWith('\n') ? `${joined}\n` : `${joined}\n\n`
  }
  // ensure exactly one trailing newline
  return joined.endsWith('\n') ? joined : `${joined}\n`
}

export async function runFormat(globs: string[], options: FormatOptions): Promise<number> {
  const raw = globs.length ? globs : ['.']
  const patterns = expandPatterns(raw)
  const extSet = new Set((options.ext || '.ts,.tsx,.js,.jsx,.json,.md,.yaml,.yml').split(',').map(s => s.trim()))

  const entries = await fg(patterns, {
    dot: false,
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
    onlyFiles: true,
    unique: true,
    absolute: true,
  })

  const files = entries.filter((f) => {
    const idx = f.lastIndexOf('.')
    if (idx < 0)
      return false
    const ext = f.slice(idx)
    return extSet.has(ext)
  })

  let changed = 0
  let checked = 0
  for (const file of files) {
    const src = readFileSync(file, 'utf8')
    const fmt = normalizeWhitespace(src)
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

  return changed > 0 && options.check ? 1 : 0
}
