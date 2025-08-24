import type { FormatOptions, LintOptions } from './types'
import { runLint } from './linter'

export type RunOptions = (Partial<LintOptions> & Partial<FormatOptions>) & {
  mode?: 'auto' | 'lint' | 'format'
}

export async function runUnified(globs: string[], options: RunOptions): Promise<number> {
  const mode = options.mode || 'auto'
  if (mode === 'lint')
    return runLint(globs, options as LintOptions)
  if (mode === 'format') {
    // Unify: formatting is linting with fixes applied
    const lintOpts: LintOptions = {
      ...(options as any),
      fix: true,
      dryRun: !!options.check,
      // map format ext to lint ext if provided
      ext: options.ext,
      // suppress reporter differences by keeping defaults
    }
    return runLint(globs, lintOpts)
  }

  // auto mode: infer from flags
  if (options.fix != null || options.reporter != null || options.maxWarnings != null || options.dryRun != null)
    return runLint(globs, options as LintOptions)
  // default to format path via lint fixer to keep unification
  const lintOpts: LintOptions = {
    ...(options as any),
    fix: true,
    dryRun: !!options.check,
    ext: options.ext,
  }
  return runLint(globs, lintOpts)
}
