import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { runLint } from './packages/pickier/src/linter'

async function main() {
  const content = `
if (condition) {
  functionWithLongName(
    argument1,
    argument2
  )
}
`
  const tempPath = resolve(__dirname, 'tmp-multiline-case.ts')
  writeFileSync(tempPath, content)
  await runLint([tempPath], { reporter: 'json' })
}
main().catch(e => { console.error(e); process.exit(1) })
