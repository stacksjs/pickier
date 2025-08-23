/* eslint-disable no-console */
import type { LintOptions } from '../src/types'
import { afterEach, expect, it } from 'bun:test'
import { existsSync, unlinkSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { runLint } from '../src/linter'

const tempFiles: string[] = []
const create = (c: string) => { const p = resolve(__dirname, `tmp-import-dedupe-${Date.now()}-${Math.random().toString(36).slice(2)}.ts`); writeFileSync(p, c); tempFiles.push(p); return p }
const cleanup = () => { for (const f of tempFiles) if (existsSync(f)) unlinkSync(f); tempFiles.length = 0 }
afterEach(cleanup)

it('flags duplicate named imports', async () => {
  const file = create("import { a, b, a } from 'x'\n")
  const options: LintOptions = { reporter: 'json' }
  const orig = console.log; let out = ''; console.log = (m: string) => { out += m }
  try { await runLint([file], options) } finally { console.log = orig }
  const res = JSON.parse(out)
  expect(res.issues.some((i: any) => i.ruleId === 'pickier/import-dedupe')).toBe(true)
})

it('passes with unique imports', async () => {
  const file = create("import { a, b } from 'x'\n")
  const options: LintOptions = { reporter: 'json' }
  const orig = console.log; let out = ''; console.log = (m: string) => { out += m }
  try { await runLint([file], options) } finally { console.log = orig }
  const res = JSON.parse(out)
  expect(res.issues.filter((i: any) => i.ruleId === 'pickier/import-dedupe')).toHaveLength(0)
})
