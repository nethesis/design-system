//  Copyright (C) 2026 Nethesis S.r.l.
//  SPDX-License-Identifier: GPL-3.0-or-later

// Values of the foundations pages, from the Foundation pages and the
// variables of the NDS Figma file (read on 2026-10-26). Figma is the source:
// update these values when Figma changes.
//
// Tailwind class names are written in full, so that Tailwind generates them
// for the previews.

const rem = (px: number) => `${px / 16} rem`

// typography

// Poppins: only Regular and Medium, both loaded (the default import of
// @fontsource/poppins has only Regular, and the browser fakes Medium)
export const TYPEFACE = {
  family: 'Poppins',
  imports: ['@fontsource/poppins/400.css', '@fontsource/poppins/500.css']
}
export const FONT_WEIGHTS = [
  { name: 'Regular', value: 400, className: 'font-normal', use: 'Body text' },
  { name: 'Medium', value: 500, className: 'font-medium', use: 'Headings, labels and buttons' }
]

export type TextSize = {
  name: string
  className: string | null
  size: number
  lineHeight: number
}

export const TEXT_SIZES: TextSize[] = [
  { name: 'xxs', className: null, size: 10, lineHeight: 12 },
  { name: 'xs', className: 'text-xs', size: 12, lineHeight: 16 },
  { name: 'sm', className: 'text-sm', size: 14, lineHeight: 20 },
  { name: 'base', className: 'text-base', size: 16, lineHeight: 24 },
  { name: 'lg', className: 'text-lg', size: 18, lineHeight: 28 },
  { name: 'xl', className: 'text-xl', size: 20, lineHeight: 28 },
  { name: '2xl', className: 'text-2xl', size: 24, lineHeight: 32 },
  { name: '3xl', className: 'text-3xl', size: 30, lineHeight: 36 },
  { name: '4xl', className: 'text-4xl', size: 36, lineHeight: 40 },
  { name: '5xl', className: 'text-5xl', size: 48, lineHeight: 48 },
  { name: '6xl', className: 'text-6xl', size: 60, lineHeight: 60 },
  { name: '7xl', className: 'text-7xl', size: 72, lineHeight: 72 },
  { name: '8xl', className: 'text-8xl', size: 96, lineHeight: 96 }
]

export type TextStyle = {
  token: string
  className: string | null
  size: number
  lineHeight: number
  weight: 'Regular' | 'Medium'
}

export const TEXT_STYLE_GROUPS: { title: string; styles: TextStyle[] }[] = [
  {
    title: 'Headings',
    styles: [
      {
        token: 'Headings/H1',
        className: 'text-4xl font-medium',
        size: 36,
        lineHeight: 40,
        weight: 'Medium'
      },
      {
        token: 'Headings/H2',
        className: 'text-3xl font-medium',
        size: 30,
        lineHeight: 36,
        weight: 'Medium'
      },
      {
        token: 'Headings/H3',
        className: 'text-2xl font-medium',
        size: 24,
        lineHeight: 32,
        weight: 'Medium'
      },
      {
        token: 'Headings/H4',
        className: 'text-xl font-medium',
        size: 20,
        lineHeight: 28,
        weight: 'Medium'
      },
      {
        token: 'Headings/H5',
        className: 'text-lg font-medium',
        size: 18,
        lineHeight: 28,
        weight: 'Medium'
      },
      {
        token: 'Headings/H6',
        className: 'text-base font-medium',
        size: 16,
        lineHeight: 24,
        weight: 'Medium'
      },
      {
        token: 'Headings/H7',
        className: 'text-sm/6 font-medium',
        size: 14,
        lineHeight: 24,
        weight: 'Medium'
      }
    ]
  },
  {
    title: 'Body',
    styles: [
      { token: 'Body/lg', className: 'text-lg', size: 18, lineHeight: 28, weight: 'Regular' },
      { token: 'Body/base', className: 'text-base', size: 16, lineHeight: 24, weight: 'Regular' },
      { token: 'Body/sm', className: 'text-sm', size: 14, lineHeight: 20, weight: 'Regular' },
      { token: 'Body/xs', className: 'text-xs', size: 12, lineHeight: 16, weight: 'Regular' },
      { token: 'Body/xxs', className: null, size: 10, lineHeight: 12, weight: 'Regular' }
    ]
  },
  {
    title: 'UI elements',
    styles: [
      {
        token: 'UI/Button/lg',
        className: 'text-sm font-medium',
        size: 14,
        lineHeight: 20,
        weight: 'Medium'
      },
      {
        token: 'UI/Button/sm',
        className: 'text-xs font-medium',
        size: 12,
        lineHeight: 16,
        weight: 'Medium'
      }
    ]
  },
  {
    title: 'Website',
    styles: [
      {
        token: 'Website/H1',
        className: 'text-4xl font-medium',
        size: 36,
        lineHeight: 40,
        weight: 'Medium'
      },
      {
        token: 'Website/H2',
        className: 'text-3xl font-medium',
        size: 30,
        lineHeight: 36,
        weight: 'Medium'
      },
      { token: 'Website/H3', className: null, size: 28, lineHeight: 36, weight: 'Medium' },
      {
        token: 'Website/H4',
        className: 'text-2xl font-medium',
        size: 24,
        lineHeight: 32,
        weight: 'Medium'
      },
      {
        token: 'Website/H5',
        className: 'text-xl font-medium',
        size: 20,
        lineHeight: 28,
        weight: 'Medium'
      },
      {
        token: 'Website/Paragraph',
        className: 'text-base',
        size: 16,
        lineHeight: 24,
        weight: 'Regular'
      },
      {
        token: 'UI/Button/xl website',
        className: 'text-base font-medium',
        size: 16,
        lineHeight: 24,
        weight: 'Medium'
      }
    ]
  }
]

