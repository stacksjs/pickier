import type { RuleModule } from '../../types'

export const noUndefRule: RuleModule = {
  meta: {
    docs: 'Disallow undeclared variables',
    recommended: true,
    wip: true, // Complex - needs proper scope tracking
  },
  check: (_text, _ctx) => {
    // This is a complex rule that requires proper scope tracking and AST parsing
    // For now, marking as WIP to be implemented properly later
    return []
  },
}
