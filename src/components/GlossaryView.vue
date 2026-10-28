<!--
  Copyright (C) 2026 Nethesis S.r.l.
  SPDX-License-Identifier: GPL-3.0-or-later
-->

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import {
  NeButton,
  NeCheckbox,
  NeDropdownFilterV2,
  NeEmptyState,
  NeTable,
  NeTableBody,
  NeTableCell,
  NeTableHead,
  NeTableHeadCell,
  NeTableRow,
  NeTextInput,
  type NeDropdownFilterV2Option
} from '@nethesis/vue-components'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faBook,
  faCheck,
  faCircleXmark,
  faLink,
  faMagnifyingGlass
} from '@fortawesome/free-solid-svg-icons'
import glossary from '../generated/glossary.json'
import { PRODUCT_LABELS, type GlossaryEntry, type Product } from '../types'
import { REVIEW_LABELS, useReview, type ReviewState } from '../composables/useReview'
import { useCopyLink } from '../composables/useCopyLink'
import { normalize } from '../text'

const entries = [...(glossary as GlossaryEntry[])].sort((a, b) => a.en.localeCompare(b.en))

const productOptions: NeDropdownFilterV2Option[] = (
  Object.keys(PRODUCT_LABELS) as Product[]
)
  .filter((product) => product !== 'all')
  .map((product) => ({ id: product, label: PRODUCT_LABELS[product] }))

// review marks, in development only: see composables/useReview.ts
const review = useReview()

const reviewOptions: NeDropdownFilterV2Option[] = (
  Object.keys(REVIEW_LABELS) as ReviewState[]
).map((state) => ({ id: state, label: REVIEW_LABELS[state] }))

// filters are kept in the query string, so a filtered view can be shared
const params = new URLSearchParams(window.location.search)
const textFilter = ref(params.get('q') ?? '')
const productFilter = ref(
  productOptions.filter((o) => params.getAll('product').includes(o.id))
)
const reviewFilter = ref(
  review.enabled ? reviewOptions.filter((o) => params.getAll('review').includes(o.id)) : []
)

watch([textFilter, productFilter, reviewFilter], () => {
  const url = new URL(window.location.href)
  url.searchParams.delete('q')
  url.searchParams.delete('product')
  url.searchParams.delete('review')
  if (textFilter.value) url.searchParams.set('q', textFilter.value)
  productFilter.value.forEach((o) => url.searchParams.append('product', o.id))
  reviewFilter.value.forEach((o) => url.searchParams.append('review', o.id))
  window.history.replaceState(null, '', url)
})

const searchText = (entry: GlossaryEntry) =>
  normalize(
    [
      entry.en,
      entry.it ?? '',
      entry.definition,
      entry.notes ?? '',
      ...(entry.avoid?.en ?? []),
      ...(entry.avoid?.it ?? [])
    ].join(' ')
  )

const filteredEntries = computed(() => {
  const query = normalize(textFilter.value.trim())
  const products = productFilter.value.map((o) => o.id)
  const reviewStates = reviewFilter.value.map((o) => o.id)

  return entries.filter(
    (entry) =>
      (!query || searchText(entry).includes(query)) &&
      (!products.length ||
        entry.products.includes('all') ||
        entry.products.some((p) => products.includes(p))) &&
      (!reviewStates.length || reviewStates.includes(review.reviewState(entry)))
  )
})

const isFiltered = computed(
  () => !!textFilter.value || !!productFilter.value.length || !!reviewFilter.value.length
)

function resetFilters() {
  textFilter.value = ''
  productFilter.value = []
  reviewFilter.value = []
}

const reviewedCount = computed(
  () => entries.filter((entry) => review.reviewState(entry) === 'reviewed').length
)

const productsText = (entry: GlossaryEntry) =>
  entry.products.map((product) => PRODUCT_LABELS[product]).join(', ')

const LANGUAGE_NAMES = { en: 'English', it: 'Italian' } as const
type Language = keyof typeof LANGUAGE_NAMES

// terms to avoid with their languages: a word avoided in both languages,
// such as "App", is listed once
function avoidTerms(entry: GlossaryEntry) {
  const terms = new Map<string, Language[]>()
  for (const language of Object.keys(LANGUAGE_NAMES) as Language[]) {
    for (const term of entry.avoid?.[language] ?? []) {
      terms.set(term, [...(terms.get(term) ?? []), language])
    }
  }
  return [...terms].map(([term, languages]) => ({ term, languages }))
}

// a link like #term-delete highlights and scrolls to that term
const highlightedId = ref('')

function readHash() {
  highlightedId.value = window.location.hash.startsWith('#term-')
    ? window.location.hash.slice('#term-'.length)
    : ''
}

const { copiedId, copyLink } = useCopyLink('glossary')

onMounted(async () => {
  readHash()
  window.addEventListener('hashchange', readHash)
  if (highlightedId.value) {
    await nextTick()
    document.getElementById(`term-${highlightedId.value}`)?.scrollIntoView({ block: 'center', behavior: 'instant' })
  }
})
</script>

