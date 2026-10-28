// Copyright (C) 2026 Nethesis S.r.l.
// SPDX-License-Identifier: GPL-3.0-or-later

// Vite plugin that publishes the content of the site as plain files, for
// coding agents and other tools that cannot run the site: the pages are
// built in the browser, so fetching them returns no content.
//
//   llms.txt               index of the files below, and of components.json
//                          published by the Storybook of vue-components
//   writing-guidelines.md  the writing guidelines, as markdown
//   introduction.md        the introduction, as markdown
//   glossary.json          the glossary
//   icons.json             which icon to use for each meaning
//   colors.json            the color tokens, with their Tailwind classes
//   foundations.json       typography, iconography, spacing, border,
//                          focus ring, elevation and shadow
//
// The data comes from the same modules as the pages, so the files never
// disagree with the site. They are written next to index.html by the build
// and served by the dev server.

import { readFileSync } from 'node:fs'
import type { Plugin } from 'vite'
import { fas } from '@nethesis/nethesis-solid-svg-icons'
import { fal } from '@nethesis/nethesis-light-svg-icons'
import { fab } from '@nethesis/nethesis-brands-svg-icons'
import {
  EXPORTED_AT,
  GROUPS,
  PRIMITIVES,
  SEMANTIC,
  tailwindClasses,
  tailwindColor
} from '../src/colors.ts'
import {
  BORDER_WIDTHS,
  ELEVATION,
  FOCUS_RINGS,
  FONT_WEIGHTS,
  ICON_PACKAGES,
  ICON_SIZES,
  RADII,
  SHADOWS,
  SPACING,
  STATUS_FOCUS_RINGS,
  TEXT_SIZES,
  TEXT_STYLE_GROUPS,
  TYPEFACE,
  focusRing1,
  focusRing2
} from '../src/foundations.ts'
import { ICON_CATEGORIES, ICON_PACK_LABELS, PRODUCT_LABELS } from '../src/types.ts'

const SITE = 'https://nethesis.github.io/design-system/'
const file = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

// JSON indented for the given number of levels, then on one line: each token,
// term or value takes one line, readable without wasting space
function format(value: unknown, levels: number, indent: string): string {
  if (levels === 0 || value === null || typeof value !== 'object') return JSON.stringify(value)
  const inner = `${indent}  `
  const items = Array.isArray(value)
    ? value.map((item) => format(item, levels - 1, inner))
    : Object.entries(value).map(
        ([key, item]) => `${JSON.stringify(key)}: ${format(item, levels - 1, inner)}`
      )
  const [open, close] = Array.isArray(value) ? ['[', ']'] : ['{', '}']
  return items.length
    ? `${open}\n${items.map((item) => inner + item).join(',\n')}\n${indent}${close}`
    : open + close
}
const json = (value: unknown, levels: number) => `${format(value, levels, '')}\n`

// links to other pages of the site (?page=glossary) point to the site
const markdown = (path: string) => file(path).replace(/\]\(\?page=/g, `](${SITE}?page=`)

function colors() {
  return {
    source: `${SITE}?page=colors`,
    exportedAt: EXPORTED_AT,
    note: 'Use the semantic tokens, not the primitive colors. In code, the primary palette is the palette of the product, so the Product Primary and product link tokens use primary-* classes. classes is null when a value has no Tailwind color.',
    groups: GROUPS.map((group) => ({
      ...group,
      tokens: SEMANTIC.filter((token) => token.name.startsWith(`${group.name}/`)).map((token) => ({
        name: token.name,
        description: token.description,
        light: { ...token.light, tailwind: tailwindColor(token.light.ref) },
        dark: { ...token.dark, tailwind: tailwindColor(token.dark.ref) },
        classes: tailwindClasses(token)
      }))
    })),
    primitives: PRIMITIVES.map((color) => ({ ...color, tailwind: tailwindColor(color.name) }))
  }
}

function foundations() {
  const iconNames = (pack: object) => Object.keys(pack).sort()
  return {
    source: SITE,
    typography: {
      page: `${SITE}?page=typography`,
      typeface: TYPEFACE,
      weights: FONT_WEIGHTS,
      sizes: TEXT_SIZES,
      textStyles: TEXT_STYLE_GROUPS
    },
    iconography: {
      page: `${SITE}?page=iconography`,
      note: 'Free Font Awesome icons, Solid style, shown with FontAwesomeIcon from @fortawesome/vue-fontawesome. Use a Nethesis custom icon only when Font Awesome has none. Light custom icons are only for the inactive sections of the main sidebar. Which icon to use for each meaning: icons.json. Hide icons next to a text label with aria-hidden="true"; an icon without text needs a label and a tooltip.',
      packages: ICON_PACKAGES,
      sizes: ICON_SIZES,
      customIcons: { solid: iconNames(fas), light: iconNames(fal), brands: iconNames(fab) }
    },
    spacingAndBorder: {
      page: `${SITE}?page=spacing-and-border`,
      spacing: SPACING,
      radii: RADII,
      borderWidths: BORDER_WIDTHS,
      focusRing: {
        styles: {
          'Focus ring/1': focusRing1('<ring color>'),
          'Focus ring/2': focusRing2('<ring color>', '<gap color, white by default>')
        },
        products: FOCUS_RINGS,
        status: STATUS_FOCUS_RINGS
      }
    },
    elevationAndShadow: {
      page: `${SITE}?page=elevation-and-shadow`,
      elevation: ELEVATION,
      shadows: SHADOWS
    }
  }
}

