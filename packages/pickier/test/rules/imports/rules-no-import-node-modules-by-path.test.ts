/* eslint-disable no-console */
import type { LintOptions } from '../../../src/types'
import { afterEach, expect, it } from 'bun:test'
import { existsSync, unlinkSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { runLint } from '../../../src/linter'

const tempFiles: string[] = []
function create(c: string) {
  const p = resolve(__dirname, `tmp-no-nm-path-${Date.now()}-${Math.random().toString(36).slice(2)}.ts`)
  writeFileSync(p, c)
  tempFiles.push(p)
  return p
}
function cleanup() {
  for (const f of tempFiles) {
    if (existsSync(f))
      unlinkSync(f)
  }
  tempFiles.length = 0
}
afterEach(cleanup)

it('flags import by node_modules path', async () => {
  const file = create('import x from \'/project/node_modules/pkg/index.js\'\n')
  const options: LintOptions = { reporter: 'json' }
  const orig = console.log
  let out = ''
  console.log = (m: string) => {
    out += m
  }
  try {
    await runLint([file], options)
  }
  finally {
    console.log = orig
  }
  const res = JSON.parse(out)
  expect(res.issues.some((i: any) => i.ruleId === 'pickier/no-import-node-modules-by-path')).toBe(true)
})

it('flags require by node_modules path', async () => {
  const file = create('const x = require(\'/project/node_modules/pkg/index.js\')\n')
  const options: LintOptions = { reporter: 'json' }
  const orig = console.log
  let out = ''
  console.log = (m: string) => {
    out += m
  }
  try {
    await runLint([file], options)
  }
  finally {
    console.log = orig
  }
  const res = JSON.parse(out)
  expect(res.issues.some((i: any) => i.ruleId === 'pickier/no-import-node-modules-by-path')).toBe(true)
})

it('passes for bare package imports', async () => {
  const file = create('import x from \'pkg\'\n')
  const options: LintOptions = { reporter: 'json' }
  const orig = console.log
  let out = ''
  console.log = (m: string) => {
    out += m
  }
  try {
    await runLint([file], options)
  }
  finally {
    console.log = orig
  }
  const res = JSON.parse(out)
  expect(res.issues.filter((i: any) => i.ruleId === 'pickier/no-import-node-modules-by-path')).toHaveLength(0)
})
