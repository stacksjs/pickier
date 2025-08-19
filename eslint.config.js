import eslintConfig from '@stacksjs/eslint-config'

export default eslintConfig({
  stylistic: {
    indent: 2,
    quotes: 'single',
  },

  typescript: true,
  jsonc: true,
  yaml: true,

  ignores: [
    '**/test/fixtures/**',
    '**/test/output/**',
    'docs/**',
    'packages/vscode/docs/USAGE.md',
    'packages/vscode/examples/README.md',
  ],
}, [
  // Allow console statements in VS Code extension for debugging
  {
    files: ['packages/vscode/**/*.ts'],
    rules: {
      'no-console': 'off',
      'unused-imports/no-unused-vars': 'off',
      'ts/ban-ts-comment': 'off',
    },
  },
])