// iconography

// the packages of the icons, as in package.json, with the pack names of icons.yaml
export const ICON_PACKAGES = [
  { pack: 'fa-solid', name: '@fortawesome/free-solid-svg-icons', version: '^6.7.2' },
  {
    pack: 'ns-solid',
    name: '@nethesis/nethesis-solid-svg-icons',
    version: 'github:nethesis/Font-Awesome#ns-solid'
  },
  {
    pack: 'ns-light',
    name: '@nethesis/nethesis-light-svg-icons',
    version: 'github:nethesis/Font-Awesome#ns-light'
  },
  {
    pack: 'ns-brands',
    name: '@nethesis/nethesis-brands-svg-icons',
    version: 'github:nethesis/Font-Awesome#ns-brands'
  }
] as const

// sizes and their use, from the Iconography page of the NDS Figma file
export const ICON_SIZES = [
  { px: 12, className: 'size-3', use: 'Service icons, such as the check circle of a selection' },
  {
    px: 16,
    className: 'size-4',
    use: 'The most used size: buttons, badges, tooltips, text inputs, comboboxes, dropdowns, tables'
  },
  { px: 20, className: 'size-5', use: 'Rounded icon' },
  { px: 24, className: 'size-6', use: 'Cards, sidebar and top bar' },
  { px: 32, className: 'size-8', use: 'File input' },
  { px: 48, className: 'size-12', use: 'Empty state' }
]

// spacing and border

export const SPACING = [
  0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44,
  48, 52, 56, 60, 64, 72, 80, 96
].map((step) => ({
  step,
  token: `space/${String(step).replace('.', ',')}`,
  px: step * 4,
  rem: rem(step * 4)
}))

export const RADII = [
  { token: 'radius/rounded-none', className: 'rounded-none', px: 0 },
  { token: 'radius/rounded-xs', className: 'rounded-xs', px: 2 },
  { token: 'radius/rounded-sm', className: 'rounded-sm', px: 4 },
  { token: 'radius/rounded-md', className: 'rounded-md', px: 6 },
  { token: 'radius/rounded-lg', className: 'rounded-lg', px: 8 },
  { token: 'radius/rounded-xl', className: 'rounded-xl', px: 12 },
  { token: 'radius/rounded-2xl', className: 'rounded-2xl', px: 16 },
  { token: 'radius/rounded-3xl', className: 'rounded-3xl', px: 24 },
  { token: 'radius/rounded-full', className: 'rounded-full', px: 9999 }
].map((radius) => ({ ...radius, rem: radius.px === 9999 ? '–' : rem(radius.px) }))

export const BORDER_WIDTHS = [
  { token: 'width/border-0', className: 'border-0', px: 0 },
  { token: 'width/border-1', className: 'border', px: 1 },
  { token: 'width/border-2', className: 'border-2', px: 2 },
  { token: 'width/border-4', className: 'border-4', px: 4 },
  { token: 'width/border-8', className: 'border-8', px: 8 }
]

