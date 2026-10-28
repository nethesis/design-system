//  Copyright (C) 2026 Nethesis S.r.l.
//  SPDX-License-Identifier: GPL-3.0-or-later

// The search of the site. This module is loaded the first time the search is
// used, so the index does not weigh on the first download.

import type { IconPack } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@nethesis/nethesis-solid-svg-icons'
import { fal } from '@nethesis/nethesis-light-svg-icons'
import { fab } from '@nethesis/nethesis-brands-svg-icons'
import glossary from './generated/glossary.json'
import iconEntries from './generated/icons.json'
import { GROUPS, SEMANTIC, groupAnchor, tailwindClasses } from './colors'
import { TEXT_STYLE_GROUPS } from './foundations'
import { PAGES, findPage, type Page } from './pages'
import { normalize, tokenAnchor } from './text'
import { ICON_CATEGORIES, PRODUCT_LABELS, type GlossaryEntry, type IconEntry } from './types'

export type SearchItem = {
  page: Page
  // anchor in the page, with the leading #, or empty for the page itself
  hash: string
  title: string
  // where the item is: the page, then the section
  context: string[]
  // other names of the item, such as the Italian translation of a term:
  // they match almost as well as the title
  aliases?: string[]
  // more text to search, shown as a snippet when the title does not match
  text: string
  // items of earlier kinds come first when they match equally well
  rank: number
  // normalized names (title, then aliases) and all the text, computed once
  normalizedNames: string[]
  normalizedAll: string
}

// a piece of text, marked when it matches the query
export type Segment = { text: string; match: boolean }

export type SearchResult = {
  item: SearchItem
  title: Segment[]
  snippet: Segment[]
}

const page = (id: string) => {
  const found = findPage(id)
  if (!found) throw new Error(`search: unknown page ${id}`)
  return found
}

function item(fields: Omit<SearchItem, 'normalizedNames' | 'normalizedAll'>): SearchItem {
  const names = [fields.title, ...(fields.aliases ?? [])]
  return {
    ...fields,
    normalizedNames: names.map(normalize),
    normalizedAll: normalize([...names, ...fields.context, fields.text].join(' '))
  }
}

// markdown pages: one item for each section
const markdownSections = import.meta.glob<
  { id: string; title: string; parent: string; text: string }[]
>('../content/*.md', { query: '?search', import: 'default', eager: true })

// pages written in Vue: the level 2 and 3 headings with a fixed id and text
const viewSources = import.meta.glob<string>('./components/*View.vue', {
  query: '?raw',
  import: 'default',
  eager: true
})
const VIEWS: Record<string, string> = {
  colors: 'ColorsView',
  typography: 'TypographyView',
  iconography: 'IconographyView',
  'spacing-and-border': 'SpacingView',
  'elevation-and-shadow': 'ElevationView'
}
const HEADING = /<h([23])\s+id="([^"]+)"\s*>([^<{]+)<\/h\1>/g

function buildIndex(): SearchItem[] {
  const items: SearchItem[] = []
  const pageTexts = new Map<Page, string>()

  for (const [path, sections] of Object.entries(markdownSections)) {
    const sectionPage = page(path.slice(path.lastIndexOf('/') + 1, -'.md'.length))
    for (const section of sections) {
      if (!section.id) {
        pageTexts.set(sectionPage, section.text)
        continue
      }
      items.push(
        item({
          page: sectionPage,
          hash: `#${section.id}`,
          title: section.title,
          context: [sectionPage.title, ...(section.parent ? [section.parent] : [])],
          text: section.text,
          rank: 1
        })
      )
    }
  }

  for (const [id, view] of Object.entries(VIEWS)) {
    const source = viewSources[`./components/${view}.vue`]
    if (source === undefined) throw new Error(`search: missing ${view}.vue`)
    for (const [, , anchor, title] of source.matchAll(HEADING)) {
      items.push(
        item({
          page: page(id),
          hash: `#${anchor}`,
          title: title.trim(),
          context: [page(id).title],
          text: '',
          rank: 1
        })
      )
    }
  }

  for (const searchPage of PAGES) {
    items.push(
      item({
        page: searchPage,
        hash: '',
        title: searchPage.title,
        context:
          searchPage.navLabel && searchPage.navLabel !== searchPage.title
            ? [searchPage.navLabel]
            : [],
        text: [searchPage.description, pageTexts.get(searchPage) ?? ''].join(' '),
        rank: 0
      })
    )
  }

  for (const entry of glossary as GlossaryEntry[]) {
    items.push(
      item({
        page: page('glossary'),
        hash: `#term-${entry.id}`,
        title: entry.en,
        aliases: entry.it ? [entry.it] : [],
        context: ['Glossary'],
        text: [
          entry.definition,
          entry.notes ?? '',
          ...(entry.avoid?.en ?? []),
          ...(entry.avoid?.it ?? [])
        ].join(' '),
        rank: 2
      })
    )
  }

  const colors = page('colors')
  for (const group of GROUPS) {
    items.push(
      item({
        page: colors,
        hash: `#${groupAnchor(group.name)}`,
        title: group.name,
        context: [colors.title, 'Tokens'],
        text: group.description,
        rank: 1
      })
    )
  }
  for (const token of SEMANTIC) {
    items.push(
      item({
        page: colors,
        hash: `#${tokenAnchor(token.name)}`,
        title: token.name,
        context: [colors.title, 'Tokens'],
        text: [
          token.description,
          tailwindClasses(token) ?? '',
          token.light.ref ?? '',
          token.light.hex,
          token.dark.ref ?? '',
          token.dark.hex
        ].join(' '),
        rank: 3
      })
    )
  }

  const typography = page('typography')
  for (const group of TEXT_STYLE_GROUPS) {
    for (const style of group.styles) {
      items.push(
        item({
          page: typography,
          hash: '#text-styles',
          title: style.token,
          context: [typography.title, 'Text styles', group.title],
          text: [style.className ?? '', `${style.size} px`, style.weight].join(' '),
          rank: 3
        })
      )
    }
  }

  const iconography = page('iconography')
  const iconPacks: [string, IconPack][] = [
    ['Solid', fas],
    ['Light', fal],
    ['Brands', fab]
  ]
  for (const entry of iconEntries as IconEntry[]) {
    items.push(
      item({
        page: iconography,
        hash: `#icon-${entry.id}`,
        title: entry.meaning,
        aliases: [entry.icon],
        context: [
          iconography.title,
          'Meanings',
          ICON_CATEGORIES.find((category) => category.id === entry.category)!.title
        ],
        text: [
          entry.use,
          entry.notFor ?? '',
          entry.notes ?? '',
          ...(entry.avoid ?? []),
          ...(entry.products ?? []).map((product) => PRODUCT_LABELS[product])
        ].join(' '),
        rank: 2
      })
    )
  }
  for (const [style, pack] of iconPacks) {
    for (const icon of Object.values(pack)) {
      items.push(
        item({
          page: iconography,
          hash: `#custom-${style.toLowerCase()}`,
          title: icon.iconName,
          context: [iconography.title, 'Custom icons', style],
          text: '',
          rank: 4
        })
      )
    }
  }

  return items
}

