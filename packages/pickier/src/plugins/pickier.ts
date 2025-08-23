import type { PickierPlugin } from '../types'
import { importDedupeRule } from '../rules/pickier/import-dedupe'
import { noImportDistRule } from '../rules/pickier/no-import-dist'
import { noImportNodeModulesByPathRule } from '../rules/pickier/no-import-node-modules-by-path'
import { noUnusedVarsRule } from '../rules/pickier/no-unused-vars'
import { preferConstRule } from '../rules/pickier/prefer-const'
import { sortExportsRule } from '../rules/pickier/sort-exports'
import { sortHeritageClausesRule } from '../rules/pickier/sort-heritage-clauses'
import { sortImportsRule } from '../rules/pickier/sort-imports'
import { sortKeysRule } from '../rules/pickier/sort-keys'
import { sortNamedImportsRule } from '../rules/pickier/sort-named-imports'
import { sortObjectsRule } from '../rules/pickier/sort-objects'
import { topLevelFunctionRule } from '../rules/pickier/top-level-function'

export const pickierPlugin: PickierPlugin = {
  name: 'pickier',
  rules: {
    'sort-exports': sortExportsRule,
    'sort-objects': sortObjectsRule,
    'sort-imports': sortImportsRule,
    'sort-named-imports': sortNamedImportsRule,
    'sort-heritage-clauses': sortHeritageClausesRule,
    'sort-keys': sortKeysRule,
    'prefer-const': preferConstRule,
    'no-unused-vars': noUnusedVarsRule,
    'import-dedupe': importDedupeRule,
    'no-import-dist': noImportDistRule,
    'no-import-node-modules-by-path': noImportNodeModulesByPathRule,
    'top-level-function': topLevelFunctionRule,
  },
}
