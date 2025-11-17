import type { PickierPlugin } from '../types'
// Import rules
import { firstRule } from '../rules/imports/first'
import { importDedupeRule } from '../rules/imports/import-dedupe'
import { noDuplicateImportsRule } from '../rules/imports/no-duplicate-imports'
import { namedRule } from '../rules/imports/named'
import { noCycleRule } from '../rules/imports/no-cycle'
import { noImportDistRule } from '../rules/imports/no-import-dist'
import { noImportNodeModulesByPathRule } from '../rules/imports/no-import-node-modules-by-path'
import { noUnresolvedRule } from '../rules/imports/no-unresolved'
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
    // Sort rules
    'sort-exports': sortExportsRule,
    'sort-objects': sortObjectsRule,
    'sort-imports': sortImportsRule,
    'sort-named-imports': sortNamedImportsRule,
    'sort-heritage-clauses': sortHeritageClausesRule,
    'sort-keys': sortKeysRule,

    // Import rules
    'import-dedupe': importDedupeRule,
    'import-first': firstRule,
    'import-named': namedRule,
    'import-no-cycle': noCycleRule,
    'import-no-unresolved': noUnresolvedRule,
    'no-import-dist': noImportDistRule,
    'no-import-node-modules-by-path': noImportNodeModulesByPathRule,
    'no-duplicate-imports': noDuplicateImportsRule,

    // Style rules
    'top-level-function': topLevelFunctionRule,
  },
}
