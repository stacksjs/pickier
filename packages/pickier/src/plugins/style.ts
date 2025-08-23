import type { PickierPlugin } from '../types'
import { consistentChainingRule } from '../rules/style/consistent-chaining'
import { consistentListNewlineRule } from '../rules/style/consistent-list-newline'
import { curlyRule } from '../rules/style/curly'
import { ifNewlineRule } from '../rules/style/if-newline'
import { indentUnindentRule } from '../rules/style/indent-unindent'
import { maxStatementsPerLineRule } from '../rules/style/max-statements-per-line'

export const stylePlugin: PickierPlugin = {
  name: 'style',
  rules: {
    'curly': curlyRule,
    'max-statements-per-line': maxStatementsPerLineRule,
    'if-newline': ifNewlineRule,
    'consistent-chaining': consistentChainingRule,
    'consistent-list-newline': consistentListNewlineRule,
    'indent-unindent': indentUnindentRule,
  },
}
