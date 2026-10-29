// Copyright (C) 2026 Nethesis S.r.l.
// SPDX-License-Identifier: GPL-3.0-or-later

// Vite plugin that turns the markdown pages in content/ into Vue components at
// build time.
//
// marked converts the markdown to HTML, which becomes the template of a Vue
// component compiled by @vitejs/plugin-vue: the page gets static elements,
// with no v-html and no markdown parser at runtime.
//
// The markdown is treated as untrusted text, not as code:
//   - raw HTML, images and unsafe links fail the build;
//   - the template is wrapped in v-pre, so {{ }} and directives written in
//     the text are never evaluated;
//   - Vue parses the template again and decodes HTML entities, so the final
//     check runs on Vue's own syntax tree: only the elements and attributes
//     that plain markdown produces are accepted.
//
// Tables get the look of the other tables of the site (ds-table in a
// table-frame), and those whose header is "Do | Don't" also the do-dont class,
// styled with check and cross marks.
//
// Imported with ?search (content/page.md?search), a page is instead a list of
// its sections in plain text, for the search of the site.

import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Marked, Renderer } from 'marked'
import { parse } from 'vue/compiler-sfc'
import { slug } from './slug.mjs'

export const CONTENT_DIR = fileURLToPath(new URL('../content/', import.meta.url))

// the markdown files directly inside content/
export const CONTENT_PAGE = new RegExp(
  `^${CONTENT_DIR.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^/]+\\.md$`
)

