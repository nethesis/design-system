// Copyright (C) 2026 Nethesis S.r.l.
// SPDX-License-Identifier: GPL-3.0-or-later

// Validates glossary.yaml and icons.yaml, then generates:
//   - glossary/it.tbx            Weblate glossary
//   - src/generated/glossary.json   data for the web page
//   - src/generated/icons.json      data for the Iconography page
//   - src/generated/icon-svgs.json  the icons it shows, so the page does not
//                                   load whole icon packs
//
// guidelines.md is compiled by scripts/vite-plugin-guidelines.mjs.
//
// With --check, nothing is written: the script fails if glossary/it.tbx is
// not up to date with glossary.yaml (used by CI).

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'yaml'
import { fas as fasFree } from '@fortawesome/free-solid-svg-icons'
import { fas as nsSolid } from '@nethesis/nethesis-solid-svg-icons'
import { fal as nsLight } from '@nethesis/nethesis-light-svg-icons'
import { fab as nsBrands } from '@nethesis/nethesis-brands-svg-icons'
import { slug } from './slug.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const checkOnly = process.argv.includes('--check')

const PRODUCTS = ['all', 'ns8', 'nethsecurity', 'nethvoice', 'nethservice', 'neth360', 'my']
const FIELDS = ['id', 'en', 'it', 'untranslatable', 'definition', 'products', 'avoid', 'notes']
const TARGET_LANGUAGES = ['it']

const xml = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// validation

const entries = parse(readFileSync(join(root, 'glossary.yaml'), 'utf8'))
const errors = []

if (!Array.isArray(entries)) {
  console.error('glossary.yaml must be a list of entries')
  process.exit(1)
}

const ids = new Set()
const enTerms = new Map()

for (const [index, entry] of entries.entries()) {
  const where = `entry ${index + 1} (${entry.id ?? 'no id'})`

  if (!entry.id || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(entry.id)) {
    errors.push(`${where}: id must be a lowercase slug`)
  } else if (ids.has(entry.id)) {
    errors.push(`${where}: duplicate id`)
  }
  ids.add(entry.id)

  if (!entry.en) errors.push(`${where}: missing en`)
  if (!entry.definition) errors.push(`${where}: missing definition`)
  if (entry.untranslatable && entry.it) {
    errors.push(`${where}: an untranslatable entry cannot have an it translation`)
  }
  if (!entry.untranslatable && !entry.it) errors.push(`${where}: missing it`)
  for (const field of Object.keys(entry)) {
    if (!FIELDS.includes(field)) errors.push(`${where}: unknown field "${field}"`)
  }
  if (!Array.isArray(entry.products) || entry.products.length === 0) {
    errors.push(`${where}: products must be a non-empty list`)
  } else {
    for (const product of entry.products) {
      if (!PRODUCTS.includes(product)) errors.push(`${where}: unknown product "${product}"`)
    }
  }

  const key = entry.en?.toLowerCase()
  if (key && enTerms.has(key)) errors.push(`${where}: "${entry.en}" is already defined`)
  enTerms.set(key, entry.id)

  for (const lang of ['en', 'it']) {
    for (const word of entry.avoid?.[lang] ?? []) {
      if (word === entry[lang]) errors.push(`${where}: "${word}" is both preferred and avoided`)
    }
  }
}

// icon dictionary: every icon must exist in its package

const ICON_PACKS = {
  'fa-solid': fasFree,
  'ns-solid': nsSolid,
  'ns-light': nsLight,
  'ns-brands': nsBrands
}
const ICON_CATEGORIES = ['actions', 'navigation', 'interface', 'status', 'sidebar', 'objects', 'brands']
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
const iconNames = Object.fromEntries(
  Object.entries(ICON_PACKS).map(([pack, icons]) => [
    pack,
    new Set(Object.values(icons).flatMap((icon) => [icon.iconName, ...(icon.icon[2] ?? [])]))
  ])
)

const icons = parse(readFileSync(join(root, 'icons.yaml'), 'utf8'))
const iconIds = new Set()

if (!Array.isArray(icons)) errors.push('icons.yaml must be a list of entries')

