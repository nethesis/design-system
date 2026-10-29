//  Copyright (C) 2026 Nethesis S.r.l.
//  SPDX-License-Identifier: GPL-3.0-or-later

import colors from '../data/colors.json' with { type: 'json' }

// Color tokens of the NDS Figma file, exported to data/colors.json by
// scripts/figma/export-colors.js and scripts/import-colors.mjs.

export type ColorValue = { ref: string | null; hex: string }
export type SemanticColor = {
  name: string
  light: ColorValue
  dark: ColorValue
  description: string
}

export const EXPORTED_AT: string = colors.exportedAt
export const PRIMITIVES: { name: string; hex: string }[] = colors.primitives
export const SEMANTIC: SemanticColor[] = colors.semantic

// the groups of semantic tokens, in the order of the Figma Colors page
export const GROUPS = [
  {
    name: 'Product Primary',
    description:
      'The main color of each product, for buttons, checkboxes, radio buttons and other interactive elements.'
  },
  {
    name: 'Text',
    description:
      'All the text of the interface: headings, titles, body text, placeholders, button labels.'
  },
  {
    name: 'Elevation',
    description: 'The backgrounds of the interface: page, top bar, sidebar, cards.'
  },
  { name: 'Icon', description: 'Icons, by role.' },
  {
    name: 'Surface',
    description: 'The other surfaces, by role: inputs, badges, notifications, buttons.'
  },
  { name: 'Border', description: 'Rings and accent borders of components.' },
  { name: 'Utility', description: 'Colors for special cases, such as pulsing indicators.' }
]

// the anchor of a group in the Colors page, such as tokens-product-primary
export const groupAnchor = (name: string) => `tokens-${name.toLowerCase().replace(/ /g, '-')}`

// the palette of each product: in code it is the primary palette
const PRODUCT_PALETTES: Record<string, string> = {
  NethSecurity: 'cyan',
  NethVoice: 'emerald',
  NethLink: 'blue',
  NethService: 'orange',
  NethSpot: 'purple',
  'Website and My Nethesis': 'sky',
  MyNethesis: 'sky'
}

// The Tailwind color of a primitive, such as gray-400, white or gray-500/10.
// Nethesis brand colors have no Tailwind color.
export function tailwindColor(ref: string | null): string | null {
  if (!ref) return null
  let match = ref.match(/^([A-Z][a-z]+)\/(\d+)$/)
  if (match && match[1] !== 'Nethesis') return `${match[1].toLowerCase()}-${match[2]}`
  if (ref === 'White' || ref === 'Black') return ref.toLowerCase()
  // "Black 5%", "Gray 500 10%"
  match = ref.match(/^([A-Z][a-z]+)(?: (\d+))? (\d+)%$/)
  if (match) return `${match[1].toLowerCase()}${match[2] ? `-${match[2]}` : ''}/${match[3]}`
  // "Opacity/Gray-500 A75"
  match = ref.match(/^Opacity\/([A-Z][a-z]+)-(\d+) A(\d+)$/)
  if (match) return `${match[1].toLowerCase()}-${match[2]}/${match[3]}`
  return null
}

// The Tailwind utility a token is for: text and icon tokens color text,
// elevation and surface tokens color backgrounds, and so on.
function utility(name: string): string | null {
  if (name.startsWith('Text/') || name.startsWith('Icon/')) return 'text'
  if (name.startsWith('Elevation/') || name.startsWith('Surface/')) return 'bg'
  if (name.startsWith('Border/Ring/')) return 'ring'
  if (name.startsWith('Border/')) return 'border'
  return null
}

// Product Primary and product link tokens use the primary palette in code,
// which each product maps to its own palette.
function primaryProduct(name: string): string | null {
  if (!name.startsWith('Product Primary/') && !name.startsWith('Text/Link/')) return null
  return Object.keys(PRODUCT_PALETTES).find((product) => name.includes(product)) ?? null
}

function codeColor(token: SemanticColor, value: ColorValue): string | null {
  const color = tailwindColor(value.ref)
  const product = primaryProduct(token.name)
  if (color && product && color.startsWith(`${PRODUCT_PALETTES[product]}-`)) {
    return color.replace(/^[a-z]+-/, 'primary-')
  }
  return color
}

// The Tailwind colors of a token in code, primary-* for the product palettes,
// and its classes for both themes, such as "text-gray-400 dark:text-gray-500".
// classes is null when the utility depends on the component or when a value
// has no Tailwind color.
export function tokenCode(token: SemanticColor) {
  const light = codeColor(token, token.light)
  const dark = codeColor(token, token.dark)
  const prefix = utility(token.name)
  const classes = light && dark && prefix ? `${prefix}-${light} dark:${prefix}-${dark}` : null
  return { light, dark, classes }
}

// The classes of a token for the Colors page: the bare colors when the
// utility depends on the component. Null when a value has no Tailwind color.
export function tailwindClasses(token: SemanticColor): string | null {
  const { light, dark, classes } = tokenCode(token)
  if (!light || !dark) return null
  return classes ?? `${light} · dark: ${dark}`
}

// primitives grouped by palette, for the swatches
export function palettes() {
  const groups = new Map<string, { shade: string; name: string; hex: string }[]>()
  const others: { name: string; hex: string }[] = []
  for (const color of PRIMITIVES) {
    const match = color.name.match(/^([A-Z][a-z]+)\/(\d+)$/)
    if (match && match[1] !== 'Nethesis') {
      const list = groups.get(match[1]) ?? []
      list.push({ shade: match[2], ...color })
      groups.set(match[1], list)
    } else {
      others.push(color)
    }
  }
  for (const list of groups.values()) list.sort((a, b) => Number(a.shade) - Number(b.shade))
  return { palettes: [...groups.entries()], others }
}
