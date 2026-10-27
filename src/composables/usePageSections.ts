//  Copyright (C) 2026 Nethesis S.r.l.
//  SPDX-License-Identifier: GPL-3.0-or-later

import { onMounted, onUnmounted, ref, shallowRef } from 'vue'

export type PageSection = { id: string; title: string }

// below the sticky top bar, with some margin: a section is the current one
// once its heading reaches this line
const ACTIVE_LINE = 100

// The level 2 headings of the page shown in the element with the given id,
// and the one the reader is in. They are read from the page itself, so they
// work for every page, also the ones loaded when opened, with nothing to
// keep up to date.
export function usePageSections(containerId: string) {
  const sections = shallowRef<PageSection[]>([])
  const activeSection = ref('')

  // while the page scrolls to a section, the headings it passes don't count
  let held = false
  let holdTimeout: ReturnType<typeof setTimeout> | undefined

  function updateActiveSection() {
    if (held) return
    let active = ''
    for (const { id } of sections.value) {
      const heading = document.getElementById(id)
      if (!heading || heading.getBoundingClientRect().top > ACTIVE_LINE) break
      active = id
    }
    // the last sections can be too short to reach the line: at the bottom of
    // a scrolled page, the last one is the current one
    const atBottom =
      window.scrollY > 0 &&
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
    if (atBottom && sections.value.length) active = sections.value.at(-1)!.id
    activeSection.value = active
  }

  function readSections() {
    const container = document.getElementById(containerId)
    const list = [...(container?.querySelectorAll<HTMLElement>('h2[id]') ?? [])].map((heading) => ({
      id: heading.id,
      title: heading.textContent?.trim() ?? ''
    }))
    if (JSON.stringify(list) !== JSON.stringify(sections.value)) sections.value = list
    updateActiveSection()
  }

  // Marks a section as the current one until the scroll that brings it into
  // view ends (or after a while, if the page does not scroll at all)
  function holdActiveSection(id: string) {
    activeSection.value = id
    held = true
    const release = () => {
      held = false
      clearTimeout(holdTimeout)
      window.removeEventListener('scrollend', release)
      updateActiveSection()
    }
    clearTimeout(holdTimeout)
    window.addEventListener('scrollend', release, { once: true })
    holdTimeout = setTimeout(release, 1500)
  }

  let frame = 0
  const onScroll = () => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(updateActiveSection)
  }

  // pages render after a while and change while in use (filters): read the
  // headings again whenever the content changes
  let observer: MutationObserver | undefined
  onMounted(() => {
    const container = document.getElementById(containerId)
    if (container) {
      observer = new MutationObserver(readSections)
      observer.observe(container, { childList: true, subtree: true })
    }
    readSections()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
  })
  onUnmounted(() => {
    observer?.disconnect()
    cancelAnimationFrame(frame)
    clearTimeout(holdTimeout)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
  })

  return { sections, activeSection, holdActiveSection }
}
