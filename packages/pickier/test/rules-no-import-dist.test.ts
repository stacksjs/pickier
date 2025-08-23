/* eslint-disable no-console */
import type { LintOptions } from '../src/types'
import { afterEach, expect, it } from 'bun:test'
import { existsSync, unlinkSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { runLint } from '../src/linter'

const tempFiles: string[] = []
function create(c: string) { const p = resolve(__dirname, `tmp-no-import-dist-${Date.now()}-${Math.random().toString(36).slice(2)}.ts`); writeFileSync(p, c); tempFiles.push(p); return p }
function cleanup() {
  for (const f of tempFiles) {
    if (existsSync(f))
      unlinkSync(f)
  } tempFiles.length = 0
}
afterEach(cleanup)

it('flags dist relative imports', async () => {
  const file = create('import { a } from \'./dist/util\'\n')
  const options: LintOptions = { reporter: 'json' }
  const orig = console.log; let out = ''; console.log = (m: string) => { out += m }
  try { await runLint([file], options) }
  finally { console.log = orig }
  const res = JSON.parse(out)
  expect(res.issues.some((i: any) => i.ruleId === 'pickier/no-import-dist')).toBe(true)
})

it('passes for non-dist imports', async () => {
  const file = create('import { a } from \'./src/util\'\n')
  const options: LintOptions = { reporter: 'json' }
  const orig = console.log; let out = ''; console.log = (m: string) => { out += m }
  try { await runLint([file], options) }
  finally { console.log = orig }
  const res = JSON.parse(out)
  expect(res.issues.filter((i: any) => i.ruleId === 'pickier/no-import-dist')).toHaveLength(0)
})