// web pages, anchors, paths and other pages of the site (?page=glossary)
const SAFE_HREF = /^(https?:\/\/|#|\.{0,2}\/|[a-z0-9-]+(\/|$)|\?page=[a-z0-9-]+(#[a-z0-9-]+)?$)/i

// elements that plain markdown produces, with the values allowed for each
// attribute
const ALLOWED = {
  h1: { id: /^[a-z0-9-]+$/ },
  h2: { id: /^[a-z0-9-]+$/ },
  h3: { id: /^[a-z0-9-]+$/ },
  h4: { id: /^[a-z0-9-]+$/ },
  p: {},
  ul: {},
  ol: { start: /^\d+$/ },
  li: {},
  blockquote: {},
  hr: {},
  br: {},
  strong: {},
  em: {},
  del: {},
  code: { class: /^language-[a-z0-9-]+$/ },
  pre: {},
  div: { class: /^table-frame$/ },
  table: { class: /^ds-table( do-dont)?$/ },
  thead: {},
  tbody: {},
  tr: {},
  th: { align: /^(left|center|right)$/ },
  td: { align: /^(left|center|right)$/ },
  a: { href: SAFE_HREF, title: /^/, target: /^_blank$/, rel: /^noopener noreferrer$/ }
}

// @vue/compiler-core NodeTypes
const ELEMENT = 1
const TEXT = 2
const ATTRIBUTE = 6

const escape = (text) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const plainText = (tokens = []) =>
  tokens.map((token) => (token.tokens ? plainText(token.tokens) : token.text)).join('')

export function renderMarkdown(markdown, filename = 'page.md') {
  const errors = []
  const ids = new Set()

  const marked = new Marked({
    async: false,
    walkTokens(token) {
      if (token.type === 'html') {
        errors.push(`raw HTML is not allowed: ${token.raw.trim()}`)
      } else if (token.type === 'image') {
        errors.push(`images are not allowed: ${token.raw}`)
      } else if (token.type === 'link' && !SAFE_HREF.test(token.href)) {
        errors.push(`unsafe link: ${token.href}`)
      }
    },
    renderer: {
      table(token) {
        const html = Renderer.prototype.table.call(this, token)
        const header = token.header.map((cell) => plainText(cell.tokens))
        const classes = header.join('|') === "Do|Don't" ? 'ds-table do-dont' : 'ds-table'
        return `<div class="table-frame">${html.replace(/^<table>/, `<table class="${classes}">`)}</div>\n`
      },
      heading({ tokens, depth }) {
        const title = plainText(tokens)
        const id = slug(title)
        if (ids.has(id)) errors.push(`duplicate heading: ${title}`)
        ids.add(id)
        return `<h${depth} id="${id}">${this.parser.parseInline(tokens)}</h${depth}>\n`
      },
      link({ href, title, tokens }) {
        // links to other sites open in a new tab
        const external = /^https?:\/\//i.test(href)
          ? ' target="_blank" rel="noopener noreferrer"'
          : ''
        const titleAttribute = title ? ` title="${escape(title)}"` : ''
        return `<a href="${escape(href)}"${titleAttribute}${external}>${this.parser.parseInline(tokens)}</a>`
      }
    }
  })

  const html = marked.parse(markdown)
  const sfc = `<template>
<div v-pre>${html}</div>
</template>
`

  // check what Vue will compile
  const { descriptor, errors: parseErrors } = parse(sfc, { filename })
  errors.push(...parseErrors.map((error) => error.message))

  const root = descriptor.template?.ast?.children.filter((node) => node.type !== TEXT) ?? []
  if (root.length !== 1 || root[0].tag !== 'div') errors.push('unexpected template root')

  const check = (node) => {
    if (node.type === TEXT) return
    if (node.type !== ELEMENT || !Object.hasOwn(ALLOWED, node.tag)) {
      errors.push(`unexpected element: ${node.loc.source.slice(0, 80)}`)
      return
    }
    for (const prop of node.props) {
      const allowed = ALLOWED[node.tag][prop.name]
      if (prop.type !== ATTRIBUTE || !allowed || !allowed.test(prop.value?.content ?? '')) {
        errors.push(`unexpected attribute: ${prop.loc.source}`)
      }
    }
    node.children.forEach(check)
  }
  root[0]?.children.forEach(check)

  return { sfc, errors }
}

const sectionText = (token) => {
  if (token.type === 'list') return token.items.map((item) => blockText(item.tokens)).join(' ')
  if (token.type === 'table') {
    return [...token.header, ...token.rows.flat()].map((cell) => plainText(cell.tokens)).join(' ')
  }
  if (token.type === 'space' || token.type === 'hr') return ''
  return token.tokens ? plainText(token.tokens) : (token.text ?? '')
}
const blockText = (tokens) => tokens.map(sectionText).join(' ')

// The sections of a page, in plain text: the text before the first heading
// (with an empty id), then one section for each heading below the title.
// `parent` is the level 2 heading that contains a deeper one.
export function markdownSections(markdown) {
  const sections = [{ id: '', title: '', parent: '', text: [] }]
  let parent = ''
  for (const token of new Marked().lexer(markdown)) {
    if (token.type === 'heading' && token.depth > 1) {
      const title = plainText(token.tokens)
      if (token.depth === 2) parent = title
      sections.push({ id: slug(title), title, parent: token.depth === 2 ? '' : parent, text: [] })
    } else if (token.type !== 'heading') {
      sections.at(-1).text.push(sectionText(token))
    }
  }
  return sections.map((section) => ({
    ...section,
    text: section.text.join(' ').replace(/\s+/g, ' ').trim()
  }))
}

const SEARCH_PREFIX = '\0markdown-search:'

export default function markdownPages() {
  return {
    name: 'nethesis:markdown',
    enforce: 'pre',
    // page.md?search gets its own id, which the Vue plugin does not compile
    async resolveId(source, importer) {
      if (!source.endsWith('.md?search')) return
      const resolved = await this.resolve(source.slice(0, -'?search'.length), importer, {
        skipSelf: true
      })
      if (resolved && CONTENT_PAGE.test(resolved.id)) return `${SEARCH_PREFIX}${resolved.id}`
    },
    load(id) {
      if (!id.startsWith(SEARCH_PREFIX)) return
      const file = id.slice(SEARCH_PREFIX.length)
      this.addWatchFile(file)
      const sections = markdownSections(readFileSync(file, 'utf8'))
      return `export default ${JSON.stringify(sections).replace(/</g, '\\u003c')}`
    },
    transform(markdown, id) {
      if (!CONTENT_PAGE.test(id)) return
      const { sfc, errors } = renderMarkdown(markdown, id)
      if (errors.length) this.error(`content/${basename(id)}:\n${errors.join('\n')}`)
      return { code: sfc, map: null }
    }
  }
}
