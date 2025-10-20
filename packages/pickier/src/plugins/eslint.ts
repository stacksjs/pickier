import type { PickierPlugin } from '../types'

// Import all eslint rules
import { eqeqeqRule } from '../rules/eslint/eqeqeq'
import { noAlertRule } from '../rules/eslint/no-alert'
import { noConstAssignRule } from '../rules/eslint/no-const-assign'
import { noDuplicateCaseRule } from '../rules/eslint/no-duplicate-case'
import { noDupeKeysRule } from '../rules/eslint/no-dupe-keys'
import { noEmptyRule } from '../rules/eslint/no-empty'
import { noEmptyPatternRule } from '../rules/eslint/no-empty-pattern'
import { noEvalRule } from '../rules/eslint/no-eval'
import { noExtraBooleanCastRule } from '../rules/eslint/no-extra-boolean-cast'
import { noFallthroughRule } from '../rules/eslint/no-fallthrough'
import { noImpliedEvalRule } from '../rules/eslint/no-implied-eval'
import { noLonelyIfRule } from '../rules/eslint/no-lonely-if'
import { noNewFuncRule } from '../rules/eslint/no-new-func'
import { noNewWrappersRule } from '../rules/eslint/no-new-wrappers'
import { noProtoRule } from '../rules/eslint/no-proto'
import { noRedeclareRule } from '../rules/eslint/no-redeclare'
import { noSelfAssignRule } from '../rules/eslint/no-self-assign'
import { noSelfCompareRule } from '../rules/eslint/no-self-compare'
import { noSparseArraysRule } from '../rules/eslint/no-sparse-arrays'
import { noUndefRule } from '../rules/eslint/no-undef'
import { noUnreachableRule } from '../rules/eslint/no-unreachable'
import { noUselessEscapeRule } from '../rules/eslint/no-useless-escape'
import { noUselessReturnRule } from '../rules/eslint/no-useless-return'
import { noVarRule } from '../rules/eslint/no-var'
import { noWithRule } from '../rules/eslint/no-with'
import { useIsNaNRule } from '../rules/eslint/use-isnan'
import { validTypeofRule } from '../rules/eslint/valid-typeof'

export const eslintPlugin: PickierPlugin = {
  name: 'eslint',
  rules: {
    // Possible Problems (Error Detection)
    'no-dupe-keys': noDupeKeysRule,
    'no-duplicate-case': noDuplicateCaseRule,
    'no-self-assign': noSelfAssignRule,
    'no-self-compare': noSelfCompareRule,
    'no-sparse-arrays': noSparseArraysRule,
    'no-const-assign': noConstAssignRule,
    'no-unreachable': noUnreachableRule,
    'use-isnan': useIsNaNRule,
    'valid-typeof': validTypeofRule,
    'no-empty-pattern': noEmptyPatternRule,
    'no-fallthrough': noFallthroughRule,
    'no-undef': noUndefRule,
    'no-redeclare': noRedeclareRule,

    // Best Practices
    'eqeqeq': eqeqeqRule,
    'no-eval': noEvalRule,
    'no-implied-eval': noImpliedEvalRule,
    'no-new-func': noNewFuncRule,
    'no-alert': noAlertRule,
    'no-empty': noEmptyRule,
    'no-with': noWithRule,
    'no-proto': noProtoRule,
    'no-new-wrappers': noNewWrappersRule,

    // Code Quality
    'no-lonely-if': noLonelyIfRule,
    'no-useless-return': noUselessReturnRule,
    'no-useless-escape': noUselessEscapeRule,
    'no-extra-boolean-cast': noExtraBooleanCastRule,
    'no-var': noVarRule,
  },
}
