import type { PickierConfig } from '../../types'
import { extname, isAbsolute, resolve } from 'node:path'
import process from 'node:process'
import { config as defaultConfig } from '../../config'

export function expandPatterns(patterns: string[]): string[] {
  return patterns.map((p) => {
    const hasMagic = /[\\*?[\]{}()!]/.test(p)
    if (hasMagic)
      return p
    return `${p.replace(/\/$/, '')}/**/*`
  })
}

export async function loadConfigFromPath(pathLike: string | undefined): Promise<PickierConfig> {
  if (!pathLike)
    return defaultConfig
  const abs = isAbsolute(pathLike) ? pathLike : resolve(process.cwd(), pathLike)
  if (extname(abs).toLowerCase() === '.json') {
    const { readFileSync } = await import('node:fs')
    return JSON.parse(readFileSync(abs, 'utf8')) as PickierConfig
  }
  const mod = await import(abs)
  return (mod.default || mod) as PickierConfig
}
