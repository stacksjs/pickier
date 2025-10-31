import type { PickierPlugin } from '../types'
import { eslintPlugin } from './eslint'
import { generalPlugin } from './general'
import { markdownPlugin } from './markdown'
import { pickierPlugin } from './pickier'
import { qualityPlugin } from './quality'
import { regexpPlugin } from './regexp'
import { stylePlugin } from './style'
import { tsPlugin } from './ts'

export function getAllPlugins(): PickierPlugin[] {
  return [
    eslintPlugin, // Legacy eslint/ prefix for backward compatibility
    generalPlugin, // New general/ prefix for error detection rules
    qualityPlugin, // New quality/ prefix for best practices & code quality
    pickierPlugin, // pickier/ prefix for pickier-specific rules
    stylePlugin, // style/ prefix for style rules
    regexpPlugin, // regexp/ prefix for regex rules
    tsPlugin, // ts/ prefix for TypeScript rules
    markdownPlugin, // markdown/ prefix for markdown rules
  ]
}
