<!--
  Copyright (C) 2026 Nethesis S.r.l.
  SPDX-License-Identifier: GPL-3.0-or-later
-->

<script setup lang="ts">
import { ELEVATION, SHADOWS } from '../foundations'
import { useTheme } from '../composables/useTheme'

const { isDark } = useTheme()
</script>

<template>
  <div class="foundation">
    <h2 id="elevation">Elevation</h2>
    <p>
      Elevation and shadow give depth to the interface, and build a visual hierarchy that guides the
      attention of users. Each level, from L0 to L4, has a surface color from the gray palette. L2
      invert uses the L0 color to stand out on an L1 surface.
    </p>
    <p>The example follows the theme selected in the top bar.</p>
    <div
      class="mb-6 max-w-3xl rounded-md border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-950"
    >
      <span class="text-xs">L0</span>
      <div class="mt-2 bg-gray-50 p-4 dark:bg-gray-900">
        <span class="text-xs">L1</span>
        <div class="mt-2 grid gap-4 sm:grid-cols-2">
          <div class="bg-gray-100 p-4 dark:bg-gray-800">
            <span class="text-xs">L2</span>
            <div class="mt-2 bg-gray-200 p-4 dark:bg-gray-700">
              <span class="text-xs">L3</span>
            </div>
          </div>
          <div class="bg-white p-4 dark:bg-gray-950">
            <span class="text-xs">L2 invert</span>
          </div>
        </div>
      </div>
    </div>
    <div class="table-frame">
      <table class="ds-table">
        <thead>
          <tr>
            <th>Level</th>
            <th>Light theme</th>
            <th>Dark theme</th>
            <th class="w-full">Classes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="level in ELEVATION" :key="level.level">
            <td class="whitespace-nowrap">{{ level.level }}</td>
            <td>{{ level.light }}</td>
            <td>{{ level.dark }}</td>
            <td>
              <code>{{ level.className }}</code>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2 id="shadow">Shadow</h2>
    <p>
      Shadows apply to components such as cards, buttons, modals and tooltips, and give subtle cues
      about interactivity and layering. Each Figma shadow token matches a Tailwind CSS shadow class.
      In the dark theme the shadows are gray instead of black, and the drawer shadow is darker.
    </p>
    <div class="table-frame">
      <table class="ds-table">
        <thead>
          <tr>
            <th>Token</th>
            <th>Class</th>
            <th>Light theme</th>
            <th>Dark theme</th>
            <th>Example</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="shadow in SHADOWS" :key="shadow.token">
            <td class="whitespace-nowrap">{{ shadow.token }}</td>
            <td>
              <code>{{ shadow.className }}</code>
            </td>
            <td class="min-w-56 text-xs">{{ shadow.light }}</td>
            <td class="min-w-56 text-xs">{{ shadow.dark }}</td>
            <td class="px-6 py-6">
              <div
                class="h-12 w-24 rounded-md bg-white dark:bg-gray-950"
                :style="{ boxShadow: isDark ? shadow.dark : shadow.light }"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
