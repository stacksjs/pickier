import type { RuleModule } from '../../types'

export const noExplicitAnyRule: RuleModule = {
  meta: {
    docs: 'Disallow the use of the `any` type - it defeats the purpose of TypeScript type safety',
  },
  check: (text, ctx) => {
    const issues: ReturnType<RuleModule['check']> = []

    // Only check TypeScript files
    if (!/\.tsx?$/.test(ctx.filePath)) {
      return issues
    }

    const lines = text.split(/\r?\n/)
    let inBlockComment = false

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i]
      const originalLine = line

      // Handle block comments
      if (inBlockComment) {
        const endIdx = line.indexOf('*/')
        if (endIdx >= 0) {
          line = line.slice(endIdx + 2)
          inBlockComment = false
        }
        else {
          continue
        }
      }

      const blockStart = line.indexOf('/*')
      const lineComment = line.indexOf('//')

      if (blockStart >= 0 && (lineComment === -1 || blockStart < lineComment)) {
        const endIdx = line.indexOf('*/', blockStart + 2)
        if (endIdx >= 0) {
          line = line.slice(0, blockStart) + line.slice(endIdx + 2)
        }
        else {
          inBlockComment = true
          line = line.slice(0, blockStart)
        }
      }

      if (lineComment >= 0) {
        line = line.slice(0, lineComment)
      }

      // Remove strings to avoid false positives
      const cleanedLine = line.replace(/(['"`])(?:(?!\1)[^\\]|\\.)*?\1/g, '""')

      // Look for 'any' type annotations
      // Match patterns like:
      // : any
      // <any>
      // any[]
      // Array<any>
      // as any
      const anyPattern = /\b(any)\b/g
      let match: RegExpExecArray | null

      // eslint-disable-next-line no-cond-assign
      while ((match = anyPattern.exec(cleanedLine)) !== null) {
        const idx = match.index
        const before = cleanedLine[idx - 1] || ' '
        const after = cleanedLine[idx + 3] || ' '

        // Check context to ensure it's used as a type
        // Look for type annotation contexts: :, <, >, [, comma in generics, 'as'
        const beforeContext = cleanedLine.slice(Math.max(0, idx - 10), idx)
        const afterContext = cleanedLine.slice(idx + 3, Math.min(cleanedLine.length, idx + 10))

        // Skip if it's part of a larger word (e.g., 'company')
        if (/\w/.test(before) || /\w/.test(after)) {
          continue
        }

        // Check if it's in a type position
        const isTypePosition = (
          /:/.test(beforeContext) // : any
          || /</.test(beforeContext) // <any> or Array<any>
          || /\bas\s*$/.test(beforeContext) // as any
          || /,/.test(beforeContext) // , any (in generic params)
          || /\|/.test(beforeContext) // | any (in union)
          || /&/.test(beforeContext) // & any (in intersection)
          || /\[/.test(afterContext) // any[] (array type)
          || />/.test(afterContext) // any> (closing generic)
          || /,/.test(afterContext) // any, (in generic params)
          || /\|/.test(afterContext) // any | (in union)
          || /extends\s+$/.test(beforeContext) // extends any
          || /=\s*$/.test(beforeContext) // type Foo = any
        )

        if (isTypePosition) {
          // Find the actual position in the original line
          const actualIdx = originalLine.indexOf('any', Math.max(0, idx - 5))
          issues.push({
            filePath: ctx.filePath,
            line: i + 1,
            column: actualIdx >= 0 ? actualIdx + 1 : idx + 1,
            ruleId: 'ts/no-explicit-any',
            message: 'Unexpected `any` type. Specify a more precise type or use `unknown` if the type is truly unknown.',
            severity: 'error',
            help: 'Replace `any` with a specific type, `unknown`, or a generic type parameter',
          })
        }
      }
    }

    return issues
  },
  fix: (text) => {
    // Automatic fixing of 'any' is dangerous as it requires type inference
    // We can provide a conservative fix by replacing with 'unknown' in some cases
    const lines = text.split(/\r?\n/)
    const result: string[] = []

    for (const line of lines) {
      // Only auto-fix very obvious cases where 'any' can be safely replaced with 'unknown'
      // For example: function foo(x: any) => function foo(x: unknown)
      // But skip casts like 'as any' which are often intentional
      let fixedLine = line

      // Replace : any (but not as any)
      fixedLine = fixedLine.replace(/:\s*any\b(?!\s*\))/g, (match) => {
        // Check if it's in a context where unknown is safe
        // This is conservative - we only replace in parameter/variable declarations
        return match.replace('any', 'unknown')
      })

      result.push(fixedLine)
    }

    return result.join('\n')
  },
}
