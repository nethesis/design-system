<!--
  Copyright (C) 2026 Nethesis S.r.l.
  SPDX-License-Identifier: GPL-3.0-or-later
-->

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
import { HOME_PAGE, PAGE_GROUPS, RESOURCES, pageHref, type Page } from '../pages'

const props = defineProps<{ current: Page }>()
const emit = defineEmits<{ navigate: [page: Page] }>()

// the sidebar is long: keep the current page visible in it
const root = ref<HTMLElement>()
watch(
  () => props.current,
  async () => {
    await nextTick()
    root.value?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'nearest' })
  },
  { immediate: true }
)

// plain links, so that they can also be opened in a new tab
function follow(event: MouseEvent, page: Page) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return
  }
  event.preventDefault()
  emit('navigate', page)
}
</script>

<template>
  <div
    ref="root"
    class="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-2 pb-6 dark:border-gray-700 dark:bg-gray-950"
  >
    <a
      :href="pageHref(HOME_PAGE)"
      class="flex h-16 shrink-0 items-center rounded-md px-4 text-sm font-medium text-gray-900 focus-visible:outline-2 focus-visible:outline-primary-700 dark:text-gray-50 dark:focus-visible:outline-primary-500"
      @click="follow($event, HOME_PAGE)"
    >
      Nethesis Design System
    </a>
    <nav aria-label="Pages" class="flex flex-1 flex-col">
      <ul role="list" class="flex flex-col gap-y-6">
        <li v-for="(group, index) in PAGE_GROUPS" :key="group.label ?? index">
          <p
            v-if="group.label"
            :id="`nav-group-${index}`"
            class="px-4 pb-2 text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400"
          >
            {{ group.label }}
          </p>
          <ul
            role="list"
            class="space-y-1"
            :aria-labelledby="group.label ? `nav-group-${index}` : undefined"
          >
            <li v-for="page in group.pages" :key="page.id">
              <a
                :href="pageHref(page)"
                :aria-current="page === current ? 'page' : undefined"
                :class="[
                  page === current
                    ? 'border-primary-700 bg-gray-100 text-gray-900 dark:border-primary-500 dark:bg-gray-800 dark:text-gray-50'
                    : 'border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-50',
                  // pages without an icon align their label with the labels of the others
                  page.icon ? 'px-3 py-2' : 'py-1.5 pr-3 pl-11',
                  'flex items-center gap-x-3 rounded-md border-l-4 text-sm leading-6 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-primary-700 dark:focus-visible:outline-primary-500'
                ]"
                @click="follow($event, page)"
              >
                <FontAwesomeIcon
                  v-if="page.icon"
                  :icon="page.icon"
                  class="h-4 w-5 shrink-0"
                  aria-hidden="true"
                />
                {{ page.navLabel ?? page.title }}
              </a>
            </li>
          </ul>
        </li>
        <!-- on small screens the top bar has no room for these links -->
        <li class="sm:hidden">
          <p
            id="nav-group-resources"
            class="px-4 pb-2 text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400"
          >
            Other sources
          </p>
          <ul role="list" class="space-y-1" aria-labelledby="nav-group-resources">
            <li v-for="resource in RESOURCES" :key="resource.href">
              <a
                :href="resource.href"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-x-3 rounded-md border-l-4 border-transparent px-3 py-2 text-sm leading-6 font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-primary-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus-visible:outline-primary-500"
              >
                <FontAwesomeIcon
                  :icon="faArrowUpRightFromSquare"
                  class="h-4 w-5 shrink-0"
                  aria-hidden="true"
                />
                {{ resource.title }}
                <span class="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
    <p class="mt-auto px-4 text-xs leading-5 text-gray-500 dark:text-gray-400">
      To propose a change, open a pull request on
      <a
        href="https://github.com/nethesis/design-system"
        target="_blank"
        rel="noopener noreferrer"
        class="underline hover:text-gray-900 dark:hover:text-gray-50"
        >nethesis/design-system</a
      >.
    </p>
  </div>
</template>
