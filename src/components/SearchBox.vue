<!--
  Copyright (C) 2026 Nethesis S.r.l.
  SPDX-License-Identifier: GPL-3.0-or-later
-->

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef } from 'vue'
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { NeEmptyState } from '@nethesis/vue-components'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import type { Page } from '../pages'
import type { SearchItem } from '../search'

const emit = defineEmits<{ navigate: [page: Page, hash: string] }>()

const query = ref('')

// the index is loaded the first time the search gets the focus
const searchModule = shallowRef<typeof import('../search')>()
async function loadSearch() {
  searchModule.value ??= await import('../search')
}

const results = computed(() => searchModule.value?.search(query.value) ?? [])

function select(item: SearchItem | null) {
  if (!item) return
  query.value = ''
  ;(document.activeElement as HTMLElement | null)?.blur()
  emit('navigate', item.page, item.hash)
}

// "/" and Ctrl+K (⌘K on macOS) move the focus to the search
function onKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement
  const typing =
    target.isContentEditable || ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)
  const slash = event.key === '/' && !typing && !event.ctrlKey && !event.metaKey && !event.altKey
  const ctrlK = event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey) && !event.altKey
  if (slash || ctrlK) {
    event.preventDefault()
    document.getElementById('site-search')?.focus()
  }
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Combobox
    as="div"
    class="relative flex min-w-0 flex-1 items-center self-stretch"
    :model-value="null"
    nullable
    @update:model-value="select"
  >
    <label for="site-search" class="sr-only">Search</label>
    <FontAwesomeIcon
      :icon="faMagnifyingGlass"
      class="pointer-events-none absolute left-0 size-4 text-gray-700 dark:text-gray-200"
      aria-hidden="true"
    />
    <ComboboxInput
      id="site-search"
      type="search"
      autocomplete="off"
      spellcheck="false"
      placeholder="Search"
      aria-keyshortcuts="/ Control+K Meta+K"
      class="h-full w-full min-w-0 border-0 bg-transparent py-0 pr-0 pl-7 text-base leading-5 sm:text-sm text-gray-900 placeholder:text-gray-400 focus:ring-0 focus:outline-none dark:text-gray-50 dark:placeholder:text-gray-500 [&::-webkit-search-cancel-button]:hidden"
      :display-value="() => query"
      @change="query = $event.target.value"
      @focus="loadSearch"
    />

    <div
      v-if="query.trim() && searchModule"
      class="fixed inset-x-4 top-16 z-50 sm:absolute sm:inset-x-auto sm:top-full sm:left-0 sm:w-full sm:max-w-2xl"
    >
      <ComboboxOptions
        v-if="results.length"
        aria-label="Search results"
        class="max-h-[min(32rem,70vh)] overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-gray-200 focus:outline-hidden dark:bg-gray-950 dark:ring-gray-700"
      >
        <ComboboxOption
          v-for="result in results"
          :key="`${result.item.page.id}${result.item.hash}${result.item.title}`"
          v-slot="{ active }"
          :value="result.item"
          as="template"
        >
          <li
            :class="[
              'flex cursor-pointer gap-x-3 px-3 py-2 select-none',
              active
                ? 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-50'
                : 'text-gray-700 dark:text-gray-200'
            ]"
          >
            <FontAwesomeIcon
              :icon="result.item.page.icon"
              class="mt-0.5 size-4 shrink-0 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
            />
            <div class="min-w-0">
              <p class="truncate">
                <template v-for="(segment, index) in result.title" :key="index">
                  <mark
                    v-if="segment.match"
                    class="bg-transparent font-medium text-primary-700 dark:text-primary-500"
                    >{{ segment.text }}</mark
                  ><template v-else>{{ segment.text }}</template>
                </template>
              </p>
              <p class="truncate text-xs leading-5 text-gray-500 dark:text-gray-400">
                {{ result.item.context.join(' › ') }}
              </p>
              <p
                v-if="result.snippet.length"
                class="line-clamp-2 text-xs leading-5 text-gray-500 dark:text-gray-400"
              >
                <template v-for="(segment, index) in result.snippet" :key="index">
                  <mark
                    v-if="segment.match"
                    class="bg-transparent font-medium text-gray-900 dark:text-gray-50"
                    >{{ segment.text }}</mark
                  ><template v-else>{{ segment.text }}</template>
                </template>
              </p>
            </div>
          </li>
        </ComboboxOption>
      </ComboboxOptions>
      <div
        v-else
        role="status"
        class="overflow-hidden rounded-md shadow-lg ring-1 ring-gray-200 dark:ring-gray-700"
      >
        <NeEmptyState
          :icon="faMagnifyingGlass"
          title="No results found"
          description="Try different or fewer words."
          class="bg-white dark:bg-gray-950"
        />
      </div>
    </div>
  </Combobox>
</template>
