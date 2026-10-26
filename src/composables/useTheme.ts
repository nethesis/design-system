//  Copyright (C) 2026 Nethesis S.r.l.
//  SPDX-License-Identifier: GPL-3.0-or-later

import { computed, ref, watchEffect } from 'vue'

// The theme follows the operating system until the user picks one with the
// top bar button. The choice is saved in this browser only.

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'design-system:theme'
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')

function savedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

const chosen = ref<Theme | null>(savedTheme())
const systemDark = ref(darkQuery.matches)
darkQuery.addEventListener('change', () => (systemDark.value = darkQuery.matches))

const isDark = computed(() => (chosen.value ? chosen.value === 'dark' : systemDark.value))

watchEffect(() => document.documentElement.classList.toggle('dark', isDark.value))

function toggleTheme() {
  chosen.value = isDark.value ? 'light' : 'dark'
  try {
    localStorage.setItem(STORAGE_KEY, chosen.value)
  } catch {
    // storage not available: the choice lasts until the page is reloaded
  }
}

export function useTheme() {
  return { isDark, toggleTheme }
}
