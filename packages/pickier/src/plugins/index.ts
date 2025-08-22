import type { PickierPlugin } from '../types'
import { pickierPlugin } from './pickier'
import { regexpPlugin } from './regexp'
import { stylePlugin } from './style'
import { tsPlugin } from './ts'

export function getAllPlugins(): PickierPlugin[] {
  return [
    pickierPlugin,
    stylePlugin,
    regexpPlugin,
    tsPlugin,
  ]
}
