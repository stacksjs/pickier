#!/usr/bin/env bun

import type { FormatOptions } from '../src/cli/run-format'
import type { LintOptions } from '../src/cli/run-lint'
import process from 'node:process'
import { CLI } from '@stacksjs/clapp'
import { version } from '../package.json'
import { runFormat } from '../src/cli/run-format'
import { runLint } from '../src/cli/run-lint'

const cli = new CLI('pickier')

cli
  .command('lint [...globs]', 'Lint files')
  .option('--fix', 'Auto-fix problems')
  .option('--dry-run', 'Simulate fixes without writing')
  .option('--max-warnings <n>', 'Max warnings before non-zero exit', { default: -1 })
  .option('--reporter <name>', 'stylish|json|compact', { default: 'stylish' })
  .option('--config <path>', 'Path to pickier config')
  .option('--ignore-path <file>', 'Ignore file (like .gitignore)')
  .option('--ext <exts>', 'Comma-separated extensions', { default: '.ts,.tsx,.js,.jsx' })
  .option('--cache', 'Enable cache')
  .option('--verbose', 'Verbose output')
  .example('pickier lint . --dry-run')
  .example('pickier lint src --fix')
  .example('pickier lint "src/**/*.{ts,tsx}" --reporter json')
  .action(async (globs: string[], opts: LintOptions) => {
    const code = await runLint(globs, opts)
    process.exit(code)
  })

cli
  .command('format [...globs]', 'Format files')
  .option('--write', 'Write changes to files')
  .option('--check', 'Check without writing')
  .option('--config <path>', 'Path to pickier config')
  .option('--ignore-path <file>', 'Ignore file')
  .option('--ext <exts>', 'Comma-separated extensions', { default: '.ts,.tsx,.js,.jsx' })
  .option('--verbose', 'Verbose output')
  .example('pickier format . --check')
  .example('pickier format src --write')
  .example('pickier format "**/*.{ts,tsx,js}" --write')
  .action(async (globs: string[], opts: FormatOptions) => {
    const code = await runFormat(globs, opts)
    process.exit(code)
  })

cli.command('version', 'Show the version of the CLI').action(() => {
  console.log(version)
})

// default help when no command is provided
cli.command('', 'Show help').action(() => {
  cli.help()
})

cli.version(version)
cli.help()
cli.parse()
