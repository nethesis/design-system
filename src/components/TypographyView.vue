<!--
  Copyright (C) 2026 Nethesis S.r.l.
  SPDX-License-Identifier: GPL-3.0-or-later
-->

<script setup lang="ts">
import { FONT_WEIGHTS, TEXT_SIZES, TEXT_STYLE_GROUPS } from '../foundations'

const SAMPLE = 'The quick brown fox jumps over the lazy dog'

// headings show their name, buttons a label, the other styles a sentence
function example(token: string) {
  if (token.startsWith('UI/Button')) return 'Create user'
  if (/\/H\d$/.test(token)) return token.split('/').pop()
  return SAMPLE
}

// sizes with no Tailwind class are previewed with an inline style
const inlineStyle = (size: number, lineHeight: number) => ({
  fontSize: `${size / 16}rem`,
  lineHeight: `${lineHeight / 16}rem`
})
</script>

<template>
  <div class="foundation">
    <h2 id="typeface">Typeface</h2>
    <p>
      Poppins, a geometric sans-serif typeface designed by Indian Type Foundry. Use only two of its
      weights: Regular for body text, Medium for headings, labels and buttons.
    </p>
    <p>
      Load both weights. The default import of <code>@fontsource/poppins</code> includes only
      Regular, and the browser then fakes Medium by thickening Regular.
    </p>
    <div class="grid max-w-3xl gap-4 sm:grid-cols-2">
      <div
        v-for="weight in FONT_WEIGHTS"
        :key="weight.value"
        class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-950"
      >
        <p :class="['mb-3 text-4xl text-gray-900 dark:text-gray-50', weight.className]">Aa Bb Cc</p>
        <p class="mb-0 font-medium text-gray-900 dark:text-gray-50">{{ weight.name }}</p>
        <p class="mb-0">
          <code>{{ weight.className }}</code> · font-weight {{ weight.value }}
        </p>
      </div>
    </div>

    <h2 id="sizes">Sizes</h2>
    <p>
      Sizes are named like the Tailwind CSS classes, from xs to 8xl, plus xxs. Each size comes with
      its own line height.
    </p>
    <div class="overflow-x-auto">
      <table class="ds-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Class</th>
            <th>Size</th>
            <th>Line height</th>
            <th>Example</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="size in TEXT_SIZES" :key="size.name">
            <td>{{ size.name }}</td>
            <td>
              <code v-if="size.className">{{ size.className }}</code>
              <span v-else class="whitespace-nowrap text-gray-500 dark:text-gray-400"
                >Not a Tailwind size</span
              >
            </td>
            <td class="whitespace-nowrap">{{ size.size / 16 }} rem · {{ size.size }} px</td>
            <td class="whitespace-nowrap">
              {{ size.lineHeight / 16 }} rem · {{ size.lineHeight }} px
            </td>
            <td class="min-w-72 text-gray-900 dark:text-gray-50">
              <span
                :class="size.className ?? undefined"
                :style="size.className ? undefined : inlineStyle(size.size, size.lineHeight)"
              >
                {{ SAMPLE }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2 id="text-styles">Text styles</h2>
    <p>The text styles of Figma, with the Tailwind classes that reproduce them.</p>
    <template v-for="group in TEXT_STYLE_GROUPS" :key="group.title">
      <h3>{{ group.title }}</h3>
      <div class="overflow-x-auto">
        <table class="ds-table">
          <thead>
            <tr>
              <th>Token</th>
              <th>Classes</th>
              <th>Size / line height</th>
              <th>Weight</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="style in group.styles" :key="style.token">
              <td class="whitespace-nowrap">{{ style.token }}</td>
              <td>
                <code v-if="style.className">{{ style.className }}</code>
                <span v-else class="whitespace-nowrap text-gray-500 dark:text-gray-400"
                  >No Tailwind class</span
                >
              </td>
              <td class="whitespace-nowrap">{{ style.size }} / {{ style.lineHeight }} px</td>
              <td>{{ style.weight }}</td>
              <td class="min-w-72 text-gray-900 dark:text-gray-50">
                <span
                  :class="
                    style.className ?? (style.weight === 'Medium' ? 'font-medium' : undefined)
                  "
                  :style="style.className ? undefined : inlineStyle(style.size, style.lineHeight)"
                >
                  {{ example(style.token) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>
