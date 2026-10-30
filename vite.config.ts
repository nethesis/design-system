import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import markdownPages, { CONTENT_PAGE } from './scripts/vite-plugin-markdown.mjs'
import glossaryWatch from './scripts/vite-plugin-glossary-watch.mjs'
import publishSources from './scripts/vite-plugin-sources.ts'

export default defineConfig({
  // relative base: the site is served from https://<org>.github.io/nebula-design-system/
  base: './',
  plugins: [
    // content/*.md become Vue components, see scripts/vite-plugin-markdown.mjs
    markdownPages(),
    // regenerates the glossary data when glossary.yaml is saved (dev server only)
    glossaryWatch(),
    vue({ include: [/\.vue$/, CONTENT_PAGE] }),
    // the content as plain files for coding agents: llms.txt and the files it lists
    publishSources(),
    tailwindcss()
  ],
  // a fixed port: review marks are saved per origin (src/composables/useReview.ts),
  // so the dev server fails rather than moving to another port
  server: { port: 5179, strictPort: true }
})
