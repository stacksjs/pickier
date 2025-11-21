import type { PickierPlugin } from '../types'
import { noUnusedVarsRule } from '../rules/general/no-unused-vars'

/**
 * unused-imports plugin - provides compatibility with unused-imports ESLint plugin
 * These rules are aliases to existing Pickier rules under different namespaces
 */
export const unusedImportsPlugin: PickierPlugin = {
  name: 'unused-imports',
  rules: {
    'no-unused-vars': noUnusedVarsRule, // alias for general/no-unused-vars
    'no-unused-imports': noUnusedVarsRule, // alias for general/no-unused-vars (same detection)
  },
}
