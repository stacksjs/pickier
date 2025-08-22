import type { PickierPlugin } from '../types'
import { noRequireImportsRule } from '../rules/ts/no-require-imports'

export const tsPlugin: PickierPlugin = {
  name: 'ts',
  rules: {
    'no-require-imports': noRequireImportsRule,
  },
}
