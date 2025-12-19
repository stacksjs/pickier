#!/usr/bin/env bun

import type { RunOptions } from '../src/index.ts'
import process from 'node:process'
import { CLI } from '@stacksjs/clapp'
import { version } from '../package.json'
import { run } from '../src/index.ts'

const cli = new CLI('pickier')

cli
  .command('run [...globs]', 'Run Pickier in unified mode (auto, lint, or format)')
  .option('--mode <mode>', 'auto|lint|format', { default: 'auto' })
  .option('--fix', 'Auto-fix problems (lint mode)')
  .option('--dry-run', 'Simulate fixes without writing (lint mode)')
  .option('--max-warnings <n>', 'Max warnings before non-zero exit (lint mode)', { default: -1 })
  .option('--reporter <name>', 'stylish|json|compact (lint mode)', { default: 'stylish' })
  .option('--write', 'Write changes to files (format mode)')
  .option('--check', 'Check without writing (format mode)')
  .option('--config <path>', 'Path to pickier config')
  .option('--ignore-path <file>', 'Ignore file (like .gitignore)')
  .option('--ext <exts>', 'Comma-separated extensions (uses config if not specified)')
  .option('--cache', 'Enable cache (lint mode)')
  .option('--verbose', 'Verbose output')
  .example('pickier run . --mode auto')
  .example('pickier run src --mode lint --fix')
  .example('pickier run "**/*.{ts,tsx,js}" --mode format --write')
  .action(async (globs: string[], opts: RunOptions) => {
    const code = await run(globs, opts)
    process.exit(code)
  })

cli
  .command('lint [...globs]', 'Lint files')
  .option('--fix', 'Auto-fix problems')
  .option('--dry-run', 'Simulate fixes without writing')
  .option('--max-warnings <n>', 'Max warnings before non-zero exit', { default: -1 })
  .option('--reporter <name>', 'stylish|json|compact', { default: 'stylish' })
  .option('--config <path>', 'Path to pickier config')
  .option('--ignore-path <file>', 'Ignore file (like .gitignore)')
  .option('--ext <exts>', 'Comma-separated extensions (uses config if not specified)')
  .option('--cache', 'Enable cache')
  .option('--verbose', 'Verbose output')
  .example('pickier lint . --dry-run')
  .example('pickier lint src --fix')
  .example('pickier lint "src/**/*.{ts,tsx}" --reporter json')
  .action(async (globs: string[], opts: RunOptions) => {
    console.warn('[DEPRECATION] `pickier lint` is now unified under `pickier run --mode lint` and will be removed in a future release.')
    const code = await run(globs, { ...opts, mode: 'lint' })
    process.exit(code)
  })

cli
  .command('format [...globs]', 'Format files')
  .option('--write', 'Write changes to files')
  .option('--check', 'Check without writing')
  .option('--config <path>', 'Path to pickier config')
  .option('--ignore-path <file>', 'Ignore file')
  .option('--ext <exts>', 'Comma-separated extensions (uses config if not specified)')
  .option('--verbose', 'Verbose output')
  .example('pickier format . --check')
  .example('pickier format src --write')
  .example('pickier format "**/*.{ts,tsx,js}" --write')
  .action(async (globs: string[], opts: RunOptions) => {
    console.warn('[DEPRECATION] `pickier format` is now unified under `pickier run --mode format` and will be removed in a future release.')
    const code = await run(globs, { ...opts, mode: 'format' })
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