for (const [index, entry] of (Array.isArray(icons) ? icons : []).entries()) {
  const where = `icons.yaml entry ${index + 1} (${entry.id ?? 'no id'})`

  if (!entry.id || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(entry.id)) {
    errors.push(`${where}: id must be a lowercase slug`)
  } else if (iconIds.has(entry.id)) {
    errors.push(`${where}: duplicate id`)
  }
  iconIds.add(entry.id)

  for (const field of Object.keys(entry)) {
    if (!ICON_FIELDS.includes(field)) errors.push(`${where}: unknown field "${field}"`)
  }
  for (const field of ['meaning', 'icon', 'use']) {
    if (!entry[field]) errors.push(`${where}: missing ${field}`)
  }
  if (!ICON_CATEGORIES.includes(entry.category)) {
    errors.push(`${where}: category must be one of ${ICON_CATEGORIES.join(', ')}`)
  }

  entry.pack ??= 'fa-solid'
  if (!['fa-solid', 'ns-solid', 'ns-brands'].includes(entry.pack)) {
    errors.push(`${where}: pack must be fa-solid, ns-solid or ns-brands`)
  } else if (!iconNames[entry.pack].has(entry.icon)) {
    errors.push(`${where}: "${entry.icon}" is not in ${entry.pack}`)
  }
  if ((entry.category === 'brands') !== (entry.pack === 'ns-brands')) {
    errors.push(`${where}: brand icons, and only them, come from ns-brands`)
  }
  if (entry.category === 'sidebar' && !iconNames['ns-light'].has(entry.icon)) {
    errors.push(`${where}: sidebar icons need a Light version, but "${entry.icon}" is not in ns-light`)
  }

  for (const icon of entry.avoid ?? []) {
    if (!iconNames['fa-solid'].has(icon)) errors.push(`${where}: avoided "${icon}" is not in fa-solid`)
    if (icon === entry.icon) errors.push(`${where}: "${icon}" is both used and avoided`)
  }
  for (const term of entry.glossary ?? []) {
    if (!ids.has(term)) errors.push(`${where}: unknown glossary term "${term}"`)
  }
  for (const product of entry.products ?? []) {
    if (!PRODUCTS.includes(product)) errors.push(`${where}: unknown product "${product}"`)
  }
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

// TBX for Weblate: https://docs.weblate.org/en/latest/formats/tbx.html

function tbx(lang) {
  const body = []

  for (const entry of entries) {
    const notes = entry.notes ? `\n<descrip type="Usage note">${xml(entry.notes)}</descrip>` : ''

    if (entry.untranslatable) {
      body.push(`<termEntry id="${entry.id}">
<descrip>${xml(entry.definition)}</descrip>${notes}
<descrip type="Translation needed">No</descrip>
<langSet xml:lang="en">
<tig>
<term>${xml(entry.en)}</term>
</tig>
</langSet>
</termEntry>`)
    } else {
      body.push(`<termEntry id="${entry.id}">
<descrip>${xml(entry.definition)}</descrip>${notes}
<langSet xml:lang="en">
<tig>
<term>${xml(entry.en)}</term>
</tig>
</langSet>
<langSet xml:lang="${lang}">
<tig>
<term>${xml(entry[lang])}</term>
</tig>
</langSet>
</termEntry>`)
    }

    // each translation to avoid becomes a forbidden pair, also for terms
    // that stay in English
    for (const word of entry.avoid?.[lang] ?? []) {
      body.push(`<termEntry id="${entry.id}--forbidden-${slug(word)}">
<langSet xml:lang="en">
<tig>
<term>${xml(entry.en)}</term>
<termNote type="administrativeStatus">forbidden</termNote>
</tig>
</langSet>
<langSet xml:lang="${lang}">
<tig>
<term>${xml(word)}</term>
</tig>
</langSet>
</termEntry>`)
    }
  }

  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE martif PUBLIC "ISO 12200:1999A//DTD MARTIF core (DXFcdV04)//EN" "TBXcdv04.dtd">
<!-- Generated from glossary.yaml by scripts/build-data.mjs: do not edit. -->
<martif type="TBX" xml:lang="en">
<martifHeader>
<fileDesc>
<sourceDesc>
<p>Nethesis UX glossary</p>
</sourceDesc>
</fileDesc>
</martifHeader>
<text>
<body>
${body.join('\n')}
</body>
</text>
</martif>
`
}

let stale = false

for (const lang of TARGET_LANGUAGES) {
  const path = join(root, 'glossary', `${lang}.tbx`)
  const content = tbx(lang)

  if (checkOnly) {
    let current = ''
    try {
      current = readFileSync(path, 'utf8')
    } catch {
      // missing file is reported as stale below
    }
    if (current !== content) {
      console.error(`glossary/${lang}.tbx is not up to date: run "npm run build:data" and commit it`)
      stale = true
    }
  } else {
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, content)
  }
}

if (checkOnly) {
  if (stale) process.exit(1)
  console.log(
    `glossary.yaml (${entries.length} entries) and icons.yaml (${icons.length} entries) are valid, and the TBX files are up to date`
  )
  process.exit(0)
}

// data for the web page

const generated = join(root, 'src', 'generated')
mkdirSync(generated, { recursive: true })
writeFileSync(join(generated, 'glossary.json'), JSON.stringify(entries, null, 2))
writeFileSync(join(generated, 'icons.json'), JSON.stringify(icons, null, 2))

// the width, height and path of each icon, by "<pack>:<name>"
const svgs = {}
const addSvg = (pack, name) => {
  const icon = Object.values(ICON_PACKS[pack]).find(
    (item) => item.iconName === name || item.icon[2]?.includes(name)
  )
  const [width, height, , , path] = icon.icon
  svgs[`${pack}:${name}`] = { width, height, path }
}
for (const entry of icons) {
  addSvg(entry.pack, entry.icon)
  if (entry.category === 'sidebar') addSvg('ns-light', entry.icon)
  for (const icon of entry.avoid ?? []) addSvg('fa-solid', icon)
}
writeFileSync(join(generated, 'icon-svgs.json'), JSON.stringify(svgs))

console.log(`Generated ${TARGET_LANGUAGES.map((l) => `glossary/${l}.tbx`).join(', ')} and page data`)
