console.log('Building...')

await Bun.build({
  entrypoints: ['src/index.ts'],
  outdir: './dist',
  splitting: true,
  external: ['vscode'],
  target: 'node',
})

console.log('Built successfully!')
