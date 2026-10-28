//  Copyright (C) 2026 Nethesis S.r.l.
//  SPDX-License-Identifier: GPL-3.0-or-later

import { ref } from 'vue'

// Copies the link to an anchor of a page, without filters so the target is
// always visible. copiedId is the id of the last copied link, for two seconds.
export function useCopyLink(page: string) {
  const copiedId = ref('')
  let copiedTimeout: ReturnType<typeof setTimeout> | undefined

  async function copyLink(id: string, anchor: string) {
    const url = new URL(window.location.pathname, window.location.origin)
    url.searchParams.set('page', page)
    url.hash = anchor
    try {
      await navigator.clipboard.writeText(url.href)
    } catch {
      // no clipboard access: at least show the link in the address bar
      window.history.replaceState(null, '', url)
    }
    copiedId.value = id
    clearTimeout(copiedTimeout)
    copiedTimeout = setTimeout(() => (copiedId.value = ''), 2000)
  }

  return { copiedId, copyLink }
}
