import type { PickierPlugin } from '../types'
import { curlyRule } from '../rules/style/curly'
import { maxStatementsPerLineRule } from '../rules/style/max-statements-per-line'

export const stylePlugin: PickierPlugin = {
  name: 'style',
  rules: {
    'curly': curlyRule,
    'max-statements-per-line': maxStatementsPerLineRule,
  },
}
