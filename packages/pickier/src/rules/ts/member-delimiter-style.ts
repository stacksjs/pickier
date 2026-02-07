import type { LintIssue, RuleContext, RuleModule } from '../../types'

// Match interface/type members that use commas instead of semicolons or vice versa
// Default: semicolons in interfaces, commas or semicolons in type literals

export const memberDelimiterStyleRule: RuleModule = {
  meta: {
    docs: 'Enforce consistent member delimiter style in interfaces and type literals',
    recommended: true,
  },
  check(content: string, context: RuleContext): LintIssue[] {
    const issues: LintIssue[] = []
    const lines = content.split(/\r?\n/)

    let inInterface = false
    let braceDepth = 0
    let interfaceDepth = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()

      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*'))
        continue

      // Track interface/type blocks
      if (trimmed.match(/\b(interface|type)\b.*\{/)) {
        inInterface = true
        interfaceDepth = braceDepth + 1
      }

      for (const ch of trimmed) {
        if (ch === '{')
          braceDepth++
        if (ch === '}')
          braceDepth--
      }

      if (inInterface && braceDepth < interfaceDepth) {
        inInterface = false
        continue
      }

      if (!inInterface || braceDepth !== interfaceDepth)
        continue

      // Skip closing brace
      if (trimmed === '}' || trimmed === '};' || trimmed === '},')
        continue

      // Check if line ends with comma (should be semicolon in interfaces)
      if (trimmed.endsWith(',')) {
        // Skip if it looks like a tuple type or union/intersection continuation
        if (trimmed.startsWith('|') || trimmed.startsWith('&'))
          continue

        issues.push({
          filePath: context.filePath,
          line: i + 1,
          column: line.length,
          ruleId: 'ts/member-delimiter-style',
          message: 'Expected semicolon delimiter in interface, found comma',
          severity: 'warning',
        })
      }

      // Check if member line is missing a delimiter entirely
      if (!trimmed.endsWith(';') && !trimmed.endsWith(',') && !trimmed.endsWith('{') && !trimmed.endsWith('(')) {
        // This might be a member without delimiter
        if (trimmed.match(/^\w+[\s?]*:/) || trimmed.match(/^\[/) || trimmed.match(/^readonly\b/)) {
          issues.push({
            filePath: context.filePath,
            line: i + 1,
            column: line.length + 1,
            ruleId: 'ts/member-delimiter-style',
            message: 'Missing semicolon delimiter in interface member',
            severity: 'warning',
          })
        }
      }
    }

    return issues
  },
  fix(content: string): string {
    const lines = content.split(/\r?\n/)
    const result: string[] = []

    let inInterface = false
    let braceDepth = 0
    let interfaceDepth = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()

      if (trimmed.match(/\b(interface|type)\b.*\{/)) {
        inInterface = true
        interfaceDepth = braceDepth + 1
      }

      const prevBraceDepth = braceDepth
      for (const ch of trimmed) {
        if (ch === '{')
          braceDepth++
        if (ch === '}')
          braceDepth--
      }

      if (inInterface && braceDepth < interfaceDepth) {
        inInterface = false
        result.push(line)
        continue
      }

      if (inInterface && prevBraceDepth === interfaceDepth && trimmed !== '}' && trimmed !== '};' && trimmed !== '},') {
        let fixed = line
        // Replace trailing comma with semicolon
        if (trimmed.endsWith(',')) {
          fixed = line.replace(/,\s*$/, ';')
        }
        result.push(fixed)
        continue
      }

      result.push(line)
    }

    return result.join('\n')
  },
}
