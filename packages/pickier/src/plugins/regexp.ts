import type { PickierPlugin } from '../types'
import { noSuperLinearBacktrackingRule } from '../rules/regexp/no-super-linear-backtracking'

export const regexpPlugin: PickierPlugin = {
  name: 'regexp',
  rules: {
    'no-super-linear-backtracking': noSuperLinearBacktrackingRule,
  },
}
