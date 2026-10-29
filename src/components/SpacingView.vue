<!--
  Copyright (C) 2026 Nethesis S.r.l.
  SPDX-License-Identifier: GPL-3.0-or-later
-->

<script setup lang="ts">
import {
  BORDER_WIDTHS,
  FOCUS_RINGS,
  RADII,
  SPACING,
  STATUS_FOCUS_RINGS,
  focusRing1,
  focusRing2
} from '../foundations'
</script>

<template>
  <div class="foundation">
    <h2 id="spacing">Spacing</h2>
    <p>
      One spacing scale sets padding, margin, gap, width and height. It is the Tailwind CSS scale:
      each step is 4 px (0.25 rem), and the step is the number in classes such as
      <code>p-4</code>, <code>m-2</code>, <code>gap-6</code> or <code>w-10</code>.
    </p>
    <div class="table-frame">
      <table class="ds-table">
        <thead>
          <tr>
            <th>Step</th>
            <th>Token</th>
            <th>Size</th>
            <th class="w-full">Example</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="space in SPACING" :key="space.step">
            <td>{{ space.step }}</td>
            <td class="whitespace-nowrap">{{ space.token }}</td>
            <td class="whitespace-nowrap">{{ space.rem }} · {{ space.px }} px</td>
            <td>
              <div
                class="h-3 rounded-xs bg-primary-600 dark:bg-primary-400"
                :style="{ width: `${space.px}px` }"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2 id="border-radius">Border radius</h2>
    <p>Rounded corners use the Tailwind CSS radius classes.</p>
    <div class="table-frame">
      <table class="ds-table">
        <thead>
          <tr>
            <th>Token</th>
            <th>Class</th>
            <th>Size</th>
            <th class="w-full">Example</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="radius in RADII" :key="radius.token">
            <td class="whitespace-nowrap">{{ radius.token }}</td>
            <td>
              <code>{{ radius.className }}</code>
            </td>
            <td class="whitespace-nowrap">
              {{ radius.rem }} · {{ radius.px === 9999 ? '9999' : radius.px }} px
            </td>
            <td>
              <div
                :class="[
                  'size-12 border-2 border-primary-600 bg-primary-50 dark:border-primary-400 dark:bg-primary-950',
                  radius.className
                ]"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2 id="border-width">Border width</h2>
    <p>
      Border widths use the Tailwind CSS border classes. The border color comes from the border
      color tokens.
    </p>
    <div class="table-frame">
      <table class="ds-table">
        <thead>
          <tr>
            <th>Token</th>
            <th>Class</th>
            <th>Width</th>
            <th class="w-full">Example</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="width in BORDER_WIDTHS" :key="width.token">
            <td class="whitespace-nowrap">{{ width.token }}</td>
            <td>
              <code>{{ width.className }}</code>
            </td>
            <td class="whitespace-nowrap">{{ width.px }} px</td>
            <td>
              <div
                :class="[
                  'size-12 rounded-md border-gray-400 bg-white dark:border-gray-500 dark:bg-gray-950',
                  width.className
                ]"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2 id="focus-ring">Focus ring</h2>
    <p>
      The focus ring shows which element has the keyboard focus, and its color depends on the
      product. Focus ring 1 is a 2 px ring around the element. Focus ring 2 leaves a 2 px gap
      between the element and the ring. Focus ring 2 primary uses shade 700 instead of 500: Figma
      does not say where to use it.
    </p>
    <p>
      In code, the primary palette is the palette of the product, so the same classes work in every
      product: <code>ring-2 ring-primary-500</code> for focus ring 1 and
      <code>ring-2 ring-primary-500 ring-offset-2</code> for focus ring 2, after the
      <code>focus:</code> or <code>focus-visible:</code> prefix.
    </p>
    <div class="table-frame">
      <table class="ds-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Palette</th>
            <th>Focus ring 1</th>
            <th>Focus ring 2</th>
            <th>Focus ring 2 primary</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in FOCUS_RINGS" :key="product.name">
            <td class="whitespace-nowrap">{{ product.name }}</td>
            <td>
              <code>{{ product.palette }}</code>
            </td>
            <td
              v-for="shadow in [
                focusRing1(product.ring),
                focusRing2(product.ring),
                focusRing2(product.primary)
              ]"
              :key="shadow"
            >
              <div class="inline-flex rounded-md bg-white p-3">
                <div
                  class="h-8 w-20 rounded-md border border-gray-300 bg-white"
                  :style="{ boxShadow: shadow }"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h3>Status colors</h3>
    <p>
      Focus ring 2 also comes in the status colors. Its gap takes a light shade of the same color,
      for elements on a colored background such as a notification.
    </p>
    <div class="table-frame">
      <table class="ds-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Classes</th>
            <th class="w-full">Focus ring 2</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="status in STATUS_FOCUS_RINGS" :key="status.name">
            <td>{{ status.name }}</td>
            <td>
              <code>{{ status.className }}</code>
            </td>
            <td>
              <div class="inline-flex rounded-md p-3" :style="{ backgroundColor: status.gap }">
                <div
                  class="h-8 w-20 rounded-md border border-gray-300 bg-white"
                  :style="{ boxShadow: focusRing2(status.ring, status.gap) }"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
