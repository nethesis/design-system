// Copyright (C) 2026 Nethesis S.r.l.
// SPDX-License-Identifier: GPL-3.0-or-later

// Checks the files published for coding agents (vite-plugin-sources.ts):
// every file they list exists, the JSON files parse, and every link points
// to a page and an anchor that the site has.
//
// Run with: npm test

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { slug } from './slug.mjs'

// the published files read the data generated from glossary.yaml and icons.yaml
execFileSync(process.execPath, [new URL('./build-data.mjs', import.meta.url).pathname])

const { SOURCES, PAGE_FILES, SITE } = await import('./vite-plugin-sources.ts')
const { GROUPS, SEMANTIC, groupAnchor } = await import('../src/colors.ts')
const { tokenAnchor } = await import('../src/text.ts')

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const files = Object.fromEntries(Object.entries(SOURCES).map(([name, build]) => [name, build()]))
const data = Object.fromEntries(
  Object.entries(files)
    .filter(([name]) => name.endsWith('.json'))
    .map(([name, content]) => [name, JSON.parse(content)])
)
const headings = (path) =>
  [...read(path).matchAll(/^#{2,6} (.+)$/gm)].map(([, title]) => slug(title))

// The anchors of each page, and the expressions that render them in the
// views: if a view changes how it builds an id, the links break and this fails.
const ANCHORS = {
  introduction: { anchors: headings('content/introduction.md') },
  'writing-guidelines': { anchors: headings('content/writing-guidelines.md') },
  glossary: {
    view: 'GlossaryView',
    expressions: [':id="`term-${entry.id}`"'],
    anchors: data['glossary.json'].terms.map((term) => `term-${term.id}`)
  },
  iconography: {
    view: 'IconographyView',
    expressions: [':id="`icon-${entry.id}`"', 'id="icon-meanings"'],
    anchors: [...data['icons.json'].icons.map((entry) => `icon-${entry.id}`), 'icon-meanings']
  },
  colors: {
    view: 'ColorsView',
    expressions: [':id="groupAnchor(group.name)"', ':id="tokenAnchor(token.name)"'],
    anchors: [
      ...GROUPS.map((group) => groupAnchor(group.name)),
      ...SEMANTIC.map((token) => tokenAnchor(token.name))
    ]
  },
  typography: { anchors: [] },
  'spacing-and-border': { anchors: [] },
  'elevation-and-shadow': { anchors: [] }
}

test('every page has a published file and its anchors', () => {
  assert.deepEqual(Object.keys(PAGE_FILES).sort(), Object.keys(ANCHORS).sort())
})

for (const [id, { view, expressions = [] }] of Object.entries(ANCHORS)) {
  if (!view) continue
  test(`${view} renders the anchors of ${id}`, () => {
    const source = read(`src/components/${view}.vue`)
    for (const expression of expressions) assert.ok(source.includes(expression), expression)
  })
}

test('every text page has a page of the site', () => {
  const pages = read('src/pages.ts')
  const contents = readdirSync(new URL('../content/', import.meta.url)).filter((name) => name.endsWith('.md'))
  for (const name of contents) assert.ok(pages.includes(`id: '${name.slice(0, -3)}'`), name)
})

test('llms.txt lists only published files', () => {
  const links = [...files['llms.txt'].matchAll(/\]\(([^)]+)\)/g)].map(([, href]) => href)
  assert.ok(links.length > 0)
  for (const href of links.filter((href) => !href.startsWith('https://'))) {
    assert.ok(Object.hasOwn(SOURCES, href), href)
  }
  for (const name of Object.keys(SOURCES).filter((name) => name !== 'llms.txt')) {
    assert.ok(links.includes(name), `${name} is not in llms.txt`)
  }
})

for (const name of Object.keys(files).filter((name) => name.endsWith('.md'))) {
  test(`${name} links only published files and their anchors`, () => {
    assert.ok(!files[name].includes('](?page='), 'links to a page built in the browser')
    for (const [, target, anchor] of files[name].matchAll(/\]\(([a-z-]+\.(?:md|json))(?:#([^)]+))?\)/g)) {
      assert.ok(Object.hasOwn(SOURCES, target), target)
      if (!anchor) continue
      const pages = Object.keys(PAGE_FILES).filter((id) => PAGE_FILES[id] === target)
      assert.ok(
        pages.some((id) => ANCHORS[id].anchors.includes(anchor)),
        `${target}#${anchor}`
      )
    }
  })
}

// every string of a JSON file that is a URL of the site
function siteLinks(value) {
  if (typeof value === 'string') return value.startsWith(SITE) ? [value] : []
  if (value && typeof value === 'object') return Object.values(value).flatMap(siteLinks)
  return []
}

for (const [name, content] of Object.entries(data)) {
  test(`${name} links pages and anchors of the site`, () => {
    const links = siteLinks(content)
    assert.ok(links.length > 0)
    for (const link of links) {
      const url = new URL(link)
      const id = url.searchParams.get('page')
      if (id === null) {
        assert.equal(link, SITE)
        continue
      }
      assert.ok(Object.hasOwn(ANCHORS, id), link)
      const anchor = url.hash.slice(1)
      if (anchor) assert.ok(ANCHORS[id].anchors.includes(anchor), link)
    }
  })
}

test('the links of the entries are unique', () => {
  const links = [
    ...data['glossary.json'].terms,
    ...data['icons.json'].icons,
    ...data['colors.json'].groups.flatMap((group) => group.tokens)
  ].map((entry) => entry.link)
  assert.equal(new Set(links).size, links.length)
})
