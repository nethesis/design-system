<!--
  Copyright (C) 2026 Nethesis S.r.l.
  SPDX-License-Identifier: GPL-3.0-or-later
-->

<script setup lang="ts">
import { computed, ref } from 'vue'
import { NeButton, NeEmptyState, NeTextInput } from '@nethesis/vue-components'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import {
  EXPORTED_AT,
  GROUPS,
  groupAnchor,
  SEMANTIC,
  palettes,
  tailwindClasses,
  tailwindColor,
  type ColorValue
} from '../colors'
import { tokenAnchor } from '../text'

const textFilter = ref('')
const query = computed(() => textFilter.value.trim().toLowerCase())

// tokens matching the filter, by name, color reference, hex value or class
const groups = computed(() =>
  GROUPS.map((group) => ({
    ...group,
    tokens: SEMANTIC.filter((token) => token.name.startsWith(`${group.name}/`))
      .map((token) => ({
        ...token,
        shortName: token.name.slice(group.name.length + 1),
        classes: tailwindClasses(token)
      }))
      .filter((token) =>
        [
          token.name,
          token.light.ref,
          token.light.hex,
          token.dark.ref,
          token.dark.hex,
          token.classes
        ].some((text) => text?.toLowerCase().includes(query.value))
      )
  })).filter((group) => group.tokens.length)
)

const { palettes: primitivePalettes, others: otherPrimitives } = palettes()

const label = (value: ColorValue) => value.ref ?? value.hex
</script>

<template>
  <div class="foundation">
    <h2 id="tokens">Tokens</h2>
    <p>
      Use the semantic tokens, not the primitive colors: each token says what a color is for, and
      has a value for the light theme and one for the dark theme. The classes column gives the
      Tailwind CSS classes that reproduce a token in both themes.
    </p>
    <p>
      In code, the primary palette is the palette of the product, so the Product Primary and product
      link tokens use <code>primary-*</code> classes. Tokens without classes use a color that is not
      in Tailwind CSS.
    </p>
    <p class="text-xs text-gray-500 dark:text-gray-400">
      Exported from the NDS Figma file on {{ EXPORTED_AT }}.
    </p>

    <div class="mt-6 mb-2">
      <NeTextInput
        v-model="textFilter"
        is-search
        placeholder="Filter tokens"
        clear-search-label="Clear search"
        class="max-w-sm"
      />
    </div>

    <NeEmptyState
      v-if="!groups.length"
      :icon="faMagnifyingGlass"
      title="No tokens found"
      description="Try changing your search filters."
      class="mt-6 bg-white dark:bg-gray-950"
    >
      <NeButton kind="tertiary" size="lg" @click="textFilter = ''">Reset filters</NeButton>
    </NeEmptyState>

    <template v-for="group in groups" :key="group.name">
      <h3 :id="groupAnchor(group.name)">{{ group.name }}</h3>
      <p>{{ group.description }}</p>
      <div class="overflow-x-auto">
        <table class="ds-table">
          <thead>
            <tr>
              <th>Token</th>
              <th>Light theme</th>
              <th>Dark theme</th>
              <th>Classes</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="token in group.tokens"
              :id="tokenAnchor(token.name)"
              :key="token.name"
              class="scroll-mt-20"
            >
              <td class="min-w-56">
                <span class="text-gray-900 dark:text-gray-50">{{ token.shortName }}</span>
                <span
                  v-if="token.description"
                  class="block text-xs text-gray-500 dark:text-gray-400"
                >
                  {{ token.description }}
                </span>
              </td>
              <td v-for="(value, index) in [token.light, token.dark]" :key="index" class="min-w-44">
                <span class="flex items-center gap-x-3">
                  <span
                    class="size-8 shrink-0 rounded-md border border-gray-300 dark:border-gray-600"
                    :style="{ backgroundColor: value.hex }"
                  />
                  <span class="leading-5">
                    {{ label(value) }}
                    <span class="block text-xs text-gray-500 dark:text-gray-400">{{
                      value.hex
                    }}</span>
                  </span>
                </span>
              </td>
              <td class="min-w-64">
                <code v-if="token.classes">{{ token.classes }}</code>
                <span v-else class="text-gray-500 dark:text-gray-400">No Tailwind color</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <h2 id="primitives">Primitive colors</h2>
    <p>
      The palettes the tokens are built from: the Tailwind CSS palettes, plus the Nethesis brand
      colors and some transparent colors.
    </p>
    <div class="space-y-3 overflow-x-auto">
      <div
        v-for="[palette, shades] in primitivePalettes"
        :key="palette"
        class="flex items-center gap-x-3"
      >
        <span class="w-20 shrink-0">{{ palette }}</span>
        <div class="flex gap-x-1">
          <div v-for="shade in shades" :key="shade.name" class="w-12 text-center">
            <div
              class="h-8 rounded-md border border-black/5 dark:border-white/10"
              :style="{ backgroundColor: shade.hex }"
              :title="`${palette.toLowerCase()}-${shade.shade} ${shade.hex}`"
            />
            <span class="text-xs text-gray-500 dark:text-gray-400">{{ shade.shade }}</span>
          </div>
        </div>
      </div>
    </div>
    <h3>Other colors</h3>
    <div class="overflow-x-auto">
      <table class="ds-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Value</th>
            <th class="w-full">Tailwind color</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="color in otherPrimitives" :key="color.name">
            <td class="whitespace-nowrap">{{ color.name }}</td>
            <td>
              <span class="flex items-center gap-x-3">
                <span
                  class="size-8 shrink-0 rounded-md border border-gray-300 dark:border-gray-600"
                  :style="{ backgroundColor: color.hex }"
                />
                {{ color.hex }}
              </span>
            </td>
            <td>
              <code v-if="tailwindColor(color.name)">{{ tailwindColor(color.name) }}</code>
              <span v-else class="text-gray-500 dark:text-gray-400">None, brand color</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
