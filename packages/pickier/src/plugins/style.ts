import type { PickierPlugin } from '../types'
import { braceStyle } from '../rules/style/brace-style'
import { consistentChainingRule } from '../rules/style/consistent-chaining'
import { consistentListNewlineRule } from '../rules/style/consistent-list-newline'
import { curlyRule } from '../rules/style/curly'
import { ifNewlineRule } from '../rules/style/if-newline'
import { indentUnindentRule } from '../rules/style/indent-unindent'
import { maxStatementsPerLineRule } from '../rules/style/max-statements-per-line'
import { noMultiSpaces } from '../rules/style/no-multi-spaces'
import { noMultipleEmptyLines } from '../rules/style/no-multiple-empty-lines'
import { noTrailingSpaces } from '../rules/style/no-trailing-spaces'

export const stylePlugin: PickierPlugin = {
  name: 'style',
  rules: {
    'brace-style': braceStyle,
    'curly': curlyRule,
    'max-statements-per-line': maxStatementsPerLineRule,
    'if-newline': ifNewlineRule,
    'consistent-chaining': consistentChainingRule,
    'consistent-list-newline': consistentListNewlineRule,
    'indent-unindent': indentUnindentRule,
    'no-multi-spaces': noMultiSpaces,
    'no-multiple-empty-lines': noMultipleEmptyLines,
    'no-trailing-spaces': noTrailingSpaces,
  },
}
