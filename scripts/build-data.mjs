// Copyright (C) 2026 Nethesis S.r.l.
// SPDX-License-Identifier: GPL-3.0-or-later

// Validates glossary.yaml and icons.yaml, then generates:
//   - glossary/it.tbx            Weblate glossary
//   - src/generated/glossary.json   data for the web page
//   - src/generated/icons.json      data for the Iconography page
//   - src/generated/icon-svgs.json  the icons it shows, so the page does not
//                                   load whole icon packs
//
// content/*.md is compiled by scripts/vite-plugin-markdown.mjs.
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
import { validateGlossary, validateIcons } from './validate-data.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const checkOnly = process.argv.includes('--check')

const TARGET_LANGUAGES = ['it']

const xml = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// validation (scripts/validate-data.mjs)

const ICON_PACKS = {
  'fa-solid': fasFree,
  'ns-solid': nsSolid,
  'ns-light': nsLight,
  'ns-brands': nsBrands
}
// the names of the icons of each pack, aliases included
const iconNames = Object.fromEntries(
  Object.entries(ICON_PACKS).map(([pack, icons]) => [
    pack,
    new Set(Object.values(icons).flatMap((icon) => [icon.iconName, ...(icon.icon[2] ?? [])]))
  ])
)

const entries = parse(readFileSync(join(root, 'glossary.yaml'), 'utf8'))
const icons = parse(readFileSync(join(root, 'icons.yaml'), 'utf8'))
const errors = [
  ...validateGlossary(entries),
  ...validateIcons(icons, {
    glossaryIds: new Set(Array.isArray(entries) ? entries.map((entry) => entry?.id) : []),
    iconNames
  })
]

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

for (const entry of icons) entry.pack ??= 'fa-solid'

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
<p>Nethesis Design System glossary</p>
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
