//  Copyright (C) 2026 Nethesis S.r.l.
//  SPDX-License-Identifier: GPL-3.0-or-later

export type Product =
  | 'all'
  | 'ns8'
  | 'nethsecurity'
  | 'nethvoice'
  | 'nethservice'
  | 'neth360'
  | 'my'

export type GlossaryEntry = {
  id: string
  en: string
  it?: string
  untranslatable?: boolean
  definition: string
  products: Product[]
  avoid?: { en?: string[]; it?: string[] }
  notes?: string
}

export const PRODUCT_LABELS: Record<Product, string> = {
  all: 'All products',
  ns8: 'NethServer 8',
  nethsecurity: 'NethSecurity',
  nethvoice: 'NethVoice',
  nethservice: 'NethService',
  neth360: 'Neth360',
  my: 'My Nethesis'
}

export type IconCategory =
  | 'actions'
  | 'navigation'
  | 'interface'
  | 'status'
  | 'sidebar'
  | 'objects'
  | 'brands'

// an entry of icons.yaml
export type IconEntry = {
  id: string
  meaning: string
  icon: string
  pack: 'fa-solid' | 'ns-solid' | 'ns-brands'
  category: IconCategory
  use: string
  notFor?: string
  avoid?: string[]
  glossary?: string[]
  products?: Product[]
  notes?: string
}

export const ICON_CATEGORIES: { id: IconCategory; title: string; description: string }[] = [
  { id: 'actions', title: 'Actions', description: 'Buttons and menu items that do something.' },
  { id: 'navigation', title: 'Navigation', description: 'Links and buttons that move somewhere else.' },
  {
    id: 'interface',
    title: 'Interface controls',
    description: 'Controls that are part of the interface of every product.'
  },
  { id: 'status', title: 'Status', description: 'Notifications, messages and states of objects.' },
  {
    id: 'sidebar',
    title: 'Sidebar sections',
    description:
      'The sections of the main sidebar: the Light icon when the section is not active, the Solid icon when it is.'
  },
  {
    id: 'objects',
    title: 'Nethesis objects',
    description: 'Objects and actions that only a Nethesis custom icon represents.'
  },
  { id: 'brands', title: 'Brands', description: 'Logos of other companies and services.' }
]

export const ICON_PACK_LABELS: Record<IconEntry['pack'] | 'ns-light', string> = {
  'fa-solid': 'Font Awesome Solid',
  'ns-solid': 'Nethesis Solid',
  'ns-light': 'Nethesis Light',
  'ns-brands': 'Nethesis Brands'
}
