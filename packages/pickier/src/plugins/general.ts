import type { PickierPlugin } from '../types'

// Import general rules (error detection, possible problems)
import { arrayCallbackReturnRule } from '../rules/general/array-callback-return'
import { constructorSuperRule } from '../rules/general/constructor-super'
import { forDirectionRule } from '../rules/general/for-direction'
import { getterReturnRule } from '../rules/general/getter-return'
import { noAsyncPromiseExecutorRule } from '../rules/general/no-async-promise-executor'
import { noCompareNegZeroRule } from '../rules/general/no-compare-neg-zero'
import { noCondAssignRule } from '../rules/general/no-cond-assign'
import { noConstAssignRule } from '../rules/general/no-const-assign'
import { noConstantConditionRule } from '../rules/general/no-constant-condition'
import { noConstructorReturnRule } from '../rules/general/no-constructor-return'
import { noDupeClassMembersRule } from '../rules/general/no-dupe-class-members'
import { noDupeKeysRule } from '../rules/general/no-dupe-keys'
import { noDuplicateCaseRule } from '../rules/general/no-duplicate-case'
import { noEmptyPatternRule } from '../rules/general/no-empty-pattern'
import { noFallthroughRule } from '../rules/general/no-fallthrough'
import { noIrregularWhitespaceRule } from '../rules/general/no-irregular-whitespace'
import { noLossOfPrecisionRule } from '../rules/general/no-loss-of-precision'
import { noPromiseExecutorReturnRule } from '../rules/general/no-promise-executor-return'
import { noRedeclareRule } from '../rules/general/no-redeclare'
import { noSelfAssignRule } from '../rules/general/no-self-assign'
import { noSelfCompareRule } from '../rules/general/no-self-compare'
import { noSparseArraysRule } from '../rules/general/no-sparse-arrays'
import { noUndefRule } from '../rules/general/no-undef'
import { noUnusedVarsRule } from '../rules/general/no-unused-vars'
import { noUnsafeNegationRule } from '../rules/general/no-unsafe-negation'
import { noUnreachableRule } from '../rules/general/no-unreachable'
import { noUselessCatchRule } from '../rules/general/no-useless-catch'
import { preferConstRule } from '../rules/general/prefer-const'
import { preferObjectSpreadRule } from '../rules/general/prefer-object-spread'
import { preferTemplate } from '../rules/general/prefer-template'
import { useIsNaNRule } from '../rules/general/use-isnan'
import { validTypeofRule } from '../rules/general/valid-typeof'

export const generalPlugin: PickierPlugin = {
  name: 'general',
  rules: {
    // Error Detection / Possible Problems
    'array-callback-return': arrayCallbackReturnRule,
    'constructor-super': constructorSuperRule,
    'for-direction': forDirectionRule,
    'getter-return': getterReturnRule,
    'no-async-promise-executor': noAsyncPromiseExecutorRule,
    'no-compare-neg-zero': noCompareNegZeroRule,
    'no-cond-assign': noCondAssignRule,
    'no-const-assign': noConstAssignRule,
    'no-constant-condition': noConstantConditionRule,
    'no-constructor-return': noConstructorReturnRule,
    'no-dupe-class-members': noDupeClassMembersRule,
    'no-dupe-keys': noDupeKeysRule,
    'no-duplicate-case': noDuplicateCaseRule,
    'no-empty-pattern': noEmptyPatternRule,
    'no-fallthrough': noFallthroughRule,
    'no-irregular-whitespace': noIrregularWhitespaceRule,
    'no-loss-of-precision': noLossOfPrecisionRule,
    'no-promise-executor-return': noPromiseExecutorReturnRule,
    'no-redeclare': noRedeclareRule,
    'no-self-assign': noSelfAssignRule,
    'no-self-compare': noSelfCompareRule,
    'no-sparse-arrays': noSparseArraysRule,
    'no-undef': noUndefRule,
    'no-unsafe-negation': noUnsafeNegationRule,
    'no-unreachable': noUnreachableRule,
    'no-unused-vars': noUnusedVarsRule,
    'no-useless-catch': noUselessCatchRule,
    'prefer-const': preferConstRule,
    'prefer-object-spread': preferObjectSpreadRule,
    'prefer-template': preferTemplate,
    'use-isnan': useIsNaNRule,
    'valid-typeof': validTypeofRule,
  },
}
