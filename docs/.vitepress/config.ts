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
      ['meta', { property: 'og:url', content: 'https://github.com/stacksjs/pickier' }],
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
          link: 'https://github.com/stacksjs/pickier/blob/main/CHANGELOG.md',
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
            ],
          },
          {
            text: 'Advanced',
            collapsed: false,
            items: [
              { text: 'Configuration Deep Dive', link: '/advanced/configuration-deep-dive' },
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
              { text: 'pickier', link: '/rules/pickier' },
              { text: 'style', link: '/rules/style' },
              { text: 'regexp', link: '/rules/regexp' },
              { text: 'markdown', link: '/rules/markdown' },
              { text: 'noDebugger', link: '/rules/no-debugger' },
              { text: 'noConsole', link: '/rules/no-console' },
              { text: 'noCondAssign', link: '/rules/no-cond-assign' },
              { text: 'noTemplateCurlyInString', link: '/rules/no-template-curly-in-string' },
              { text: 'regexp/noUnusedCapturingGroup', link: '/rules/regexp-no-unused-capturing-group' },
              { text: 'sort-objects', link: '/rules/sort-objects' },
              { text: 'sort-imports', link: '/rules/sort-imports' },
              { text: 'sort-named-imports', link: '/rules/sort-named-imports' },
              { text: 'sort-heritage-clauses', link: '/rules/sort-heritage-clauses' },
              { text: 'sort-keys', link: '/rules/sort-keys' },
              { text: 'sort-exports', link: '/rules/sort-exports' },
              { text: 'max-statements-per-line', link: '/rules/style-max-statements-per-line' },
              { text: 'no-unused-vars', link: '/rules/no-unused-vars' },
              { text: 'prefer-const', link: '/rules/prefer-const' },
              { text: 'no-super-linear-backtracking', link: '/rules/regexp-no-super-linear-backtracking' },
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
        pattern: 'https://github.com/stacksjs/pickier/edit/main/docs/:path',
        text: 'Edit this page on GitHub',
      },

      footer: {
        message: 'Released under the MIT License.',
        copyright: 'Copyright © 2025-present Stacks.js, Inc.',
      },

      socialLinks: [
        { icon: 'twitter', link: 'https://twitter.com/stacksjs' },
        { icon: 'bluesky', link: 'https://bsky.app/profile/chris-breuer.me' },
        { icon: 'github', link: 'https://github.com/stacksjs/pickier' },
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
