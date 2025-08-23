import type { PickierPlugin } from '../types'
import { noSuperLinearBacktrackingRule } from '../rules/regexp/no-super-linear-backtracking'
import { noUnusedCapturingGroupRule } from '../rules/regexp/no-unused-capturing-group'

export const regexpPlugin: PickierPlugin = {
  name: 'regexp',
  rules: {
    'no-super-linear-backtracking': noSuperLinearBacktrackingRule,
    'no-unused-capturing-group': noUnusedCapturingGroupRule,
  },
}
