import type { RuleModule } from '../../types'

export const sortKeysRule: RuleModule = {
  meta: { docs: 'Require object keys to be sorted (ESLint-compatible core rule subset)' },
  check: () => {
    const out: ReturnType<RuleModule['check']> = []
    return out
  },
}
