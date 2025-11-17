import { existsSync, unlinkSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const tempFiles: string[] = []

export function createTempFile(content: string, suffix = '.md'): string {
  const tempPath = resolve(__dirname, `temp-md-${Date.now()}-${Math.random().toString(36).substring(7)}${suffix}`)
  writeFileSync(tempPath, content)
  tempFiles.push(tempPath)
  return tempPath
}

export function createConfigWithMarkdownRules(rules: Record<string, string | [string, any]>): string {
  const configPath = resolve(__dirname, `temp-config-${Date.now()}.json`)
  // Disable all markdown rules by default, then enable only the specified ones
  const allMarkdownRulesOff: Record<string, string> = {
    'markdown/heading-increment': 'off',
    'markdown/heading-style': 'off',
    'markdown/no-missing-space-atx': 'off',
    'markdown/no-multiple-space-atx': 'off',
    'markdown/no-missing-space-closed-atx': 'off',
    'markdown/no-multiple-space-closed-atx': 'off',
    'markdown/blanks-around-headings': 'off',
    'markdown/heading-start-left': 'off',
    'markdown/no-duplicate-heading': 'off',
    'markdown/single-title': 'off',
    'markdown/no-trailing-punctuation': 'off',
    'markdown/ul-style': 'off',
    'markdown/list-indent': 'off',
    'markdown/ul-indent': 'off',
    'markdown/ol-prefix': 'off',
    'markdown/list-marker-space': 'off',
    'markdown/blanks-around-lists': 'off',
    'markdown/no-trailing-spaces': 'off',
    'markdown/no-hard-tabs': 'off',
    'markdown/no-multiple-blanks': 'off',
    'markdown/no-multiple-space-blockquote': 'off',
    'markdown/no-blanks-blockquote': 'off',
    'markdown/blanks-around-fences': 'off',
    'markdown/single-trailing-newline': 'off',
    'markdown/blanks-around-tables': 'off',
    'markdown/no-reversed-links': 'off',
    'markdown/no-bare-urls': 'off',
    'markdown/no-space-in-links': 'off',
    'markdown/no-empty-links': 'off',
    'markdown/link-fragments': 'off',
    'markdown/reference-links-images': 'off',
    'markdown/link-image-reference-definitions': 'off',
    'markdown/link-image-style': 'off',
    'markdown/descriptive-link-text': 'off',
    'markdown/line-length': 'off',
    'markdown/commands-show-output': 'off',
    'markdown/fenced-code-language': 'off',
    'markdown/code-block-style': 'off',
    'markdown/code-fence-style': 'off',
    'markdown/no-emphasis-as-heading': 'off',
    'markdown/no-space-in-emphasis': 'off',
    'markdown/no-space-in-code': 'off',
    'markdown/emphasis-style': 'off',
    'markdown/strong-style': 'off',
    'markdown/no-inline-html': 'off',
    'markdown/hr-style': 'off',
    'markdown/first-line-heading': 'off',
    'markdown/required-headings': 'off',
    'markdown/proper-names': 'off',
    'markdown/no-alt-text': 'off',
    'markdown/table-pipe-style': 'off',
    'markdown/table-column-count': 'off',
    'markdown/table-column-style': 'off',
  }
  writeFileSync(configPath, JSON.stringify({
    lint: { extensions: ['md'], reporter: 'json', cache: false, maxWarnings: -1 },
    pluginRules: { ...allMarkdownRulesOff, ...rules },
  }))
  tempFiles.push(configPath)
  return configPath
}

export function cleanupTempFiles(): void {
  for (const file of tempFiles) {
    if (existsSync(file))
      unlinkSync(file)
  }
  tempFiles.length = 0
}
