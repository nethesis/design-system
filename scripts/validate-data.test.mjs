// Copyright (C) 2026 Nethesis S.r.l.
// SPDX-License-Identifier: GPL-3.0-or-later

// Run with: npm test

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { RESERVED_ICON_IDS, validateGlossary, validateIcons } from './validate-data.mjs'

const term = {
  id: 'create',
  en: 'Create',
  it: 'Crea',
  definition: 'Make a new object.',
  products: ['all']
}
const icon = {
  id: 'delete',
  meaning: 'Delete',
  icon: 'trash',
  category: 'actions',
  use: 'Buttons that delete an object.'
}
const iconNames = {
  'fa-solid': new Set(['trash', 'plus', 'circle-plus']),
  'ns-solid': new Set(['grid-one']),
  'ns-light': new Set(['house']),
  'ns-brands': new Set(['gravatar'])
}
const without = (entry, field) => Object.fromEntries(Object.entries(entry).filter(([key]) => key !== field))
const icons = (...entries) => validateIcons(entries, { glossaryIds: new Set(['create']), iconNames })

test('valid entries pass', () => {
  assert.deepEqual(
    validateGlossary([
      term,
      { id: 'nas', en: 'NAS', untranslatable: true, definition: 'A storage.', products: ['ns8'] }
    ]),
    []
  )
  assert.deepEqual(icons(icon, { ...icon, id: 'create', icon: 'circle-plus', glossary: ['create'] }), [])
})

// each case: the entry, then a text the error must contain
const glossaryCases = {
  'not a mapping': ['create', 'must be a mapping'],
  'id not a slug': [{ ...term, id: 'Create' }, 'lowercase slug'],
  'unknown field': [{ ...term, plural: 'Creates' }, 'unknown field "plural"'],
  'missing en': [{ ...term, en: '' }, 'missing en'],
  'missing it': [without(term, 'it'), 'missing it'],
  'empty it': [{ ...term, it: null }, 'it must be a text'],
  'it not a text': [{ ...term, it: ['Crea'] }, 'it must be a text'],
  'untranslatable not a boolean': [{ ...term, untranslatable: 'no' }, 'true or false'],
  'untranslatable with it': [{ ...term, untranslatable: true }, 'cannot have an it translation'],
  'products not a list': [{ ...term, products: 'all' }, 'products must be a non-empty list'],
  'unknown product': [{ ...term, products: ['nethlink'] }, 'unknown product "nethlink"'],
  'avoid as a list': [{ ...term, avoid: ['Add'] }, 'avoid must have en, it or both'],
  'avoid with another language': [{ ...term, avoid: { fr: ['Créer'] } }, 'only en and it'],
  'avoid.en not a list': [{ ...term, avoid: { en: 'Add' } }, 'avoid.en must be a non-empty list'],
  'preferred and avoided': [{ ...term, avoid: { it: ['Crea'] } }, 'both preferred and avoided']
}
for (const [name, [entry, message]] of Object.entries(glossaryCases)) {
  test(`glossary: ${name} is rejected`, () => {
    const errors = validateGlossary([entry])
    assert.ok(errors.some((error) => error.includes(message)), errors.join('\n') || 'no errors')
  })
}

test('glossary: duplicate ids and terms are rejected', () => {
  assert.ok(validateGlossary([term, term]).some((error) => error.includes('duplicate id')))
  assert.ok(
    validateGlossary([term, { ...term, id: 'create-2', en: 'create' }]).some((error) =>
      error.includes('already defined')
    )
  )
})

const iconCases = {
  'not a mapping': ['trash', 'must be a mapping'],
  'unknown field': [{ ...icon, label: 'x' }, 'unknown field "label"'],
  'missing use': [without(icon, 'use'), 'missing use'],
  'notes not a text': [{ ...icon, notes: ['x'] }, 'notes must be a text'],
  'reserved id': [{ ...icon, id: RESERVED_ICON_IDS[0] }, 'is reserved'],
  'unknown category': [{ ...icon, category: 'tools' }, 'category must be one of'],
  'ns-light as pack': [{ ...icon, pack: 'ns-light', icon: 'house' }, 'pack must be one of'],
  'icon not in its pack': [{ ...icon, icon: 'bin' }, '"bin" is not in fa-solid'],
  'brand outside ns-brands': [{ ...icon, category: 'brands' }, 'come from ns-brands'],
  'sidebar icon without Light version': [{ ...icon, category: 'sidebar' }, 'need a Light version'],
  'avoid as a text': [{ ...icon, avoid: 'plus' }, 'avoid must be a non-empty list'],
  'avoided icon not in fa-solid': [{ ...icon, avoid: ['bin'] }, 'avoided "bin" is not in fa-solid'],
  'used and avoided': [{ ...icon, avoid: ['trash'] }, 'both used and avoided'],
  'glossary as a text': [{ ...icon, glossary: 'create' }, 'glossary must be a non-empty list'],
  'unknown glossary term': [{ ...icon, glossary: ['remove'] }, 'unknown glossary term "remove"'],
  'products as a text': [{ ...icon, products: 'my' }, 'products must be a non-empty list']
}
for (const [name, [entry, message]] of Object.entries(iconCases)) {
  test(`icons: ${name} is rejected`, () => {
    const errors = icons(entry)
    assert.ok(errors.some((error) => error.includes(message)), errors.join('\n') || 'no errors')
  })
}

test('the reserved icon ids are the anchors of the Iconography headings', () => {
  const view = readFileSync(new URL('../src/components/IconographyView.vue', import.meta.url), 'utf8')
  const headings = [...view.matchAll(/ id="icon-([a-z0-9-]+)"/g)].map(([, id]) => id)
  assert.deepEqual(headings.sort(), [...RESERVED_ICON_IDS].sort())
})
