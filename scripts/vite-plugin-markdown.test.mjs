// Copyright (C) 2026 Nethesis S.r.l.
// SPDX-License-Identifier: GPL-3.0-or-later

// Run with: npm test

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { compileTemplate, parse } from 'vue/compiler-sfc'
import { CONTENT_DIR, renderMarkdown } from './vite-plugin-markdown.mjs'

const compile = (sfc) => {
  const { descriptor } = parse(sfc, { filename: 'x.md' })
  return compileTemplate({ source: descriptor.template.content, filename: 'x.vue', id: 'x' }).code
}

for (const file of readdirSync(CONTENT_DIR).filter((name) => name.endsWith('.md'))) {
  test(`content/${file} is accepted`, () => {
    const { errors } = renderMarkdown(readFileSync(`${CONTENT_DIR}${file}`, 'utf8'))
    assert.deepEqual(errors, [])
  })
}

test('the table of contents lists the level 2 headings', () => {
  const { sfc } = renderMarkdown(readFileSync(`${CONTENT_DIR}writing-guidelines.md`, 'utf8'))
  assert.match(sfc, /export const toc = \[.*\{"id":"voice-and-tone","title":"Voice and tone"\}/)
})

const rejected = {
  'raw HTML block': '<div onclick="alert(1)">x</div>',
  'inline raw HTML': 'a <b onclick="alert(1)">b</b>',
  'HTML comment': '<!-- x -->',
  'javascript link': '[a](javascript:alert(1))',
  'uppercase javascript link': '[a](JaVaScRiPt:alert(1))',
  'entity encoded javascript link': '[a](javascript&#58;alert(1))',
  'tab inside javascript link': '[a](java&#9;script:alert(1))',
  'javascript autolink': '<javascript:alert(1)>',
  'javascript reference link': '[a][r]\n\n[r]: javascript:alert(1)',
  'data link': '[a](data:text/html,x)',
  'page link with extra parameters': '[a](?page=glossary&q=javascript:alert(1))',
  'image': '![x](https://example.com/pixel.png)',
  'duplicate heading': '## A\n\n## A'
}

for (const [name, markdown] of Object.entries(rejected)) {
  test(`rejects ${name}`, () => {
    assert.notDeepEqual(renderMarkdown(markdown).errors, [])
  })
}

test('text is never evaluated as a Vue expression or directive', () => {
  const { errors, sfc } = renderMarkdown(
    'a {{ 7 * 6 }} `{{ 1 }}` \\<b @click="x"> &lt;/div&gt; [{{ a }}](https://example.com "{{ t }}")'
  )
  assert.deepEqual(errors, [])
  const code = compile(sfc)
  assert.doesNotMatch(code, /toDisplayString|_ctx\./)
  assert.match(code, /\{\{ 7 \* 6 \}\}/)
})

test('quotes cannot break out of attributes', () => {
  const { errors } = renderMarkdown('[a](https://example.com "t\\" onclick=\\"y")')
  assert.deepEqual(errors, [])
})

test('links to other pages of the site are accepted', () => {
  const { errors } = renderMarkdown('[a](?page=glossary) [b](?page=writing-guidelines#forms)')
  assert.deepEqual(errors, [])
})

test('external links open in a new tab', () => {
  const { sfc } = renderMarkdown('[a](https://example.com) [b](#c)')
  assert.match(sfc, /href="https:\/\/example.com" target="_blank" rel="noopener noreferrer"/)
  assert.match(sfc, /href="#c">/)
})

test('Do and Don\'t tables get the do-dont class', () => {
  const { errors, sfc } = renderMarkdown("| Do | Don't |\n| --- | --- |\n| a | b |\n\n| A | B |\n| --- | --- |\n| c | d |")
  assert.deepEqual(errors, [])
  assert.equal(sfc.match(/<table class="do-dont">/g).length, 1)
  assert.equal(sfc.match(/<table>/g).length, 1)
})
