import type { PickierPlugin } from '../types'

// Import all eslint rules
import { arrayCallbackReturnRule } from '../rules/eslint/array-callback-return'
import { complexityRule } from '../rules/eslint/complexity'
import { constructorSuperRule } from '../rules/eslint/constructor-super'
import { defaultCaseRule } from '../rules/eslint/default-case'
import { eqeqeqRule } from '../rules/eslint/eqeqeq'
import { forDirectionRule } from '../rules/eslint/for-direction'
import { getterReturnRule } from '../rules/eslint/getter-return'
import { maxDepthRule } from '../rules/eslint/max-depth'
import { maxLinesPerFunctionRule } from '../rules/eslint/max-lines-per-function'
import { noAlertRule } from '../rules/eslint/no-alert'
import { noAsyncPromiseExecutorRule } from '../rules/eslint/no-async-promise-executor'
import { noAwaitInLoopRule } from '../rules/eslint/no-await-in-loop'
import { noCallerRule } from '../rules/eslint/no-caller'
import { noCaseDeclarationsRule } from '../rules/eslint/no-case-declarations'
import { noCompareNegZeroRule } from '../rules/eslint/no-compare-neg-zero'
import { noCondAssignRule } from '../rules/eslint/no-cond-assign'
import { noConstAssignRule } from '../rules/eslint/no-const-assign'
import { noConstantConditionRule } from '../rules/eslint/no-constant-condition'
import { noDupeClassMembersRule } from '../rules/eslint/no-dupe-class-members'
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
import { noGlobalAssignRule } from '../rules/eslint/no-global-assign'
import { noImpliedEvalRule } from '../rules/eslint/no-implied-eval'
import { noIteratorRule } from '../rules/eslint/no-iterator'
import { noLonelyIfRule } from '../rules/eslint/no-lonely-if'
import { noLossOfPrecisionRule } from '../rules/eslint/no-loss-of-precision'
import { noNewRule } from '../rules/eslint/no-new'
import { noNewFuncRule } from '../rules/eslint/no-new-func'
import { noNewWrappersRule } from '../rules/eslint/no-new-wrappers'
import { noOctalRule } from '../rules/eslint/no-octal'
import { noParamReassignRule } from '../rules/eslint/no-param-reassign'
import { noPromiseExecutorReturnRule } from '../rules/eslint/no-promise-executor-return'
import { noProtoRule } from '../rules/eslint/no-proto'
import { noRedeclareRule } from '../rules/eslint/no-redeclare'
import { noReturnAssignRule } from '../rules/eslint/no-return-assign'
import { noSelfAssignRule } from '../rules/eslint/no-self-assign'
import { noSelfCompareRule } from '../rules/eslint/no-self-compare'
import { noSequencesRule } from '../rules/eslint/no-sequences'
import { noShadowRule } from '../rules/eslint/no-shadow'
import { noSparseArraysRule } from '../rules/eslint/no-sparse-arrays'
import { noThrowLiteralRule } from '../rules/eslint/no-throw-literal'
import { noUndefRule } from '../rules/eslint/no-undef'
import { noUnsafeNegationRule } from '../rules/eslint/no-unsafe-negation'
import { noUnreachableRule } from '../rules/eslint/no-unreachable'
import { noUseBeforeDefineRule } from '../rules/eslint/no-use-before-define'
import { noUselessCallRule } from '../rules/eslint/no-useless-call'
import { noUselessCatchRule } from '../rules/eslint/no-useless-catch'
import { noUselessConcatRule } from '../rules/eslint/no-useless-concat'
import { noUselessEscapeRule } from '../rules/eslint/no-useless-escape'
import { noUselessRenameRule } from '../rules/eslint/no-useless-rename'
import { noUselessReturnRule } from '../rules/eslint/no-useless-return'
import { noVarRule } from '../rules/eslint/no-var'
import { noWithRule } from '../rules/eslint/no-with'
import { preferArrowCallbackRule } from '../rules/eslint/prefer-arrow-callback'
import { requireAwaitRule } from '../rules/eslint/require-await'
import { useIsNaNRule } from '../rules/eslint/use-isnan'
import { validTypeofRule } from '../rules/eslint/valid-typeof'

export const eslintPlugin: PickierPlugin = {
  name: 'eslint',
  rules: {
    // Possible Problems (Error Detection)
    'array-callback-return': arrayCallbackReturnRule,
    'constructor-super': constructorSuperRule,
    'for-direction': forDirectionRule,
    'getter-return': getterReturnRule,
    'no-async-promise-executor': noAsyncPromiseExecutorRule,
    'no-compare-neg-zero': noCompareNegZeroRule,
    'no-cond-assign': noCondAssignRule,
    'no-constant-condition': noConstantConditionRule,
    'no-const-assign': noConstAssignRule,
    'no-dupe-class-members': noDupeClassMembersRule,
    'no-dupe-keys': noDupeKeysRule,
    'no-duplicate-case': noDuplicateCaseRule,
    'no-empty-pattern': noEmptyPatternRule,
    'no-fallthrough': noFallthroughRule,
    'no-loss-of-precision': noLossOfPrecisionRule,
    'no-promise-executor-return': noPromiseExecutorReturnRule,
    'no-redeclare': noRedeclareRule,
    'no-self-assign': noSelfAssignRule,
    'no-self-compare': noSelfCompareRule,
    'no-sparse-arrays': noSparseArraysRule,
    'no-undef': noUndefRule,
    'no-unsafe-negation': noUnsafeNegationRule,
    'no-unreachable': noUnreachableRule,
    'no-useless-catch': noUselessCatchRule,
    'use-isnan': useIsNaNRule,
    'valid-typeof': validTypeofRule,

    // Best Practices
    'default-case': defaultCaseRule,
    'eqeqeq': eqeqeqRule,
    'no-alert': noAlertRule,
    'no-await-in-loop': noAwaitInLoopRule,
    'no-caller': noCallerRule,
    'no-case-declarations': noCaseDeclarationsRule,
    'no-else-return': noElseReturnRule,
    'no-empty': noEmptyRule,
    'no-empty-function': noEmptyFunctionRule,
    'no-eval': noEvalRule,
    'no-extend-native': noExtendNativeRule,
    'no-global-assign': noGlobalAssignRule,
    'no-implied-eval': noImpliedEvalRule,
    'no-iterator': noIteratorRule,
    'no-new': noNewRule,
    'no-new-func': noNewFuncRule,
    'no-new-wrappers': noNewWrappersRule,
    'no-octal': noOctalRule,
    'no-param-reassign': noParamReassignRule,
    'no-proto': noProtoRule,
    'no-return-assign': noReturnAssignRule,
    'no-shadow': noShadowRule,
    'no-throw-literal': noThrowLiteralRule,
    'no-use-before-define': noUseBeforeDefineRule,
    'no-useless-call': noUselessCallRule,
    'no-with': noWithRule,
    'require-await': requireAwaitRule,

    // Code Quality & Complexity
    'complexity': complexityRule,
    'max-depth': maxDepthRule,
    'max-lines-per-function': maxLinesPerFunctionRule,
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
