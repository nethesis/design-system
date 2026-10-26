import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import markdownPages, { CONTENT_PAGE } from './scripts/vite-plugin-markdown.mjs'
import glossaryWatch from './scripts/vite-plugin-glossary-watch.mjs'

export default defineConfig({
  // relative base: the site is served from https://<org>.github.io/design-system/
  base: './',
  plugins: [
    // content/*.md become Vue components, see scripts/vite-plugin-markdown.mjs
    markdownPages(),
    // regenerates the glossary data when glossary.yaml is saved (dev server only)
    glossaryWatch(),
    vue({ include: [/\.vue$/, CONTENT_PAGE] }),
    tailwindcss()
  ],
  // a fixed port: review marks are saved per origin (src/composables/useReview.ts),
  // so the dev server fails rather than moving to another port
  server: { port: 5179, strictPort: true }
})