function glossary() {
  return {
    source: `${SITE}?page=glossary`,
    note: 'Approved terms of Nethesis user interfaces, with their Italian translation (it) and the terms to avoid. untranslatable: keep the English term in Italian too. link is the page of the term, to cite in reviews.',
    products: PRODUCT_LABELS,
    terms: JSON.parse(file('src/generated/glossary.json')).map((term: { id: string }) => ({
      ...term,
      link: `${SITE}?page=glossary#term-${term.id}`
    }))
  }
}

type IconEntry = { id: string; icon: string; pack: string; category: string }

function icons() {
  const entries: IconEntry[] = JSON.parse(file('src/generated/icons.json'))
  // the custom icons with a meaning: sidebar sections also use the Light icon
  const named = new Set(
    entries.flatMap((entry) => [
      `${entry.pack}:${entry.icon}`,
      ...(entry.category === 'sidebar' ? [`ns-light:${entry.icon}`] : [])
    ])
  )
  const withoutMeaning = (pack: string, icons: object) =>
    Object.values(icons)
      .map((icon) => icon.iconName as string)
      .filter((name) => !named.has(`${pack}:${name}`))
      .sort()
  return {
    source: `${SITE}?page=iconography#icon-meanings`,
    note: 'Use the same icon for the same meaning in every product. icon is the kebab-case name: import it as fa + PascalCase (circle-plus: faCirclePlus) from the package of its pack. Sidebar entries use the ns-light icon for the inactive section and the solid one for the active section. avoid lists the icons not to use for that meaning; link is the page of the entry, to cite in reviews. When a meaning is missing, choose a Font Awesome Solid icon that no other meaning uses. Do not use the custom icons listed in customIconsWithoutMeaning: they have no agreed meaning yet.',
    packs: Object.fromEntries(
      ICON_PACKAGES.map(({ pack, name }) => [pack, { label: ICON_PACK_LABELS[pack], package: name }])
    ),
    categories: ICON_CATEGORIES,
    products: PRODUCT_LABELS,
    icons: entries.map((entry) => ({
      ...entry,
      link: `${SITE}?page=iconography#icon-${entry.id}`
    })),
    customIconsWithoutMeaning: {
      'ns-solid': withoutMeaning('ns-solid', fas),
      'ns-light': withoutMeaning('ns-light', fal),
      'ns-brands': withoutMeaning('ns-brands', fab)
    }
  }
}

const LLMS = `# Nethesis Design System

> Rules shared by the user interfaces of Nethesis products: writing guidelines, glossary and
> visual foundations. The components are in @nethesis/vue-components
> (Storybook: https://nethesis.github.io/vue-components/), the designs in the NDS Figma file.
> NethServer 8 uses the Carbon Design System instead: only the writing guidelines and the
> glossary apply to it.

The pages of the site (${SITE}) are built in the browser. Read these files instead.

## Rules

- [Writing guidelines](writing-guidelines.md): how to write interface text, from voice and tone to buttons, forms, empty states, modals and notifications
- [Glossary](glossary.json): approved terms, Italian translations and terms to avoid
- [Icons](icons.json): which icon to use for each meaning, and the icons to avoid

## Components

- [Components and patterns](https://nethesis.github.io/vue-components/components.json): the components of @nethesis/vue-components and its patterns, with what each one is for, the replacement of deprecated components, and links to their code and Storybook pages

## Foundations

- [Colors](colors.json): semantic color tokens for the light and the dark theme, with their Tailwind CSS classes
- [Foundations](foundations.json): typography, iconography, spacing, border radius and width, focus ring, elevation and shadow

## Optional

- [Introduction](introduction.md): what the design system is made of, and how it applies to NethServer 8
`

function sources(): Record<string, string> {
  return {
    'llms.txt': LLMS,
    'writing-guidelines.md': markdown('content/writing-guidelines.md'),
    'introduction.md': markdown('content/introduction.md'),
    'glossary.json': json(glossary(), 2),
    'icons.json': json(icons(), 2),
    'colors.json': json(colors(), 4),
    'foundations.json': json(foundations(), 3)
  }
}

const CONTENT_TYPES: Record<string, string> = {
  txt: 'text/plain; charset=utf-8',
  md: 'text/markdown; charset=utf-8',
  json: 'application/json; charset=utf-8'
}

export default function publishSources(): Plugin {
  return {
    name: 'nethesis:sources',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const name = request.url?.split('?')[0].slice(1) ?? ''
        const content = Object.hasOwn(sources(), name) ? sources()[name] : undefined
        if (content === undefined) return next()
        response.setHeader('Content-Type', CONTENT_TYPES[name.split('.').pop()!])
        response.end(content)
      })
    },
    generateBundle() {
      for (const [fileName, source] of Object.entries(sources())) {
        this.emitFile({ type: 'asset', fileName, source })
      }
    }
  }
}
