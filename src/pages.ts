//  Copyright (C) 2026 Nethesis S.r.l.
//  SPDX-License-Identifier: GPL-3.0-or-later

import { defineAsyncComponent, type Component } from 'vue'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faBook,
  faFont,
  faHouse,
  faIcons,
  faLayerGroup,
  faPalette,
  faPenNib,
  faRulerCombined
} from '@fortawesome/free-solid-svg-icons'
import IntroductionView from './components/IntroductionView.vue'
import GuidelinesView from './components/GuidelinesView.vue'
import GlossaryView from './components/GlossaryView.vue'

// The pages of the site, grouped as in the sidebar. The foundations pages
// are loaded when opened, to keep the first download small. The page id is the value
// of the ?page= query parameter; the first page is the home page.

export type Page = {
  id: string
  title: string
  // the sidebar label, when shorter than the title
  navLabel?: string
  description: string
  icon: IconDefinition
  component: Component
}

export type PageGroup = {
  label?: string
  pages: Page[]
}

export const PAGE_GROUPS: PageGroup[] = [
  {
    pages: [
      {
        id: 'introduction',
        title: 'Nethesis Design System',
        navLabel: 'Introduction',
        description: 'Rules shared by the user interfaces of all Nethesis products.',
        icon: faHouse,
        component: IntroductionView
      }
    ]
  },
  {
    label: 'Writing',
    pages: [
      {
        id: 'writing-guidelines',
        title: 'Writing guidelines',
        navLabel: 'Guidelines',
        description:
          'How to write the text of user interfaces: voice and tone, capitalization and punctuation, and the text of buttons, forms, empty states, modals and notifications.',
        icon: faPenNib,
        component: GuidelinesView
      },
      {
        id: 'glossary',
        title: 'Glossary',
        description:
          'Approved terms, with their Italian translations and the terms to avoid. Weblate uses it when translating Nethesis products.',
        icon: faBook,
        component: GlossaryView
      }
    ]
  },
  {
    label: 'Foundations',
    pages: [
      {
        id: 'colors',
        title: 'Colors',
        description:
          'The color tokens of Nethesis user interfaces, for the light and the dark theme, and the palettes they come from.',
        icon: faPalette,
        component: defineAsyncComponent(() => import('./components/ColorsView.vue'))
      },
      {
        id: 'typography',
        title: 'Typography',
        description: 'The typeface, the sizes and the text styles of Nethesis user interfaces.',
        icon: faFont,
        component: defineAsyncComponent(() => import('./components/TypographyView.vue'))
      },
      {
        id: 'iconography',
        title: 'Iconography',
        description:
          'The icon library, the styles and sizes of icons, and the Nethesis custom icons.',
        icon: faIcons,
        component: defineAsyncComponent(() => import('./components/IconographyView.vue'))
      },
      {
        id: 'spacing-and-border',
        title: 'Spacing and border',
        description: 'The spacing scale, the border radius and width, and the focus ring.',
        icon: faRulerCombined,
        component: defineAsyncComponent(() => import('./components/SpacingView.vue'))
      },
      {
        id: 'elevation-and-shadow',
        title: 'Elevation and shadow',
        description: 'Surface levels and shadows that give depth to the interface.',
        icon: faLayerGroup,
        component: defineAsyncComponent(() => import('./components/ElevationView.vue'))
      }
    ]
  }
]

// the other sources of the design system, linked from the top bar
export const RESOURCES = [
  {
    label: 'Storybook',
    title: 'vue-components Storybook',
    href: 'https://nethesis.github.io/vue-components/'
  },
  {
    label: 'Figma',
    title: 'NDS Figma file',
    href: 'https://www.figma.com/design/ZRZzzlqb9GfB9Xdz6iGufh/NDS'
  }
]

export const PAGES = PAGE_GROUPS.flatMap((group) => group.pages)
export const HOME_PAGE = PAGES[0]

export const findPage = (id: string | null) => PAGES.find((page) => page.id === id)

// the address of a page, relative to the site
export const pageHref = (page: Page) =>
  page === HOME_PAGE ? window.location.pathname : `?page=${page.id}`

// The page shown by the current address. Links made before the sidebar used
// ?tab=guidelines, or had no parameter for the glossary, which was the home
// page: a link to a glossary term or a filtered glossary still opens it.
export function pageFromLocation(): Page {
  const params = new URLSearchParams(window.location.search)
  const page = findPage(params.get('page'))
  if (page) return page
  if (params.get('tab') === 'guidelines') return findPage('writing-guidelines')!
  if (window.location.hash.startsWith('#term-') || params.has('q') || params.has('product')) {
    return findPage('glossary')!
  }
  return HOME_PAGE
}
