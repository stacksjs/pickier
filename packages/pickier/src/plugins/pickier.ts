import type { PickierPlugin } from '../types'
import { noUnusedVarsRule } from '../rules/general/no-unused-vars'
import { preferConstRule } from '../rules/general/prefer-const'
import { importDedupeRule } from '../rules/imports/import-dedupe'
import { noImportDistRule } from '../rules/imports/no-import-dist'
import { noImportNodeModulesByPathRule } from '../rules/imports/no-import-node-modules-by-path'
import { sortExportsRule } from '../rules/sort/exports'
import { sortHeritageClausesRule } from '../rules/sort/heritage-clauses'
import { sortImportsRule } from '../rules/sort/imports'
import { sortKeysRule } from '../rules/sort/keys'
import { sortNamedImportsRule } from '../rules/sort/named-imports'
import { sortObjectsRule } from '../rules/sort/objects'
import { topLevelFunctionRule } from '../rules/style/top-level-function'

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
