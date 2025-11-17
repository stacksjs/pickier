import type { PickierConfig } from './types'
import { readFileSync } from 'node:fs'
import { extname, isAbsolute, resolve } from 'node:path'
import process from 'node:process'
import { defaultConfig } from './config'

/**
 * Colorize console output (simple ANSI colors)
 */
export function colorize(code: string, text: string): string {
  return `\x1B[${code}m${text}\x1B[0m`
}

export function green(text: string): string {
  return colorize('32', text)
}

export function red(text: string): string {
  return colorize('31', text)
}

export function yellow(text: string): string {
  return colorize('33', text)
}

export function blue(text: string): string {
  return colorize('34', text)
}

export function gray(text: string): string {
  return colorize('90', text)
}

export function bold(text: string): string {
  return colorize('1', text)
}

export const colors: {
  green: (text: string) => string
  red: (text: string) => string
  yellow: (text: string) => string
  blue: (text: string) => string
  gray: (text: string) => string
  bold: (text: string) => string
} = {
  green,
  red,
  yellow,
  blue,
  gray,
  bold,
}

// Shared CLI utilities (moved from cli/utils.ts)
export function mergeConfig(base: PickierConfig, override: Partial<PickierConfig>): PickierConfig {
  return {
    ...base,
    ...override,
    lint: { ...base.lint, ...(override.lint || {}) },
    format: { ...base.format, ...(override.format || {}) },
    rules: { ...base.rules, ...(override.rules || {}) },
    pluginRules: { ...(base as any).pluginRules || {}, ...(override as any).pluginRules || {} } as any,
  }
}

export async function loadConfigFromPath(pathLike: string | undefined): Promise<PickierConfig> {
  if (!pathLike) {
    // Skip auto-loading in test environment
    if (process.env.PICKIER_NO_AUTO_CONFIG === '1') {
      return defaultConfig
    }

    // Try to auto-load bunfig config if it exists in the project root
    try {
      const { existsSync } = await import('node:fs')
      const { join } = await import('node:path')
      const configPath = join(process.cwd(), 'pickier.config.ts')
      if (existsSync(configPath)) {
        // Load the bunfig-merged config
        const { config } = await import('./config')
        return config
      }
    }
    catch {
      // If bunfig loading fails, fall back to defaultConfig
    }
    return defaultConfig
  }

  const abs = isAbsolute(pathLike) ? pathLike : resolve(process.cwd(), pathLike)
  const ext = extname(abs).toLowerCase()

  if (ext === '.json') {
    const raw = readFileSync(abs, 'utf8')
    return mergeConfig(defaultConfig, JSON.parse(raw) as Partial<PickierConfig>)
  }

  const mod = await import(abs)
  return mergeConfig(defaultConfig, (mod.default || mod) as Partial<PickierConfig>)
}

export function expandPatterns(patterns: string[]): string[] {
  return patterns.map((p) => {
    const hasMagic = /[*?[\]{}()!]/.test(p)
    if (hasMagic)
      return p
    // If it's a file-like input with extension, keep as-is
    if (/\.[A-Z0-9]+$/i.test(p))
      return p
    return `${p.replace(/\/$/, '')}/**/*`
  })
}

export function isCodeFile(file: string, allowedExts: Set<string>): boolean {
  const idx = file.lastIndexOf('.')
  if (idx < 0)
    return false
  const ext = file.slice(idx)
  return allowedExts.has(ext)
}

// Basic POSIX-like normalization for matching
function toPosixPath(p: string): string {
  return p.replace(/\\/g, '/').replace(/\/+/g, '/')
}

/**
 * Lightweight ignore matcher supporting common patterns like double-star slash dir slash double-star.
 * (Example: patterns matching any path segment named "dir" recursively.)
 * Not a full glob engine; optimized for directory skip checks in manual traversal.
 */
export function shouldIgnorePath(absPath: string, ignoreGlobs: string[]): boolean {
  // For files outside the project, only apply universal ignore patterns
  const isOutsideProject = !absPath.startsWith(process.cwd())
  const universalIgnores = ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**']

  const effectiveIgnores = isOutsideProject
    ? ignoreGlobs.filter(pattern => universalIgnores.includes(pattern))
    : ignoreGlobs

  const rel = toPosixPath(isOutsideProject ? absPath : absPath.slice(process.cwd().length))
  // quick checks for typical patterns **/name/**
  for (const g of effectiveIgnores) {
    // normalize
    const gg = toPosixPath(g.trim())

    // handle file extension patterns like **/*.test.ts or **/*.spec.ts
    const filePattern = gg.match(/\*\*\/\*\.(.+)$/)
    if (filePattern) {
      const extension = filePattern[1]
      if (rel.endsWith(`.${extension}`))
        return true
      continue
    }

    // handle patterns like any-depth/name/any-depth (including dot-prefixed names)
    const m = gg.match(/\*\*\/(.+?)\/\*\*$/)
    if (m) {
      const name = m[1]
      if (rel.includes(`/${name}/`) || rel.endsWith(`/${name}`))
        return true
      continue
    }
    // handle any-depth/name (no trailing any-depth)
    const m2 = gg.match(/\*\*\/(.+)$/)
    if (m2) {
      const name = m2[1].replace(/\/$/, '')
      if (rel.includes(`/${name}/`) || rel.endsWith(`/${name}`))
        return true
      continue
    }
  }
  return false
}
