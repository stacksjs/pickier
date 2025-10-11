import { writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { runLint } from './src/linter'

async function main() {
  const file = join(tmpdir(), `curly-${Math.random().toString(36).slice(2)}.ts`)
  const content = `
if (!this.historyNav) {
  this.historyNav = new HistoryNavigator(hist, prefix)
}
else {
  this.historyNav.setHistory(hist)
  this.historyNav.setPrefix(prefix)
}
`
  writeFileSync(file, content, 'utf8')
  await runLint([file], { reporter: 'json' })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
