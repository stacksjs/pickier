import type { PickierPlugin } from '../types'
import { noRequireImportsRule } from '../rules/ts/no-require-imports'
import { noTopLevelAwaitRule } from '../rules/ts/no-top-level-await'
import { noTsExportEqualRule } from '../rules/ts/no-ts-export-equal'

export const tsPlugin: PickierPlugin = {
  name: 'ts',
  rules: {
    'no-require-imports': noRequireImportsRule,
    'no-top-level-await': noTopLevelAwaitRule,
    'no-ts-export-equal': noTsExportEqualRule,
  },
}
