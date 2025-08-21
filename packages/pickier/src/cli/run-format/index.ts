import type { FormatOptions } from './types'
import { readFileSync, writeFileSync } from 'node:fs'
import { relative } from 'node:path'
import process from 'node:process'
import { glob as tinyGlob } from 'tinyglobby'
import { formatCode } from '../../format'
import { colors } from '../../utils'
import { expandPatterns, loadConfigFromPath } from './utils'

export async function runFormat(globs: string[], options: FormatOptions): Promise<number> {
  const cfg = await loadConfigFromPath(options.config)
  const raw = globs.length ? globs : ['.']
  const patterns = expandPatterns(raw)
  const extSet = new Set((options.ext || cfg.format.extensions.join(',')).split(',').map((s) => {
    const t = s.trim()
    return t.startsWith('.') ? t : `.${t}`
  }))

  const entries: string[] = await tinyGlob(patterns, {
    dot: false,
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
    onlyFiles: true,
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

// Re-export types for convenience
export type { FormatOptions } from './types'
