<!--
  Copyright (C) 2026 Nethesis S.r.l.
  SPDX-License-Identifier: GPL-3.0-or-later
-->

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { IconDefinition, IconName, IconPack } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faCheck,
  faLink,
  faMagnifyingGlass,
  faShieldHalved
} from '@fortawesome/free-solid-svg-icons'
import { fas } from '@nethesis/nethesis-solid-svg-icons'
import { fal } from '@nethesis/nethesis-light-svg-icons'
import { fab } from '@nethesis/nethesis-brands-svg-icons'
import {
  NeButton,
  NeEmptyState,
  NeTable,
  NeTableBody,
  NeTableCell,
  NeTableHead,
  NeTableHeadCell,
  NeTableRow,
  NeTextInput
} from '@nethesis/vue-components'
import iconEntries from '../generated/icons.json'
import iconSvgs from '../generated/icon-svgs.json'
import glossary from '../generated/glossary.json'
import { ICON_PACKAGES, ICON_SIZES } from '../foundations'
import { normalize } from '../text'
import { useCopyLink } from '../composables/useCopyLink'
import {
  ICON_CATEGORIES,
  ICON_PACK_LABELS,
  PRODUCT_LABELS,
  type GlossaryEntry,
  type IconEntry
} from '../types'

const icons = (pack: IconPack) =>
  Object.values(pack)
    .map((icon) => ({ name: icon.iconName as string, icon: icon as IconDefinition }))
    .sort((a, b) => a.name.localeCompare(b.name))

const CUSTOM_ICONS = [
  {
    id: 'custom-solid',
    pack: 'ns-solid',
    title: 'Solid',
    packageName: '@nethesis/nethesis-solid-svg-icons',
    icons: icons(fas)
  },
  {
    id: 'custom-light',
    pack: 'ns-light',
    title: 'Light',
    packageName: '@nethesis/nethesis-light-svg-icons',
    icons: icons(fal)
  },
  {
    id: 'custom-brands',
    pack: 'ns-brands',
    title: 'Brands',
    packageName: '@nethesis/nethesis-brands-svg-icons',
    icons: icons(fab)
  }
]

// the icon dictionary of icons.yaml

const entries = iconEntries as IconEntry[]
const glossaryTerms = new Map((glossary as GlossaryEntry[]).map((term) => [term.id, term.en]))

// the icons are generated with their paths, so the page does not load the
// whole Font Awesome pack
const svgs: Record<string, { width: number; height: number; path: string }> = iconSvgs
function svg(pack: string, name: string): IconDefinition {
  const { width, height, path } = svgs[`${pack}:${name}`]
  return { prefix: 'fas', iconName: name as IconName, icon: [width, height, [], '', path] }
}

const textFilter = ref('')

const searchText = (entry: IconEntry) =>
  normalize(
    [
      entry.meaning,
      entry.icon,
      entry.use,
      entry.notFor ?? '',
      entry.notes ?? '',
      ...(entry.avoid ?? []),
      ...(entry.products ?? []).map((product) => PRODUCT_LABELS[product])
    ].join(' ')
  )

const categories = computed(() => {
  const query = normalize(textFilter.value.trim())
  return ICON_CATEGORIES.map((category) => ({
    ...category,
    entries: entries.filter(
      (entry) =>
        entry.category === category.id && (!query || searchText(entry).includes(query))
    )
  })).filter((category) => category.entries.length)
})

const productsText = (entry: IconEntry) =>
  entry.products?.map((product) => PRODUCT_LABELS[product]).join(', ')

const { copiedId, copyLink } = useCopyLink('iconography')

// a link like #icon-delete highlights that entry
const highlightedId = ref('')
const readHash = () => {
  highlightedId.value = window.location.hash.startsWith('#icon-')
    ? window.location.hash.slice('#icon-'.length)
    : ''
}
onMounted(() => {
  readHash()
  window.addEventListener('hashchange', readHash)
})
onBeforeUnmount(() => window.removeEventListener('hashchange', readHash))

// the meanings of each custom icon, by "<pack>:<name>"
const customMeanings = new Map<string, IconEntry[]>()
for (const entry of entries) {
  const keys = [`${entry.pack}:${entry.icon}`]
  if (entry.category === 'sidebar') keys.push(`ns-light:${entry.icon}`)
  for (const key of keys) customMeanings.set(key, [...(customMeanings.get(key) ?? []), entry])
}

const PACKAGES = ICON_PACKAGES.map(({ name, version }) => `"${name}": "${version}"`).join(',\n')
</script>

