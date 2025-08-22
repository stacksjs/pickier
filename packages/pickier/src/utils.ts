import type { PickierConfig } from './types'
import { readFileSync } from 'node:fs'
import { extname, isAbsolute, resolve } from 'node:path'
import process from 'node:process'
import { config as defaultConfig } from './config'

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
  }
}

export async function loadConfigFromPath(pathLike: string | undefined): Promise<PickierConfig> {
  if (!pathLike)
    return defaultConfig

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