<template>
  <div>
    <NeEmptyState
      v-if="!entries.length"
      :icon="faBook"
      title="No terms"
      description="Approved terms will appear here."
      class="bg-white dark:bg-gray-950"
    />
    <template v-else>
      <div class="mb-6 flex flex-wrap items-center gap-4">
        <NeTextInput
          v-model="textFilter"
          is-search
          placeholder="Filter terms"
          clear-search-label="Clear"
          class="max-w-48 sm:max-w-sm"
        />
        <NeDropdownFilterV2
          v-model="productFilter"
          kind="checkbox"
          label="Product"
          :options="productOptions"
          clear-filter-label="Clear selection"
          open-menu-aria-label="Open filter"
          no-options-label="No options"
          more-options-hidden-label="Continue typing to show more options"
          clear-search-label="Clear"
        />
        <NeDropdownFilterV2
          v-if="review.enabled"
          v-model="reviewFilter"
          kind="checkbox"
          label="Review"
          :options="reviewOptions"
          clear-filter-label="Clear selection"
          open-menu-aria-label="Open filter"
          no-options-label="No options"
          more-options-hidden-label="Continue typing to show more options"
          clear-search-label="Clear"
        />
        <NeButton v-if="isFiltered" kind="tertiary" @click="resetFilters">Reset filters</NeButton>
        <span v-if="review.enabled" class="text-sm text-gray-500 dark:text-gray-400 lg:ml-auto">
          {{ reviewedCount }} of {{ entries.length }} reviewed
        </span>
      </div>
      <NeEmptyState
        v-if="!filteredEntries.length"
        :icon="faMagnifyingGlass"
        title="No terms found"
        description="Try changing your search filters."
        class="bg-white dark:bg-gray-950"
      >
        <NeButton kind="tertiary" size="lg" @click="resetFilters">Reset filters</NeButton>
      </NeEmptyState>
      <NeTable v-else aria-label="Glossary" card-breakpoint="xl">
        <NeTableHead>
          <NeTableHeadCell>English</NeTableHeadCell>
          <NeTableHeadCell>Italian</NeTableHeadCell>
          <NeTableHeadCell>Definition</NeTableHeadCell>
          <NeTableHeadCell>Products</NeTableHeadCell>
          <NeTableHeadCell>Don't use</NeTableHeadCell>
        </NeTableHead>
        <NeTableBody>
          <NeTableRow
            v-for="entry in filteredEntries"
            :id="`term-${entry.id}`"
            :key="entry.id"
            :class="[
              'scroll-mt-20',
              { 'bg-primary-100 dark:bg-primary-900': entry.id === highlightedId }
            ]"
          >
            <NeTableCell data-label="English">
              <div class="flex items-center gap-1">
                <span class="font-medium">{{ entry.en }}</span>
                <NeButton
                  kind="tertiary"
                  size="xs"
                  :title="copiedId === entry.id ? 'Link copied' : 'Copy link'"
                  @click="copyLink(entry.id, `term-${entry.id}`)"
                >
                  <FontAwesomeIcon
                    :icon="copiedId === entry.id ? faCheck : faLink"
                    class="size-3"
                    aria-hidden="true"
                  />
                  <span class="sr-only">
                    {{ copiedId === entry.id ? 'Link copied' : `Copy link to ${entry.en}` }}
                  </span>
                </NeButton>
              </div>
              <div v-if="review.enabled" class="mt-2">
                <NeCheckbox
                  :id="`review-${entry.id}`"
                  :model-value="review.reviewState(entry) === 'reviewed'"
                  label="Reviewed"
                  @update:model-value="review.setReviewed(entry, $event)"
                />
                <p
                  v-if="review.reviewState(entry) === 'changed'"
                  class="mt-1 text-xs text-amber-700 dark:text-amber-500"
                >
                  Changed since review
                </p>
              </div>
            </NeTableCell>
            <NeTableCell data-label="Italian">
              <span v-if="entry.untranslatable" class="text-gray-500 italic dark:text-gray-400">
                Keep in English
              </span>
              <template v-else>{{ entry.it }}</template>
            </NeTableCell>
            <NeTableCell data-label="Definition">
              <div class="max-w-md whitespace-normal wrap-anywhere">
                {{ entry.definition }}
                <p v-if="entry.notes" class="mt-1 text-gray-500 dark:text-gray-400">
                  {{ entry.notes }}
                </p>
              </div>
            </NeTableCell>
            <NeTableCell data-label="Products">{{ productsText(entry) }}</NeTableCell>
            <NeTableCell data-label="Don't use">
              <ul class="flex flex-col gap-2">
                <li
                  v-for="{ term, languages } in avoidTerms(entry)"
                  :key="term"
                  class="flex items-start gap-1.5"
                >
                  <FontAwesomeIcon
                    :icon="faCircleXmark"
                    class="mt-0.5 size-4 shrink-0 text-rose-500 dark:text-rose-400"
                    aria-hidden="true"
                  />
                  <!-- no space before the language label, so it never wraps alone -->
                  <span>
                    {{ term
                    }}<span
                      class="ml-1 text-xs whitespace-nowrap text-gray-500 uppercase dark:text-gray-400"
                      aria-hidden="true"
                      >{{ languages.join(' · ') }}</span
                    >
                    <span class="sr-only">
                      ({{ languages.map((language) => LANGUAGE_NAMES[language]).join(', ') }})
                    </span>
                  </span>
                </li>
              </ul>
            </NeTableCell>
          </NeTableRow>
        </NeTableBody>
      </NeTable>
    </template>
  </div>
</template>
