import type { PickierPlugin } from '../types'
import { preferGlobalBuffer } from '../rules/node/prefer-global-buffer'
import { preferGlobalProcess } from '../rules/node/prefer-global-process'

export const nodePlugin: PickierPlugin = {
  name: 'node',
  rules: {
    'prefer-global/buffer': preferGlobalBuffer,
    'prefer-global/process': preferGlobalProcess,
  },
}
