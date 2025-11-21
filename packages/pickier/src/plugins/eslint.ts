import type { PickierPlugin } from '../types'

// Import Possible Problems rules (from general/)
import { arrayCallbackReturnRule } from '../rules/general/array-callback-return'
import { constructorSuperRule } from '../rules/general/constructor-super'
import { forDirectionRule } from '../rules/general/for-direction'
import { getterReturnRule } from '../rules/general/getter-return'
import { noAsyncPromiseExecutorRule } from '../rules/general/no-async-promise-executor'
import { noCompareNegZeroRule } from '../rules/general/no-compare-neg-zero'
import { noCondAssignRule } from '../rules/general/no-cond-assign'
import { noConstAssignRule } from '../rules/general/no-const-assign'
import { noConstantConditionRule } from '../rules/general/no-constant-condition'
import { noDupeClassMembersRule } from '../rules/general/no-dupe-class-members'
import { noDupeKeysRule } from '../rules/general/no-dupe-keys'
import { noDuplicateCaseRule } from '../rules/general/no-duplicate-case'
import { noEmptyPatternRule } from '../rules/general/no-empty-pattern'
import { noFallthroughRule } from '../rules/general/no-fallthrough'
import { noLossOfPrecisionRule } from '../rules/general/no-loss-of-precision'
import { noPromiseExecutorReturnRule } from '../rules/general/no-promise-executor-return'
import { noRedeclareRule } from '../rules/general/no-redeclare'
import { noSelfAssignRule } from '../rules/general/no-self-assign'
import { noSelfCompareRule } from '../rules/general/no-self-compare'
import { noSparseArraysRule } from '../rules/general/no-sparse-arrays'
import { noUndefRule } from '../rules/general/no-undef'
import { noUnreachableRule } from '../rules/general/no-unreachable'
import { noUnsafeNegationRule } from '../rules/general/no-unsafe-negation'
import { noUselessCatchRule } from '../rules/general/no-useless-catch'
import { useIsNaNRule } from '../rules/general/use-isnan'
import { validTypeofRule } from '../rules/general/valid-typeof'

// Import Best Practices & Code Quality rules (from quality/)
import { complexityRule } from '../rules/quality/complexity'
import { defaultCaseRule } from '../rules/quality/default-case'
import { eqeqeqRule } from '../rules/quality/eqeqeq'
import { maxDepthRule } from '../rules/quality/max-depth'
import { maxLinesPerFunctionRule } from '../rules/quality/max-lines-per-function'
import { noAlertRule } from '../rules/quality/no-alert'
import { noAwaitInLoopRule } from '../rules/quality/no-await-in-loop'
import { noCallerRule } from '../rules/quality/no-caller'
import { noCaseDeclarationsRule } from '../rules/quality/no-case-declarations'
import { noElseReturnRule } from '../rules/quality/no-else-return'
import { noEmptyRule } from '../rules/quality/no-empty'
import { noEmptyFunctionRule } from '../rules/quality/no-empty-function'
import { noEvalRule } from '../rules/quality/no-eval'
import { noExtendNativeRule } from '../rules/quality/no-extend-native'
import { noExtraBooleanCastRule } from '../rules/quality/no-extra-boolean-cast'
import { noGlobalAssignRule } from '../rules/quality/no-global-assign'
import { noImpliedEvalRule } from '../rules/quality/no-implied-eval'
import { noIteratorRule } from '../rules/quality/no-iterator'
import { noLonelyIfRule } from '../rules/quality/no-lonely-if'
import { noNewRule } from '../rules/quality/no-new'
import { noNewFuncRule } from '../rules/quality/no-new-func'
import { noNewWrappersRule } from '../rules/quality/no-new-wrappers'
import { noOctalRule } from '../rules/quality/no-octal'
import { noParamReassignRule } from '../rules/quality/no-param-reassign'
import { noProtoRule } from '../rules/quality/no-proto'
import { noReturnAssignRule } from '../rules/quality/no-return-assign'
import { noSequencesRule } from '../rules/quality/no-sequences'
import { noShadowRule } from '../rules/quality/no-shadow'
import { noThrowLiteralRule } from '../rules/quality/no-throw-literal'
import { noUseBeforeDefineRule } from '../rules/quality/no-use-before-define'
import { noUselessCallRule } from '../rules/quality/no-useless-call'
import { noUselessConcatRule } from '../rules/quality/no-useless-concat'
import { noUselessEscapeRule } from '../rules/quality/no-useless-escape'
import { noUselessRenameRule } from '../rules/quality/no-useless-rename'
import { noUselessReturnRule } from '../rules/quality/no-useless-return'
import { noVarRule } from '../rules/quality/no-var'
import { noWithRule } from '../rules/quality/no-with'
import { preferArrowCallbackRule } from '../rules/quality/prefer-arrow-callback'
import { requireAwaitRule } from '../rules/quality/require-await'

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