<template>
  <div class="foundation">
    <h2 id="icon-library">Icon library</h2>
    <p>
      Icons come from the free set of
      <a
        href="https://fontawesome.com/search?ic=free&s=solid"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary-700 underline dark:text-primary-500"
        >Font Awesome</a
      >, in the Solid style. When Font Awesome has no suitable icon, use a Nethesis custom icon:
      they follow the same design principles, so they fit with the rest.
    </p>
    <p>
      In code, the free icons come from <code>@fortawesome/free-solid-svg-icons</code> and the
      custom icons from the Nethesis packages, installed from GitHub. Show them with the
      <code>FontAwesomeIcon</code> component of <code>@fortawesome/vue-fontawesome</code>.
    </p>
    <pre
      class="mb-4 max-w-3xl overflow-x-auto rounded-md bg-gray-100 p-4 text-[0.8125rem] leading-5 dark:bg-gray-800"
    ><code>{{ PACKAGES }}</code></pre>
    <p>
      An icon next to a text label is decorative: hide it from screen readers with
      <code>aria-hidden="true"</code>. An icon without text needs a label and a tooltip, as the
      <a
        href="?page=writing-guidelines#buttons-and-actions"
        class="text-primary-700 underline dark:text-primary-500"
        >writing guidelines</a
      >
      explain for icon buttons.
    </p>

    <h2 id="style">Style</h2>
    <div class="grid max-w-3xl gap-4 sm:grid-cols-2">
      <div
        class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-950"
      >
        <FontAwesomeIcon
          :icon="fas.faUnitGroups"
          class="mb-3 size-6 text-gray-900 dark:text-gray-50"
          aria-hidden="true"
        />
        <p class="mb-1 font-medium text-gray-900 dark:text-gray-50">Solid</p>
        <p class="mb-0">The standard style, used by every component.</p>
      </div>
      <div
        class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-950"
      >
        <FontAwesomeIcon
          :icon="fal.faUnitGroups"
          class="mb-3 size-6 text-gray-900 dark:text-gray-50"
          aria-hidden="true"
        />
        <p class="mb-1 font-medium text-gray-900 dark:text-gray-50">Light</p>
        <p class="mb-0">
          Only for custom icons, and only for the inactive sections of the main sidebar. The active
          section shows the Solid version of the same icon.
        </p>
      </div>
    </div>

    <h2 id="size">Size</h2>
    <div class="table-frame">
      <table class="ds-table">
        <thead>
          <tr>
            <th>Size</th>
            <th>Class</th>
            <th>Use</th>
            <th>Example</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="size in ICON_SIZES" :key="size.px">
            <td class="whitespace-nowrap">{{ size.px }} px</td>
            <td>
              <code>{{ size.className }}</code>
            </td>
            <td class="min-w-64">{{ size.use }}</td>
            <td>
              <FontAwesomeIcon
                :icon="faShieldHalved"
                :class="[size.className, 'text-primary-700 dark:text-primary-500']"
                aria-hidden="true"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2 id="icon-meanings">Meanings</h2>
    <p>
      Use the same icon for the same meaning in every product. When a meaning is missing, choose a
      Font Awesome Solid icon that no other meaning uses, and ask the UX team to add it here.
    </p>
    <NeTextInput
      v-model="textFilter"
      is-search
      placeholder="Filter icons"
      clear-search-label="Clear search"
      class="mb-6 max-w-48 sm:max-w-sm"
    />
    <NeEmptyState
      v-if="!categories.length"
      :icon="faMagnifyingGlass"
      title="No icons found"
      description="Try different or fewer words."
      class="bg-white dark:bg-gray-950"
    >
      <NeButton kind="tertiary" size="lg" @click="textFilter = ''">Clear filter</NeButton>
    </NeEmptyState>
    <template v-for="category in categories" :key="category.id">
      <h3 :id="`icons-${category.id}`">{{ category.title }}</h3>
      <p>{{ category.description }}</p>
      <NeTable :aria-label="`${category.title} icons`" card-breakpoint="xl" class="mb-8">
        <NeTableHead>
          <!-- the same widths in every table, so the columns line up -->
          <NeTableHeadCell class="w-56">Meaning</NeTableHeadCell>
          <NeTableHeadCell class="w-72">Icon</NeTableHeadCell>
          <NeTableHeadCell>When to use</NeTableHeadCell>
          <NeTableHeadCell class="w-52">Don't use</NeTableHeadCell>
        </NeTableHead>
        <NeTableBody>
          <NeTableRow
            v-for="entry in category.entries"
            :id="`icon-${entry.id}`"
            :key="entry.id"
            :class="[
              'scroll-mt-20',
              { 'bg-primary-100 dark:bg-primary-900': entry.id === highlightedId }
            ]"
          >
            <NeTableCell data-label="Meaning">
              <!-- one element: in the card layout each child of a cell takes a grid column -->
              <div>
                <div class="flex items-center gap-1">
                  <span class="font-medium">{{ entry.meaning }}</span>
                  <NeButton
                    kind="tertiary"
                    size="xs"
                    :title="copiedId === entry.id ? 'Link copied' : 'Copy link'"
                    @click="copyLink(entry.id, `icon-${entry.id}`)"
                  >
                    <FontAwesomeIcon
                      :icon="copiedId === entry.id ? faCheck : faLink"
                      class="size-3"
                      aria-hidden="true"
                    />
                    <span class="sr-only">
                      {{ copiedId === entry.id ? 'Link copied' : `Copy link to ${entry.meaning}` }}
                    </span>
                  </NeButton>
                </div>
                <p v-if="entry.products" class="mb-0 text-xs text-gray-500 dark:text-gray-400">
                  {{ productsText(entry) }}
                </p>
              </div>
            </NeTableCell>
            <NeTableCell data-label="Icon">
              <div class="flex items-center gap-3">
                <FontAwesomeIcon
                  v-if="entry.category === 'sidebar'"
                  :icon="svg('ns-light', entry.icon)"
                  class="size-5 text-gray-900 dark:text-gray-50"
                  aria-hidden="true"
                />
                <FontAwesomeIcon
                  :icon="svg(entry.pack, entry.icon)"
                  class="size-5 text-gray-900 dark:text-gray-50"
                  aria-hidden="true"
                />
                <div>
                  <code class="whitespace-nowrap">{{ entry.icon }}</code>
                  <p class="mb-0 text-xs text-gray-500 dark:text-gray-400">
                    {{
                      entry.category === 'sidebar'
                        ? `${ICON_PACK_LABELS['ns-light']} and ${ICON_PACK_LABELS[entry.pack]}`
                        : ICON_PACK_LABELS[entry.pack]
                    }}
                  </p>
                </div>
              </div>
            </NeTableCell>
            <NeTableCell data-label="When to use">
              <div class="max-w-md whitespace-normal wrap-anywhere">
                {{ entry.use }}
                <p v-if="entry.notFor" class="mt-1 mb-0">Not for: {{ entry.notFor }}</p>
                <p v-if="entry.notes" class="mt-1 mb-0 text-gray-500 dark:text-gray-400">
                  {{ entry.notes }}
                </p>
                <p v-if="entry.glossary" class="mt-1 mb-0">
                  Glossary:
                  <template v-for="(term, index) in entry.glossary" :key="term">
                    <a
                      :href="`?page=glossary#term-${term}`"
                      class="text-primary-700 underline dark:text-primary-500"
                      >{{ glossaryTerms.get(term) }}</a
                    ><template v-if="index < entry.glossary.length - 1">, </template>
                  </template>
                </p>
              </div>
            </NeTableCell>
            <NeTableCell data-label="Don't use">
              <ul v-if="entry.avoid" class="mb-0 flex flex-col gap-2">
                <li v-for="icon in entry.avoid" :key="icon" class="flex items-center gap-2">
                  <FontAwesomeIcon
                    :icon="svg('fa-solid', icon)"
                    class="size-4 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                  />
                  <code class="whitespace-nowrap">{{ icon }}</code>
                </li>
              </ul>
            </NeTableCell>
          </NeTableRow>
        </NeTableBody>
      </NeTable>
    </template>

    <h2 id="custom-icons">Custom icons</h2>
    <p>
      The icons of the Nethesis packages. Flags and application icons are only in the
      <a
        href="https://www.figma.com/design/ZRZzzlqb9GfB9Xdz6iGufh/NDS?node-id=25-8058"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary-700 underline dark:text-primary-500"
        >Iconography page of the NDS Figma file</a
      >.
    </p>
    <template v-for="group in CUSTOM_ICONS" :key="group.id">
      <h3 :id="group.id">{{ group.title }}</h3>
      <p>
        <code>{{ group.packageName }}</code>
      </p>
      <ul class="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3">
        <li
          v-for="item in group.icons"
          :key="item.name"
          class="flex flex-col items-center gap-y-3 rounded-md border border-gray-200 bg-white px-2 py-4 text-center dark:border-gray-700 dark:bg-gray-950"
        >
          <FontAwesomeIcon
            :icon="item.icon"
            class="size-6 text-gray-900 dark:text-gray-50"
            aria-hidden="true"
          />
          <span class="font-mono text-xs break-all">{{ item.name }}</span>
          <ul
            v-if="customMeanings.has(`${group.pack}:${item.name}`)"
            class="mb-0 flex flex-col gap-1 text-xs"
          >
            <li v-for="entry in customMeanings.get(`${group.pack}:${item.name}`)" :key="entry.id">
              <a
                :href="`#icon-${entry.id}`"
                class="text-primary-700 underline dark:text-primary-500"
                >{{
                  entry.category === 'sidebar' && group.pack !== 'ns-light'
                    ? `Sidebar: ${entry.meaning}`
                    : entry.meaning
                }}</a
              >
            </li>
          </ul>
          <span v-else class="text-xs text-gray-500 italic dark:text-gray-400">No meaning yet</span>
        </li>
      </ul>
    </template>
  </div>
</template>
