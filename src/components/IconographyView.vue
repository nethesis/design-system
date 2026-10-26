<!--
  Copyright (C) 2026 Nethesis S.r.l.
  SPDX-License-Identifier: GPL-3.0-or-later
-->

<script setup lang="ts">
import type { IconDefinition, IconPack } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faShieldHalved } from '@fortawesome/free-solid-svg-icons'
import { fas } from '@nethesis/nethesis-solid-svg-icons'
import { fal } from '@nethesis/nethesis-light-svg-icons'
import { fab } from '@nethesis/nethesis-brands-svg-icons'
import { ICON_PACKAGES, ICON_SIZES } from '../foundations'

const icons = (pack: IconPack) =>
  Object.entries(pack)
    .map(([name, icon]) => ({ name, icon: icon as IconDefinition }))
    .sort((a, b) => a.name.localeCompare(b.name))

const CUSTOM_ICONS = [
  {
    id: 'custom-solid',
    title: 'Solid',
    packageName: '@nethesis/nethesis-solid-svg-icons',
    icons: icons(fas)
  },
  {
    id: 'custom-light',
    title: 'Light',
    packageName: '@nethesis/nethesis-light-svg-icons',
    icons: icons(fal)
  },
  {
    id: 'custom-brands',
    title: 'Brands',
    packageName: '@nethesis/nethesis-brands-svg-icons',
    icons: icons(fab)
  }
]

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
    <div class="overflow-x-auto">
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
        </li>
      </ul>
    </template>
  </div>
</template>
