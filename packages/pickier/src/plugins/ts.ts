import type { PickierPlugin } from '../types'
import { noRequireImportsRule } from '../rules/ts/no-require-imports'
import { noTopLevelAwaitRule } from '../rules/ts/no-top-level-await'
import { noTsExportEqualRule } from '../rules/ts/no-ts-export-equal'
import { noExplicitAnyRule } from '../rules/ts/no-explicit-any'
import { preferNullishCoalescingRule } from '../rules/ts/prefer-nullish-coalescing'
import { preferOptionalChainRule } from '../rules/ts/prefer-optional-chain'
import { noFloatingPromisesRule } from '../rules/ts/no-floating-promises'
import { noMisusedPromisesRule } from '../rules/ts/no-misused-promises'
import { noUnsafeAssignmentRule } from '../rules/ts/no-unsafe-assignment'

export const tsPlugin: PickierPlugin = {
  name: 'ts',
  rules: {
    'no-require-imports': noRequireImportsRule,
    'no-top-level-await': noTopLevelAwaitRule,
    'no-ts-export-equal': noTsExportEqualRule,
    'no-explicit-any': noExplicitAnyRule,
    'prefer-nullish-coalescing': preferNullishCoalescingRule,
    'prefer-optional-chain': preferOptionalChainRule,
    'no-floating-promises': noFloatingPromisesRule,
    'no-misused-promises': noMisusedPromisesRule,
    'no-unsafe-assignment': noUnsafeAssignmentRule,
  },
}
