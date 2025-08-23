import type { PickierPlugin } from '../types'
import { curlyRule } from '../rules/style/curly'
import { maxStatementsPerLineRule } from '../rules/style/max-statements-per-line'
import { ifNewlineRule } from '../rules/style/if-newline'
import { consistentChainingRule } from '../rules/style/consistent-chaining'
import { consistentListNewlineRule } from '../rules/style/consistent-list-newline'
import { indentUnindentRule } from '../rules/style/indent-unindent'

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
