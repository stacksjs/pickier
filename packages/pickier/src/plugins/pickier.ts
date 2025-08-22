import type { PickierPlugin } from '../types'
import { noUnusedVarsRule } from '../rules/pickier/no-unused-vars'
import { preferConstRule } from '../rules/pickier/prefer-const'
import { sortHeritageClausesRule } from '../rules/pickier/sort-heritage-clauses'
import { sortImportsRule } from '../rules/pickier/sort-imports'
import { sortKeysRule } from '../rules/pickier/sort-keys'
import { sortNamedImportsRule } from '../rules/pickier/sort-named-imports'
import { sortObjectsRule } from '../rules/pickier/sort-objects'

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
