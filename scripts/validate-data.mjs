// Copyright (C) 2026 Nethesis S.r.l.
// SPDX-License-Identifier: GPL-3.0-or-later

// Validation of glossary.yaml and icons.yaml, used by build-data.mjs and
// tested in validate-data.test.mjs. Each function returns the list of errors.

import { ICON_CATEGORIES, ICON_PACK_LABELS, PRODUCT_LABELS } from '../src/types.ts'

export const PRODUCTS = Object.keys(PRODUCT_LABELS)
export const CATEGORIES = ICON_CATEGORIES.map((category) => category.id)
// the packs an entry can use: ns-light holds only the inactive version of the
// sidebar icons
export const ENTRY_PACKS = Object.keys(ICON_PACK_LABELS).filter((pack) => pack !== 'ns-light')
// ids that would give an entry the anchor of a heading of the Iconography
// page, such as #icon-library
export const RESERVED_ICON_IDS = ['library', 'meanings']

const GLOSSARY_FIELDS = ['id', 'en', 'it', 'untranslatable', 'definition', 'products', 'avoid', 'notes']
const ICON_FIELDS = [
  'id',
  'meaning',
  'icon',
  'pack',
  'category',
  'use',
  'notFor',
  'avoid',
  'glossary',
  'products',
  'notes'
]
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/

const isMapping = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const isText = (value) => typeof value === 'string' && value.trim() !== ''
const isTextList = (value) => Array.isArray(value) && value.length > 0 && value.every(isText)

// checks shared by the two files: a mapping, a unique slug id, known fields,
// required and optional texts, and known products
function checkEntry(entry, where, { ids, fields, required, optional }) {
  const errors = []
  if (!isMapping(entry)) return [`${where}: must be a mapping of fields`]
  if (!isText(entry.id) || !SLUG.test(entry.id)) {
    errors.push(`${where}: id must be a lowercase slug`)
  } else if (ids.has(entry.id)) {
    errors.push(`${where}: duplicate id`)
  }
  ids.add(entry.id)
  for (const field of Object.keys(entry)) {
    if (!fields.includes(field)) errors.push(`${where}: unknown field "${field}"`)
  }
  for (const field of required) {
    if (!isText(entry[field])) errors.push(`${where}: missing ${field}`)
  }
  for (const field of optional) {
    if (field in entry && !isText(entry[field])) errors.push(`${where}: ${field} must be a text`)
  }
  return errors
}

function checkProducts(products, where, required) {
  if (products === undefined && !required) return []
  if (!isTextList(products)) return [`${where}: products must be a non-empty list`]
  return products
    .filter((product) => !PRODUCTS.includes(product))
    .map((product) => `${where}: unknown product "${product}"`)
}

export function validateGlossary(entries) {
  if (!Array.isArray(entries)) return ['glossary.yaml must be a list of entries']
  const errors = []
  const ids = new Set()
  const enTerms = new Set()

  for (const [index, entry] of entries.entries()) {
    const where = `glossary.yaml entry ${index + 1} (${entry?.id ?? 'no id'})`
    const entryErrors = checkEntry(entry, where, {
      ids,
      fields: GLOSSARY_FIELDS,
      required: ['en', 'definition'],
      optional: ['it', 'notes']
    })
    errors.push(...entryErrors)
    if (!isMapping(entry)) continue

    if ('untranslatable' in entry && typeof entry.untranslatable !== 'boolean') {
      errors.push(`${where}: untranslatable must be true or false`)
    }
    if (entry.untranslatable === true && 'it' in entry) {
      errors.push(`${where}: an untranslatable entry cannot have an it translation`)
    }
    if (entry.untranslatable !== true && !('it' in entry)) errors.push(`${where}: missing it`)
    errors.push(...checkProducts(entry.products, where, true))

    const key = typeof entry.en === 'string' ? entry.en.toLowerCase() : null
    if (key && enTerms.has(key)) errors.push(`${where}: "${entry.en}" is already defined`)
    enTerms.add(key)

    if ('avoid' in entry) {
      const avoid = entry.avoid
      if (!isMapping(avoid) || Object.keys(avoid).length === 0) {
        errors.push(`${where}: avoid must have en, it or both, each a list of terms`)
        continue
      }
      for (const [lang, words] of Object.entries(avoid)) {
        if (!['en', 'it'].includes(lang)) {
          errors.push(`${where}: avoid has "${lang}", but only en and it are allowed`)
        } else if (!isTextList(words)) {
          errors.push(`${where}: avoid.${lang} must be a non-empty list of terms`)
        } else {
          for (const word of words.filter((word) => word === entry[lang])) {
            errors.push(`${where}: "${word}" is both preferred and avoided`)
          }
        }
      }
    }
  }
  return errors
}

// iconNames: the names, aliases included, of the icons of each pack, as a Set
export function validateIcons(icons, { glossaryIds, iconNames }) {
  if (!Array.isArray(icons)) return ['icons.yaml must be a list of entries']
  const errors = []
  const ids = new Set()

  for (const [index, entry] of icons.entries()) {
    const where = `icons.yaml entry ${index + 1} (${entry?.id ?? 'no id'})`
    errors.push(
      ...checkEntry(entry, where, {
        ids,
        fields: ICON_FIELDS,
        required: ['meaning', 'icon', 'use'],
        optional: ['notFor', 'notes']
      })
    )
    if (!isMapping(entry)) continue

    if (RESERVED_ICON_IDS.includes(entry.id)) {
      errors.push(`${where}: "${entry.id}" is reserved, it would be the anchor of a heading`)
    }
    if (!CATEGORIES.includes(entry.category)) {
      errors.push(`${where}: category must be one of ${CATEGORIES.join(', ')}`)
    }

    const pack = entry.pack ?? 'fa-solid'
    if (!ENTRY_PACKS.includes(pack)) {
      errors.push(`${where}: pack must be one of ${ENTRY_PACKS.join(', ')}`)
    } else if (isText(entry.icon) && !iconNames[pack].has(entry.icon)) {
      errors.push(`${where}: "${entry.icon}" is not in ${pack}`)
    }
    if ((entry.category === 'brands') !== (pack === 'ns-brands')) {
      errors.push(`${where}: brand icons, and only them, come from ns-brands`)
    }
    if (entry.category === 'sidebar' && !iconNames['ns-light'].has(entry.icon)) {
      errors.push(`${where}: sidebar icons need a Light version, but "${entry.icon}" is not in ns-light`)
    }

    for (const field of ['avoid', 'glossary']) {
      if (field in entry && !isTextList(entry[field])) {
        errors.push(`${where}: ${field} must be a non-empty list`)
      }
    }
    for (const icon of isTextList(entry.avoid) ? entry.avoid : []) {
      if (!iconNames['fa-solid'].has(icon)) errors.push(`${where}: avoided "${icon}" is not in fa-solid`)
      if (icon === entry.icon) errors.push(`${where}: "${icon}" is both used and avoided`)
    }
    for (const term of isTextList(entry.glossary) ? entry.glossary : []) {
      if (!glossaryIds.has(term)) errors.push(`${where}: unknown glossary term "${term}"`)
    }
    errors.push(...checkProducts(entry.products, where, false))
  }
  return errors
}
