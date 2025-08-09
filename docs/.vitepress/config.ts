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
      'data-site': 'DCOEHMGA',
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
          items: [
            { text: 'Overview', link: '/api/overview' },
            { text: 'Programmatic Usage', link: '/api/programmatic' },
            { text: 'Functions', link: '/api/functions' },
            { text: 'Types', link: '/api/types' },
            { text: 'Defaults', link: '/api/defaults' },
          ],
        },
      ],
      sidebar: [
        {
          text: 'Get Started',
          items: [
            { text: 'Intro', link: '/intro' },
            { text: 'Install', link: '/install' },
            { text: 'Usage', link: '/usage' },
            { text: 'CLI', link: '/cli' },
            { text: 'Config', link: '/config' },
          ],
        },
        {
          text: 'API',
          items: [
            { text: 'Overview', link: '/api/overview' },
            { text: 'Programmatic Usage', link: '/api/programmatic' },
            { text: 'Functions', link: '/api/functions' },
            { text: 'Types', link: '/api/types' },
            { text: 'Defaults', link: '/api/defaults' },
          ],
        },
        { text: 'Showcase', link: '/showcase' },
      ],

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
        { icon: 'bluesky', link: 'https://bsky.app/profile/chrisbreuer.dev' },
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
