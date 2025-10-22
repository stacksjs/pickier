import type { PickierPlugin } from '../types'

// Import Best Practices rules
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

export const qualityPlugin: PickierPlugin = {
  name: 'quality',
  rules: {
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