// The focus ring depends on the product. In code, the primary palette is the
// product palette, so the classes use primary-*.
export const FOCUS_RINGS = [
  { name: 'NethSecurity', ring: '#06b6d4', primary: '#0e7490', palette: 'cyan' },
  { name: 'NethVoice', ring: '#10b981', primary: '#047857', palette: 'emerald' },
  { name: 'NethLink', ring: '#3b82f6', primary: '#1d4ed8', palette: 'blue' },
  { name: 'NethService', ring: '#f97316', primary: '#c2410c', palette: 'orange' },
  { name: 'Website and My Nethesis', ring: '#0ea5e9', primary: '#0369a1', palette: 'sky' }
]

export const STATUS_FOCUS_RINGS = [
  {
    name: 'Info',
    ring: '#3b82f6',
    gap: '#dbeafe',
    className: 'ring-blue-500 ring-offset-blue-100'
  },
  {
    name: 'Success',
    ring: '#22c55e',
    gap: '#dcfce7',
    className: 'ring-green-500 ring-offset-green-100'
  },
  {
    name: 'Warning',
    ring: '#f59e0b',
    gap: '#fef3c7',
    className: 'ring-amber-500 ring-offset-amber-100'
  },
  {
    name: 'Error',
    ring: '#f43f5e',
    gap: '#ffe4e6',
    className: 'ring-rose-500 ring-offset-rose-100'
  }
]

// box-shadow values of the two focus ring effect styles
export const focusRing1 = (color: string) => `0 0 0 2px ${color}`
export const focusRing2 = (color: string, gap = '#ffffff') =>
  `0 0 0 2px ${gap}, 0 0 0 4px ${color}, 0 1px 2px 0 rgb(0 0 0 / 0.05)`

// elevation and shadow

export const ELEVATION = [
  { level: 'L0', light: 'white', dark: 'gray-950', className: 'bg-white dark:bg-gray-950' },
  { level: 'L1', light: 'gray-50', dark: 'gray-900', className: 'bg-gray-50 dark:bg-gray-900' },
  { level: 'L2', light: 'gray-100', dark: 'gray-800', className: 'bg-gray-100 dark:bg-gray-800' },
  { level: 'L3', light: 'gray-200', dark: 'gray-700', className: 'bg-gray-200 dark:bg-gray-700' },
  { level: 'L4', light: 'gray-300', dark: 'gray-600', className: 'bg-gray-300 dark:bg-gray-600' },
  { level: 'L2 invert', light: 'white', dark: 'gray-950', className: 'bg-white dark:bg-gray-950' }
]

export const SHADOWS = [
  {
    token: 'shadow/xs',
    className: 'shadow-xs',
    light: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    dark: '0 1px 2px 0 rgb(75 85 99 / 0.05)'
  },
  {
    token: 'shadow/sm',
    className: 'shadow-sm',
    light: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    dark: '0 1px 3px 0 rgb(75 85 99 / 0.1), 0 1px 2px -1px rgb(75 85 99 / 0.1)'
  },
  {
    token: 'shadow/md',
    className: 'shadow-md',
    light: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    dark: '0 4px 6px -1px rgb(75 85 99 / 0.1), 0 2px 4px -2px rgb(75 85 99 / 0.1)'
  },
  {
    token: 'shadow/lg',
    className: 'shadow-lg',
    light: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    dark: '0 10px 15px -3px rgb(75 85 99 / 0.1), 0 4px 6px -4px rgb(75 85 99 / 0.1)'
  },
  {
    token: 'shadow/xl',
    className: 'shadow-xl',
    light: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    dark: '0 20px 25px -5px rgb(75 85 99 / 0.1), 0 8px 10px -6px rgb(75 85 99 / 0.1)'
  },
  {
    token: 'shadow/2xl',
    className: 'shadow-2xl',
    light: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    dark: '0 25px 50px -12px rgb(75 85 99 / 0.25)'
  },
  {
    token: 'shadow/drawer',
    className:
      'shadow-[0px_20px_40px_0_rgba(0,0,0,0.2)] dark:shadow-[0px_20px_40px_0_rgba(0,0,0,0.6)]',
    light: '0 20px 40px 0 rgb(0 0 0 / 0.2)',
    dark: '0 20px 40px 0 rgb(0 0 0 / 0.6)'
  }
]