let index: SearchItem[] | undefined

// the ranges of text that match one of the words
function matches(normalizedText: string, words: string[]): [number, number][] {
  const ranges: [number, number][] = []
  for (const word of words) {
    for (
      let at = normalizedText.indexOf(word);
      at >= 0;
      at = normalizedText.indexOf(word, at + 1)
    ) {
      ranges.push([at, at + word.length])
    }
  }
  ranges.sort((a, b) => a[0] - b[0])
  const merged: [number, number][] = []
  for (const range of ranges) {
    const last = merged.at(-1)
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1])
    else merged.push([...range])
  }
  return merged
}

function segments(text: string, ranges: [number, number][]): Segment[] {
  const result: Segment[] = []
  let at = 0
  for (const [start, end] of ranges) {
    if (start > at) result.push({ text: text.slice(at, start), match: false })
    result.push({ text: text.slice(start, end), match: true })
    at = end
  }
  if (at < text.length) result.push({ text: text.slice(at), match: false })
  return result
}

// about 120 characters of text around the first match, cut at word boundaries
function snippet(text: string, words: string[]): Segment[] {
  const normalizedText = normalize(text)
  const first = matches(normalizedText, words)[0]
  if (!first) return []
  let start = Math.max(0, first[0] - 40)
  let end = Math.min(text.length, start + 120)
  const spaceAfterStart = text.indexOf(' ', start)
  if (start > 0 && spaceAfterStart >= 0 && spaceAfterStart < first[0]) start = spaceAfterStart + 1
  const spaceBeforeEnd = text.lastIndexOf(' ', end)
  if (end < text.length && spaceBeforeEnd >= first[1]) end = spaceBeforeEnd
  const ranges = matches(normalizedText.slice(start, end), words)
  return [
    ...(start > 0 ? [{ text: '…', match: false }] : []),
    ...segments(text.slice(start, end), ranges),
    ...(end < text.length ? [{ text: '…', match: false }] : [])
  ]
}

function nameScore(name: string, query: string, words: string[]) {
  let points = 0
  if (name === query) points = 100
  else if (name.startsWith(query)) points = 60
  else if (words.every((word) => name.includes(word))) points = 40
  else points = 10 * words.filter((word) => name.includes(word)).length
  // words that start a word of the name count more than words inside it
  const nameWords = name.split(/[^a-z0-9]+/)
  return points + 5 * words.filter((word) => nameWords.some((part) => part.startsWith(word))).length
}

function score(item: SearchItem, query: string, words: string[]) {
  const [title, ...aliases] = item.normalizedNames
  const points = Math.max(
    nameScore(title, query, words),
    ...aliases.map((alias) => nameScore(alias, query, words) - 10)
  )
  return points - item.rank
}

// The items that contain every word of the query, best matches first
export function search(query: string, limit = 20): SearchResult[] {
  index ??= buildIndex()
  const normalizedQuery = normalize(query.trim()).replace(/\s+/g, ' ')
  const words = normalizedQuery.split(' ').filter(Boolean)
  if (!words.length) return []

  return index
    .filter((item) => words.every((word) => item.normalizedAll.includes(word)))
    .map((item) => ({ item, points: score(item, normalizedQuery, words) }))
    .sort((a, b) => b.points - a.points || a.item.title.length - b.item.title.length)
    .slice(0, limit)
    .map(({ item }) => {
      const title = item.normalizedNames[0]
      const titleMatches = words.every((word) => title.includes(word))
      return {
        item,
        title: segments(item.title, matches(title, words)),
        snippet: titleMatches
          ? []
          : snippet([...(item.aliases ?? []), item.text].join(' · '), words)
      }
    })
}
