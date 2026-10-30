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
// and served by the dev server. Every file has a source, the page of the site
// it comes from, and every entry that has an anchor in the site has a link,
// to cite in reviews.

import { readFileSync } from 'node:fs'
import type { Plugin } from 'vite'
import { fas } from '@nethesis/nethesis-solid-svg-icons'
import { fal } from '@nethesis/nethesis-light-svg-icons'
import { fab } from '@nethesis/nethesis-brands-svg-icons'
import { EXPORTED_AT, GROUPS, SEMANTIC, groupAnchor, tokenCode } from '../src/colors.ts'
import {
  BORDER_WIDTHS,
  ELEVATION,
  FOCUS_RINGS,
  FONT_WEIGHTS,
  ICON_PACKAGES,
  ICON_SIZES,
  LINE_LENGTH,
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
import { tokenAnchor } from '../src/text.ts'
import {
  ICON_CATEGORIES,
  ICON_PACK_LABELS,
  PRODUCT_LABELS,
  type GlossaryEntry,
  type IconEntry
} from '../src/types.ts'

export const SITE = 'https://nethesis.github.io/nebula-design-system/'
const page = (id: string, anchor = '') => `${SITE}?page=${id}${anchor ? `#${anchor}` : ''}`
const file = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const glossaryTerms = (): GlossaryEntry[] => JSON.parse(file('src/generated/glossary.json'))

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

// The file published for each page of the site. The links of the markdown
// files to other pages (?page=glossary) point to these files, which an agent
// can read, keeping the anchor as a hint to the section.
export const PAGE_FILES: Record<string, string> = {
  introduction: 'introduction.md',
  'writing-guidelines': 'writing-guidelines.md',
  glossary: 'glossary.json',
  colors: 'colors.json',
  typography: 'foundations.json',
  iconography: 'icons.json',
  'spacing-and-border': 'foundations.json',
  'elevation-and-shadow': 'foundations.json'
}

const markdown = (path: string) =>
  file(path).replace(/\]\(\?page=([a-z-]+)(#[a-z0-9-]+)?\)/g, (_, id: string, anchor = '') => {
    if (!PAGE_FILES[id]) throw new Error(`${path}: no published file for ?page=${id}`)
    return `](${PAGE_FILES[id]}${anchor})`
  })

// a CSS rem value, such as 0.125rem
const rem = (px: number) => `${px / 16}rem`

function colors() {
  return {
    source: page('colors'),
    exportedAt: EXPORTED_AT,
    note: 'Use these semantic tokens, not the colors of the palettes. light and dark are the values of a token in the two themes; tailwind is the Tailwind color to use in code. In code, the primary palette is the palette of the product, so the Product Primary and product link tokens use primary-* colors. classes are the Tailwind classes for both themes; they are null when the utility depends on the component (text, background, border…) or when a value has no Tailwind color: then build them from the two tailwind colors, as in text-primary-700 dark:text-primary-500. link is the token in the Colors page, to cite in reviews.',
    groups: GROUPS.map((group) => ({
      ...group,
      link: page('colors', groupAnchor(group.name)),
      tokens: SEMANTIC.filter((token) => token.name.startsWith(`${group.name}/`)).map((token) => {
        const code = tokenCode(token)
        return {
          name: token.name,
          description: token.description,
          light: { ...token.light, tailwind: code.light },
          dark: { ...token.dark, tailwind: code.dark },
          classes: code.classes,
          link: page('colors', tokenAnchor(token.name))
        }
      })
    }))
  }
}

function foundations() {
  return {
    source: SITE,
    note: 'Each section has its source, the page of the site it comes from. px values are CSS pixels; rem values assume a 16 px root font size.',
    typography: {
      source: page('typography'),
      typeface: TYPEFACE,
      weights: FONT_WEIGHTS,
      sizes: TEXT_SIZES,
      lineLength: {
        ...LINE_LENGTH,
        note: 'The widest a paragraph of running text should be, such as the description of a page: longer lines are hard to read. Tables, forms and other content can be wider.'
      },
      textStyles: TEXT_STYLE_GROUPS
    },
    iconography: {
      source: page('iconography'),
      note: 'Which icon to use for each meaning, from which package: icons.json. Font Awesome Solid icons, and Nethesis custom icons where icons.json uses them; Light custom icons only for the inactive sections of the main sidebar. Import each icon by name from its package and pass the imported object to FontAwesomeIcon, from @fortawesome/vue-fontawesome; do not register icons with library.add() to use them by name. Hide icons next to a text label with aria-hidden="true"; an icon without text needs a label and a tooltip.',
      packages: ICON_PACKAGES,
      sizes: ICON_SIZES
    },
    spacingAndBorder: {
      source: page('spacing-and-border'),
      spacing: SPACING.map((space) => ({ ...space, rem: rem(space.px) })),
      radii: RADII.map((radius) => ({ ...radius, rem: radius.px === 9999 ? null : rem(radius.px) })),
      borderWidths: BORDER_WIDTHS,
      focusRing: {
        note: 'The focus ring shows which element has the keyboard focus. Focus ring 1 is a 2 px ring around the element; focus ring 2 leaves a 2 px gap between the element and the ring. In code, the primary palette is the palette of the product, so the classes are the same in every product: focus-visible:ring-2 focus-visible:ring-primary-500 for focus ring 1, plus focus-visible:ring-offset-2 for focus ring 2. On a status color, focus ring 2 uses the classes of that status. styles are the box-shadow values of the Figma effect styles.',
        styles: {
          'Focus ring/1': focusRing1('<ring color>'),
          'Focus ring/2': focusRing2('<ring color>', '<gap color, white by default>')
        },
        products: FOCUS_RINGS,
        status: STATUS_FOCUS_RINGS
      }
    },
    elevationAndShadow: {
      source: page('elevation-and-shadow'),
      note: 'Each elevation level, from L0 to L4, is a surface color of the gray palette, for the backgrounds of the page, the top bar, the sidebar and the cards; L2 invert uses the L0 color to stand out on an L1 surface. Shadows apply to components such as cards, buttons, modals and tooltips; in the dark theme they are gray instead of black.',
      elevation: ELEVATION,
      shadows: SHADOWS
    }
  }
}

function glossary() {
  return {
    source: page('glossary'),
    note: 'Approved terms of Nethesis user interfaces, with their Italian translation (it) and the terms to avoid. untranslatable: keep the English term in Italian too. products lists the products a term applies to, all for every product. link is the term in the Glossary page, to cite in reviews.',
    products: PRODUCT_LABELS,
    terms: glossaryTerms().map((term) => ({ ...term, link: page('glossary', `term-${term.id}`) }))
  }
}

function icons() {
  const entries: IconEntry[] = JSON.parse(file('src/generated/icons.json'))
  const terms = new Map(glossaryTerms().map((term) => [term.id, term]))
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
    source: page('iconography', 'icon-meanings'),
    note: 'Use the same icon for the same meaning in every product; NethServer 8 modules, which follow the Carbon Design System, are excluded. icon is the kebab-case name: import it as fa + PascalCase (circle-plus: faCirclePlus) from the package of its pack, and pass the imported object to FontAwesomeIcon. Sidebar entries use the ns-light icon for the inactive section and the solid one for the active section. avoid lists the Font Awesome Solid icons not to use for that meaning. products lists the products that use the entry; without it, the entry applies to every product. glossary lists the terms of the glossary for the actions and objects of the entry. link is the entry in the Iconography page, to cite in reviews. When a meaning is missing, choose a Font Awesome Solid icon that no other meaning uses. Do not use the custom icons listed in customIconsWithoutMeaning: they have no agreed meaning yet.',
    packs: Object.fromEntries(
      ICON_PACKAGES.map(({ pack, name }) => [pack, { label: ICON_PACK_LABELS[pack], package: name }])
    ),
    categories: ICON_CATEGORIES,
    products: PRODUCT_LABELS,
    icons: entries.map((entry) => ({
      ...entry,
      ...(entry.glossary
        ? {
            glossary: entry.glossary.map((id) => ({
              id,
              en: terms.get(id)!.en,
              link: page('glossary', `term-${id}`)
            }))
          }
        : {}),
      link: page('iconography', `icon-${entry.id}`)
    })),
    customIconsWithoutMeaning: {
      'ns-solid': withoutMeaning('ns-solid', fas),
      'ns-light': withoutMeaning('ns-light', fal),
      'ns-brands': withoutMeaning('ns-brands', fab)
    }
  }
}

const LLMS = `# Nebula Design System

> Rules shared by the user interfaces of Nethesis products: writing guidelines, glossary and
> visual foundations. The components are in @nethesis/vue-components
> (Storybook: https://nethesis.github.io/vue-components/), the designs in the Nebula Figma file.
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

// the published files, each built only when it is requested
export const SOURCES: Record<string, () => string> = {
  'llms.txt': () => LLMS,
  'writing-guidelines.md': () => markdown('content/writing-guidelines.md'),
  'introduction.md': () => markdown('content/introduction.md'),
  'glossary.json': () => json(glossary(), 2),
  'icons.json': () => json(icons(), 2),
  'colors.json': () => json(colors(), 4),
  'foundations.json': () => json(foundations(), 3)
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
        if (!Object.hasOwn(SOURCES, name)) return next()
        response.setHeader('Content-Type', CONTENT_TYPES[name.split('.').pop()!])
        response.end(SOURCES[name]())
      })
    },
    generateBundle() {
      for (const [fileName, build] of Object.entries(SOURCES)) {
        this.emitFile({ type: 'asset', fileName, source: build() })
      }
    }
  }
}
