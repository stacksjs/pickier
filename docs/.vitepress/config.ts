import type { HeadConfig } from 'vitepress'
// import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import { withPwa } from '@vite-pwa/vitepress'
import { defineConfig } from 'vitepress'
import viteConfig from './vite.config'

// https://vitepress.dev/reference/site-config

const analyticsHead: HeadConfig[] = [
  [
    'script',
    {
      'src': 'https://cdn.usefathom.com/script.js',
      'data-site': 'CEZRDIRB',
      'defer': '',
    },
  ],
]

const description = 'Format, lint, and more in a fraction of seconds.'
const title = 'Pickier | Fast formatter and linter'

export default withPwa(
  defineConfig({
    lang: 'en-US',
    title: 'Pickier',
    description,
    metaChunk: true,
    cleanUrls: true,
    lastUpdated: true,

    head: [
      ['link', { rel: 'icon', type: 'image/svg+xml', href: '/images/logo-mini.svg' }],
      ['link', { rel: 'icon', type: 'image/png', href: '/images/logo.png' }],
      ['meta', { name: 'theme-color', content: '#0A0ABC' }],
      ['meta', { name: 'title', content: title }],
      ['meta', { name: 'description', content: description }],
      ['meta', { name: 'author', content: 'Stacks.js, Inc.' }],
      ['meta', {
        name: 'tags',
        content: 'pickier, linter, formatter, bun, fast',
      }],

      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:locale', content: 'en' }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: description }],

      ['meta', { property: 'og:site_name', content: 'Pickier' }],
      ['meta', { property: 'og:image', content: '/images/og-image.png' }],
      ['meta', { property: 'og:url', content: 'https://github.com/pickier/pickier' }],
      // ['script', { 'src': 'https://cdn.usefathom.com/script.js', 'data-site': '', 'data-spa': 'auto', 'defer': '' }],
      ...analyticsHead,
    ],

    themeConfig: {
      search: {
        provider: 'local',
      },
      logo: {
        light: '/images/logo-transparent.svg',
        dark: '/images/logo-white-transparent.svg',
      },

      nav: [
        {
          text: 'Changelog',
          link: 'https://github.com/pickier/pickier/blob/main/CHANGELOG.md',
        },
        {
          text: 'Resources',
          items: [
            { text: 'Team', link: '/team' },
            { text: 'Sponsors', link: '/sponsors' },
            { text: 'Partners', link: '/partners' },
            { text: 'Postcardware', link: '/postcardware' },
            { text: 'Stargazers', link: '/stargazers' },
            { text: 'License', link: '/license' },
          ],
        },
        {
          text: 'API',
          link: '/api',
        },
      ],
      sidebar: {
        '/': [
          {
            text: 'Get Started',
            collapsed: false,
            items: [
              { text: 'Introduction', link: '/intro' },
              { text: 'Installation', link: '/install' },
              { text: 'Usage', link: '/usage' },
              { text: 'CLI', link: '/cli' },
              { text: 'Configuration', link: '/config' },
            ],
          },
          {
            text: 'Features',
            collapsed: false,
            items: [
              { text: 'Formatting', link: '/features/formatting' },
              { text: 'Import Management', link: '/features/imports' },
              { text: 'JSON & Config Sorting', link: '/features/json-and-config-sorting' },
              { text: 'Linting Basics', link: '/features/linting-basics' },
              { text: 'Performance', link: '/features/performance' },
              { text: 'Benchmarks', link: '/features/benchmarks' },
            ],
          },
          {
            text: 'Advanced',
            collapsed: false,
            items: [
              { text: 'Configuration Deep Dive', link: '/advanced/configuration-deep-dive' },
              { text: 'Disable Comments', link: '/advanced/disable-comments' },
              { text: 'Globbing & Ignores', link: '/advanced/globbing-and-ignores' },
              { text: 'Plugin System', link: '/advanced/plugin-system' },
              { text: 'CI Usage', link: '/advanced/ci' },
            ],
          },
          {
            text: 'Rules',
            collapsed: true,
            items: [
              { text: 'Overview', link: '/rules/overview' },
              {
                text: 'Core',
                collapsed: true,
                items: [
                  { text: 'noDebugger', link: '/rules/no-debugger' },
                  { text: 'noConsole', link: '/rules/no-console' },
                  { text: 'noCondAssign', link: '/rules/no-cond-assign' },
                  { text: 'noTemplateCurlyInString', link: '/rules/no-template-curly-in-string' },
                  { text: 'no-unused-vars', link: '/rules/no-unused-vars' },
                  { text: 'prefer-const', link: '/rules/prefer-const' },
                ],
              },
              {
                text: 'pickier',
                collapsed: true,
                link: '/rules/pickier',
                items: [
                  { text: 'sort-objects', link: '/rules/sort-objects' },
                  { text: 'sort-imports', link: '/rules/sort-imports' },
                  { text: 'sort-named-imports', link: '/rules/sort-named-imports' },
                  { text: 'sort-heritage-clauses', link: '/rules/sort-heritage-clauses' },
                  { text: 'sort-keys', link: '/rules/sort-keys' },
                  { text: 'sort-exports', link: '/rules/sort-exports' },
                  { text: 'sort-classes', link: '/rules/sort-classes' },
                  { text: 'sort-enums', link: '/rules/sort-enums' },
                  { text: 'sort-interfaces', link: '/rules/sort-interfaces' },
                  { text: 'sort-maps', link: '/rules/sort-maps' },
                  { text: 'sort-object-types', link: '/rules/sort-object-types' },
                  { text: 'sort-array-includes', link: '/rules/sort-array-includes' },
                  { text: 'sort-switch-case', link: '/rules/sort-switch-case' },
                ],
              },
              {
                text: 'style (50 rules)',
                collapsed: true,
                link: '/rules/style',
                items: [
                  { text: 'keyword-spacing', link: '/rules/style-keyword-spacing' },
                  { text: 'arrow-spacing', link: '/rules/style-arrow-spacing' },
                  { text: 'space-infix-ops', link: '/rules/style-space-infix-ops' },
                  { text: 'object-curly-spacing', link: '/rules/style-object-curly-spacing' },
                  { text: 'block-spacing', link: '/rules/style-block-spacing' },
                  { text: 'space-before-blocks', link: '/rules/style-space-before-blocks' },
                  { text: 'comma-spacing', link: '/rules/style-comma-spacing' },
                  { text: 'semi-spacing', link: '/rules/style-semi-spacing' },
                  { text: 'rest-spread-spacing', link: '/rules/style-rest-spread-spacing' },
                  { text: 'key-spacing', link: '/rules/style-key-spacing' },
                  { text: 'computed-property-spacing', link: '/rules/style-computed-property-spacing' },
                  { text: 'array-bracket-spacing', link: '/rules/style-array-bracket-spacing' },
                  { text: 'space-in-parens', link: '/rules/style-space-in-parens' },
                  { text: 'template-curly-spacing', link: '/rules/style-template-curly-spacing' },
                  { text: 'space-unary-ops', link: '/rules/style-space-unary-ops' },
                  { text: 'switch-colon-spacing', link: '/rules/style-switch-colon-spacing' },
                  { text: 'generator-star-spacing', link: '/rules/style-generator-star-spacing' },
                  { text: 'yield-star-spacing', link: '/rules/style-yield-star-spacing' },
                  { text: 'function-call-spacing', link: '/rules/style-function-call-spacing' },
                  { text: 'template-tag-spacing', link: '/rules/style-template-tag-spacing' },
                  { text: 'no-whitespace-before-property', link: '/rules/style-no-whitespace-before-property' },
                  { text: 'spaced-comment', link: '/rules/style-spaced-comment' },
                  { text: 'comma-dangle', link: '/rules/style-comma-dangle' },
                  { text: 'arrow-parens', link: '/rules/style-arrow-parens' },
                  { text: 'space-before-function-paren', link: '/rules/style-space-before-function-paren' },
                  { text: 'quote-props', link: '/rules/style-quote-props' },
                  { text: 'no-floating-decimal', link: '/rules/style-no-floating-decimal' },
                  { text: 'new-parens', link: '/rules/style-new-parens' },
                  { text: 'no-extra-parens', link: '/rules/style-no-extra-parens' },
                  { text: 'wrap-iife', link: '/rules/style-wrap-iife' },
                  { text: 'comma-style', link: '/rules/style-comma-style' },
                  { text: 'dot-location', link: '/rules/style-dot-location' },
                  { text: 'operator-linebreak', link: '/rules/style-operator-linebreak' },
                  { text: 'multiline-ternary', link: '/rules/style-multiline-ternary' },
                  { text: 'padded-blocks', link: '/rules/style-padded-blocks' },
                  { text: 'lines-between-class-members', link: '/rules/style-lines-between-class-members' },
                  { text: 'brace-style', link: '/rules/style-brace-style' },
                  { text: 'curly', link: '/rules/style-curly' },
                  { text: 'max-statements-per-line', link: '/rules/style-max-statements-per-line' },
                  { text: 'if-newline', link: '/rules/style-if-newline' },
                  { text: 'consistent-chaining', link: '/rules/style-consistent-chaining' },
                  { text: 'consistent-list-newline', link: '/rules/style-consistent-list-newline' },
                  { text: 'indent-unindent', link: '/rules/style-indent-unindent' },
                  { text: 'no-mixed-operators', link: '/rules/style-no-mixed-operators' },
                  { text: 'indent-binary-ops', link: '/rules/style-indent-binary-ops' },
                  { text: 'no-multi-spaces', link: '/rules/style-no-multi-spaces' },
                  { text: 'no-multiple-empty-lines', link: '/rules/style-no-multiple-empty-lines' },
                  { text: 'no-trailing-spaces', link: '/rules/style-no-trailing-spaces' },
                  { text: 'no-tabs', link: '/rules/style-no-tabs' },
                  { text: 'no-mixed-spaces-and-tabs', link: '/rules/style-no-mixed-spaces-and-tabs' },
                ],
              },
              {
                text: 'ts (13 rules)',
                collapsed: true,
                link: '/rules/ts',
                items: [
                  { text: 'no-require-imports', link: '/rules/ts-no-require-imports' },
                  { text: 'no-top-level-await', link: '/rules/ts-no-top-level-await' },
                  { text: 'no-ts-export-equal', link: '/rules/ts-no-ts-export-equal' },
                  { text: 'no-explicit-any', link: '/rules/ts-no-explicit-any' },
                  { text: 'no-floating-promises', link: '/rules/ts-no-floating-promises' },
                  { text: 'no-misused-promises', link: '/rules/ts-no-misused-promises' },
                  { text: 'no-unsafe-assignment', link: '/rules/ts-no-unsafe-assignment' },
                  { text: 'prefer-nullish-coalescing', link: '/rules/ts-prefer-nullish-coalescing' },
                  { text: 'prefer-optional-chain', link: '/rules/ts-prefer-optional-chain' },
                  { text: 'member-delimiter-style', link: '/rules/ts-member-delimiter-style' },
                  { text: 'type-annotation-spacing', link: '/rules/ts-type-annotation-spacing' },
                  { text: 'type-generic-spacing', link: '/rules/ts-type-generic-spacing' },
                  { text: 'type-named-tuple-spacing', link: '/rules/ts-type-named-tuple-spacing' },
                ],
              },
              {
                text: 'regexp',
                collapsed: true,
                link: '/rules/regexp',
                items: [
                  { text: 'no-super-linear-backtracking', link: '/rules/regexp-no-super-linear-backtracking' },
                  { text: 'no-unused-capturing-group', link: '/rules/regexp-no-unused-capturing-group' },
                ],
              },
              { text: 'markdown', link: '/rules/markdown' },
            ],
          },
          {
            text: 'API',
            collapsed: true,
            items: [
              { text: 'Overview', link: '/api/overview' },
              { text: 'Programmatic Usage', link: '/api/programmatic' },
              { text: 'Functions', link: '/api/functions' },
              { text: 'Types', link: '/api/types' },
              { text: 'Defaults', link: '/api/defaults' },
              { text: 'API Reference', link: '/api/reference' },
            ],
          },
        ],
      },

      editLink: {
        pattern: 'https://github.com/pickier/pickier/edit/main/docs/:path',
        text: 'Edit this page on GitHub',
      },

      footer: {
        message: 'Released under the MIT License.',
        copyright: 'Copyright © 2025-present Stacks.js, Inc.',
      },

      socialLinks: [
        { icon: 'twitter', link: 'https://twitter.com/stacksjs' },
        { icon: 'bluesky', link: 'https://bsky.app/profile/chris-breuer.me' },
        { icon: 'github', link: 'https://github.com/pickier/pickier' },
        { icon: 'discord', link: 'https://discord.gg/stacksjs' },
      ],

      // algolia: services.algolia,

      // carbonAds: {
      //   code: '',
      //   placement: '',
      // },
    },

    pwa: {
      manifest: {
        theme_color: '#0A0ABC',
      },
    },

    markdown: {
      theme: {
        light: 'github-light',
        dark: 'github-dark',
      },
      // Disabled due to type mismatches across shiki versions in deps
      // codeTransformers: [
      //   transformerTwoslash(),
      // ],
    },

    vite: viteConfig,
  }),
)
