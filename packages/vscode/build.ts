console.log('Building...')

await Bun.build({
  entrypoints: ['src/extension.ts'],
  outdir: './dist',
  splitting: false,
  external: ['vscode'],
  target: 'node',
  format: 'esm',
})

console.log('Built successfully!')

export {}
