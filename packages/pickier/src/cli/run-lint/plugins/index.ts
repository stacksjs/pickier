import type { PickierPlugin } from '../../../types'
import { pickierPlugin } from './pickier-plugin'
import { regexpPlugin } from './regexp-plugin'
import { stylePlugin } from './style-plugin'
import { tsPlugin } from './ts-plugin'

export function getAllPlugins(): PickierPlugin[] {
  return [
    pickierPlugin,
    stylePlugin,
    regexpPlugin,
    tsPlugin,
  ]
}
