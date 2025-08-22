/* eslint-disable unused-imports/no-unused-vars */
import type { PickierPlugin } from '../types'
import { sortObjectsRule } from '../rules/pickier/sort-objects'
import { sortImportsRule } from '../rules/pickier/sort-imports'
import { sortNamedImportsRule } from '../rules/pickier/sort-named-imports'
import { sortHeritageClausesRule } from '../rules/pickier/sort-heritage-clauses'
import { sortKeysRule } from '../rules/pickier/sort-keys'
import { preferConstRule } from '../rules/pickier/prefer-const'
import { noUnusedVarsRule } from '../rules/pickier/no-unused-vars'

export const pickierPlugin: PickierPlugin = {
  name: 'pickier',
  rules: {
    'sort-objects': sortObjectsRule,
    'sort-imports': sortImportsRule,
    'sort-named-imports': sortNamedImportsRule,
    'sort-heritage-clauses': sortHeritageClausesRule,
    'sort-keys': sortKeysRule,
    'prefer-const': preferConstRule,
    'no-unused-vars': noUnusedVarsRule,
  },
}
