//  Copyright (C) 2026 Nethesis S.r.l.
//  SPDX-License-Identifier: GPL-3.0-or-later

import { ref } from 'vue'
import type { GlossaryEntry } from '../types'

// Review marks, available in development only (npm run dev). They are kept in
// the browser's localStorage, so they survive a restart of the dev server but
// stay on this browser and this origin (http://localhost:5179).
//
// Each mark stores a fingerprint of the entry content: when the entry changes
// after the review, its state becomes "changed".

export type ReviewState = 'reviewed' | 'changed' | 'not-reviewed'

export const REVIEW_LABELS: Record<ReviewState, string> = {
  reviewed: 'Reviewed',
  changed: 'Changed since review',
  'not-reviewed': 'Not reviewed'
}

const STORAGE_KEY = 'design-system:reviewed'

// JSON with sorted keys, so reordering the fields in glossary.yaml does not
// count as a change
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonical((value as Record<string, unknown>)[key])}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

// FNV-1a 32-bit hash: enough to notice an edit, not a security measure
function fingerprint(entry: GlossaryEntry): string {
  let hash = 0x811c9dc5
  for (const char of canonical(entry)) {
    hash ^= char.codePointAt(0)!
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

function load(): Record<string, string> {
  try {
    const marks = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    return marks && typeof marks === 'object' ? marks : {}
  } catch {
    return {}
  }
}

export function useReview() {
  const enabled = import.meta.env.DEV
  const marks = ref<Record<string, string>>(enabled ? load() : {})

  function reviewState(entry: GlossaryEntry): ReviewState {
    const mark = marks.value[entry.id]
    if (!mark) return 'not-reviewed'
    return mark === fingerprint(entry) ? 'reviewed' : 'changed'
  }

  function setReviewed(entry: GlossaryEntry, reviewed: boolean) {
    const next = { ...marks.value }
    if (reviewed) {
      next[entry.id] = fingerprint(entry)
    } else {
      delete next[entry.id]
    }
    marks.value = next
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // storage unavailable: the mark lasts until the page is reloaded
    }
  }

  return { enabled, reviewState, setReviewed }
}
