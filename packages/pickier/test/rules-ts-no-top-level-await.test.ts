/* eslint-disable no-console */
import type { LintOptions } from '../src/types'
import { afterEach, expect, it } from 'bun:test'
import { existsSync, unlinkSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { runLint } from '../src/linter'

const tempFiles: string[] = []
const create = (c: string, ext = '.ts') => { const p = resolve(__dirname, `tmp-no-tla-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`); writeFileSync(p, c); tempFiles.push(p); return p }
const cleanup = () => { for (const f of tempFiles) if (existsSync(f)) unlinkSync(f); tempFiles.length = 0 }
afterEach(cleanup)

it('flags top-level await usage', async () => {
  const file = create("await Promise.resolve(1)\n")
  const options: LintOptions = { reporter: 'json' }
  const orig = console.log; let out = ''; console.log = (m: string) => { out += m }
  try { await runLint([file], options) } finally { console.log = orig }
  const res = JSON.parse(out)
  expect(res.issues.some((i: any) => i.ruleId === 'ts/no-top-level-await')).toBe(true)
})

it('does not flag for-await-of in loop', async () => {
  const file = create("async function f(){ for await (const x of y) { console.log(x) } }\n")
  const options: LintOptions = { reporter: 'json' }
  const orig = console.log; let out = ''; console.log = (m: string) => { out += m }
  try { await runLint([file], options) } finally { console.log = orig }
  const res = JSON.parse(out)
  expect(res.issues.filter((i: any) => i.ruleId === 'ts/no-top-level-await')).toHaveLength(0)
})
