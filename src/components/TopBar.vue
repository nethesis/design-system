<!--
  Copyright (C) 2026 Nethesis S.r.l.
  SPDX-License-Identifier: GPL-3.0-or-later
-->

<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faArrowUpRightFromSquare, faBars, faMoon, faSun } from '@fortawesome/free-solid-svg-icons'
import { NeTooltip } from '@nethesis/vue-components'
import { useTheme } from '../composables/useTheme'
import { RESOURCES, type Page } from '../pages'
import SearchBox from './SearchBox.vue'

const emit = defineEmits<{ openSidebar: []; navigate: [page: Page, hash: string] }>()
const { isDark, toggleTheme } = useTheme()

const iconButtonClasses =
  'flex rounded-full p-2.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-primary-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus-visible:outline-primary-500'
</script>

<template>
  <div
    class="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 sm:gap-x-6 sm:px-6 lg:px-8 dark:border-gray-700 dark:bg-gray-950"
  >
    <button
      type="button"
      :class="[iconButtonClasses, '-mx-2.5 lg:hidden']"
      @click="emit('openSidebar')"
    >
      <span class="sr-only">Open menu</span>
      <FontAwesomeIcon :icon="faBars" class="size-5" aria-hidden="true" />
    </button>
    <div class="h-6 w-px bg-gray-200 lg:hidden dark:bg-gray-700" aria-hidden="true" />
    <SearchBox @navigate="(page, hash) => emit('navigate', page, hash)" />

    <nav aria-label="Other sources" class="hidden items-center gap-x-6 sm:flex">
      <a
        v-for="resource in RESOURCES"
        :key="resource.href"
        :href="resource.href"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-x-1.5 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 dark:text-gray-300 dark:hover:text-gray-50 dark:focus-visible:outline-primary-500"
      >
        {{ resource.label }}
        <FontAwesomeIcon :icon="faArrowUpRightFromSquare" class="size-3" aria-hidden="true" />
        <span class="sr-only">(opens in a new tab)</span>
      </a>
    </nav>
    <div class="hidden h-6 w-px bg-gray-200 sm:block dark:bg-gray-700" aria-hidden="true" />

    <NeTooltip trigger-event="mouseenter focus" placement="bottom" class="-mr-2.5 flex">
      <template #trigger>
        <button type="button" :class="iconButtonClasses" @click="toggleTheme">
          <span class="sr-only">{{
            isDark ? 'Switch to light theme' : 'Switch to dark theme'
          }}</span>
          <FontAwesomeIcon :icon="isDark ? faSun : faMoon" class="size-5" aria-hidden="true" />
        </button>
      </template>
      <template #content>
        {{ isDark ? 'Switch to light theme' : 'Switch to dark theme' }}
      </template>
    </NeTooltip>
  </div>
</template>
