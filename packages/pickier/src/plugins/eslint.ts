import type { PickierPlugin } from '../types'

// Import all eslint rules
import { eqeqeqRule } from '../rules/eslint/eqeqeq'
import { noAlertRule } from '../rules/eslint/no-alert'
import { noCondAssignRule } from '../rules/eslint/no-cond-assign'
import { noConstantConditionRule } from '../rules/eslint/no-constant-condition'
import { noConstAssignRule } from '../rules/eslint/no-const-assign'
import { noDupeKeysRule } from '../rules/eslint/no-dupe-keys'
import { noDuplicateCaseRule } from '../rules/eslint/no-duplicate-case'
import { noElseReturnRule } from '../rules/eslint/no-else-return'
import { noEmptyRule } from '../rules/eslint/no-empty'
import { noEmptyFunctionRule } from '../rules/eslint/no-empty-function'
import { noEmptyPatternRule } from '../rules/eslint/no-empty-pattern'
import { noEvalRule } from '../rules/eslint/no-eval'
import { noExtendNativeRule } from '../rules/eslint/no-extend-native'
import { noExtraBooleanCastRule } from '../rules/eslint/no-extra-boolean-cast'
import { noFallthroughRule } from '../rules/eslint/no-fallthrough'
import { noImpliedEvalRule } from '../rules/eslint/no-implied-eval'
import { noIteratorRule } from '../rules/eslint/no-iterator'
import { noLonelyIfRule } from '../rules/eslint/no-lonely-if'
import { noNewRule } from '../rules/eslint/no-new'
import { noNewFuncRule } from '../rules/eslint/no-new-func'
import { noNewWrappersRule } from '../rules/eslint/no-new-wrappers'
import { noProtoRule } from '../rules/eslint/no-proto'
import { noRedeclareRule } from '../rules/eslint/no-redeclare'
import { noReturnAssignRule } from '../rules/eslint/no-return-assign'
import { noSelfAssignRule } from '../rules/eslint/no-self-assign'
import { noSelfCompareRule } from '../rules/eslint/no-self-compare'
import { noSequencesRule } from '../rules/eslint/no-sequences'
import { noSparseArraysRule } from '../rules/eslint/no-sparse-arrays'
import { noThrowLiteralRule } from '../rules/eslint/no-throw-literal'
import { noUndefRule } from '../rules/eslint/no-undef'
import { noUnreachableRule } from '../rules/eslint/no-unreachable'
import { noUselessCatchRule } from '../rules/eslint/no-useless-catch'
import { noUselessConcatRule } from '../rules/eslint/no-useless-concat'
import { noUselessEscapeRule } from '../rules/eslint/no-useless-escape'
import { noUselessRenameRule } from '../rules/eslint/no-useless-rename'
import { noUselessReturnRule } from '../rules/eslint/no-useless-return'
import { noVarRule } from '../rules/eslint/no-var'
import { noWithRule } from '../rules/eslint/no-with'
import { preferArrowCallbackRule } from '../rules/eslint/prefer-arrow-callback'
import { useIsNaNRule } from '../rules/eslint/use-isnan'
import { validTypeofRule } from '../rules/eslint/valid-typeof'

export const eslintPlugin: PickierPlugin = {
  name: 'eslint',
  rules: {
    // Possible Problems (Error Detection) - 17 rules
    'no-cond-assign': noCondAssignRule,
    'no-constant-condition': noConstantConditionRule,
    'no-const-assign': noConstAssignRule,
    'no-dupe-keys': noDupeKeysRule,
    'no-duplicate-case': noDuplicateCaseRule,
    'no-empty-pattern': noEmptyPatternRule,
    'no-fallthrough': noFallthroughRule,
    'no-redeclare': noRedeclareRule,
    'no-self-assign': noSelfAssignRule,
    'no-self-compare': noSelfCompareRule,
    'no-sparse-arrays': noSparseArraysRule,
    'no-undef': noUndefRule,
    'no-unreachable': noUnreachableRule,
    'no-useless-catch': noUselessCatchRule,
    'use-isnan': useIsNaNRule,
    'valid-typeof': validTypeofRule,

    // Best Practices - 16 rules
    'eqeqeq': eqeqeqRule,
    'no-alert': noAlertRule,
    'no-else-return': noElseReturnRule,
    'no-empty': noEmptyRule,
    'no-empty-function': noEmptyFunctionRule,
    'no-eval': noEvalRule,
    'no-extend-native': noExtendNativeRule,
    'no-implied-eval': noImpliedEvalRule,
    'no-iterator': noIteratorRule,
    'no-new': noNewRule,
    'no-new-func': noNewFuncRule,
    'no-new-wrappers': noNewWrappersRule,
    'no-proto': noProtoRule,
    'no-return-assign': noReturnAssignRule,
    'no-throw-literal': noThrowLiteralRule,
    'no-with': noWithRule,

    // Code Quality - 9 rules
    'no-extra-boolean-cast': noExtraBooleanCastRule,
    'no-lonely-if': noLonelyIfRule,
    'no-sequences': noSequencesRule,
    'no-useless-concat': noUselessConcatRule,
    'no-useless-escape': noUselessEscapeRule,
    'no-useless-rename': noUselessRenameRule,
    'no-useless-return': noUselessReturnRule,
    'no-var': noVarRule,
    'prefer-arrow-callback': preferArrowCallbackRule,
  },
}
