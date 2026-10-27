<!--
  Copyright (C) 2026 Nethesis S.r.l.
  SPDX-License-Identifier: GPL-3.0-or-later
-->

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { NeInlineNotification } from '@nethesis/vue-components'
import SideNav from './components/SideNav.vue'
import TopBar from './components/TopBar.vue'
import { usePageSections } from './composables/usePageSections'
import { HOME_PAGE, findPage, groupOf, pageFromLocation, pageHref, type Page } from './pages'

const currentPage = shallowRef(pageFromLocation())
const sidebarOpen = ref(false)
// changes when a link restarts the current page, so that it starts over from
// the new address, without the filters of the old one
const visit = ref(0)
const pageTitle = ref<HTMLElement>()
const notForNethServer8 = computed(() => !!groupOf(currentPage.value)?.notForNethServer8)
// the sections of the current page, listed in the sidebar
const { sections, activeSection, holdActiveSection } = usePageSections('main')

// links made before the sidebar get the current address
const initialUrl = new URL(window.location.href)
if (
  initialUrl.searchParams.has('tab') ||
  (!initialUrl.searchParams.has('page') && currentPage.value !== HOME_PAGE)
) {
  initialUrl.searchParams.delete('tab')
  initialUrl.searchParams.set('page', currentPage.value.id)
  window.history.replaceState(null, '', initialUrl)
}

watch(
  currentPage,
  (page) => {
    document.title = page === HOME_PAGE ? page.title : `${page.title} · Nethesis Design System`
  },
  { immediate: true }
)

// The menu of small screens gives the focus back to its button and unlocks
// the page scroll when its animation ends: wait for it before moving
let sidebarClosed: (() => void)[] = []
function closeSidebar() {
  sidebarOpen.value = false
  return new Promise<void>((resolve) => sidebarClosed.push(resolve))
}
function onSidebarClosed() {
  // the dialog restores the focus right after the animation
  requestAnimationFrame(() => {
    sidebarClosed.forEach((resolve) => resolve())
    sidebarClosed = []
  })
}

// pages loaded when opened render after a while: wait for an anchor for up
// to two seconds
async function waitForElement(id: string) {
  for (let i = 0; i < 120; i++) {
    const element = document.getElementById(id)
    if (element) return element
    await new Promise(requestAnimationFrame)
  }
  return null
}

// each page has its own query parameters and anchors. Links from the content
// and from the search restart the page when it is already open, so that the
// target is not hidden by a filter; links to a section of the current page
// in the sidebar don't.
async function navigate(page: Page, hash = '', restart = false) {
  if (sidebarOpen.value) await closeSidebar()
  if (page !== currentPage.value || hash) {
    window.history.pushState(null, '', `${pageHref(page)}${hash}`)
    if (page === currentPage.value && restart) visit.value++
    currentPage.value = page
  }
  await nextTick()
  const target = hash ? await waitForElement(hash.slice(1)) : null
  if (target) {
    // smooth, unless the reader prefers reduced motion (see style.css)
    if (sections.value.some((section) => section.id === target.id)) holdActiveSection(target.id)
    target.scrollIntoView()
    // keyboard and screen reader users continue from the target
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true, focusVisible: false } as FocusOptions)
  } else {
    // a new page starts at the top at once, without scrolling through the old one
    window.scrollTo({ top: 0, behavior: 'instant' })
    // screen readers announce the new page
    pageTitle.value?.focus({ preventScroll: true })
  }
}

// links to other pages inside the content (?page=glossary) don't reload the site
function followPageLink(event: MouseEvent) {
  const link = (event.target as Element).closest('a')
  if (
    !link ||
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return
  }
  const url = new URL(link.href)
  const page = findPage(url.searchParams.get('page'))
  if (
    !page ||
    url.origin !== window.location.origin ||
    url.pathname !== window.location.pathname ||
    // an anchor in the same page: the browser handles it
    url.search === window.location.search
  ) {
    return
  }
  event.preventDefault()
  navigate(page, url.hash, true)
}

const onPopState = () => (currentPage.value = pageFromLocation())
onMounted(async () => {
  window.addEventListener('popstate', onPopState)
  // the browser looks for the anchor before the page is rendered
  const id = decodeURIComponent(window.location.hash.slice(1))
  if (!id) return
  // an address with an anchor opens at the anchor, without scrolling to it: the browser would
  // otherwise animate its own jump to the anchor while the page loads
  const html = document.documentElement
  html.style.scrollBehavior = 'auto'
  if (!document.getElementById(id)) (await waitForElement(id))?.scrollIntoView()
  if (document.readyState !== 'complete') {
    await new Promise((resolve) => window.addEventListener('load', resolve, { once: true }))
  }
  await new Promise(requestAnimationFrame)
  html.style.removeProperty('scroll-behavior')
})
onUnmounted(() => window.removeEventListener('popstate', onPopState))
</script>

<template>
  <a
    href="#main"
    class="sr-only rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-900 focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] dark:bg-gray-950 dark:text-gray-50"
  >
    Skip to content
  </a>

  <!-- sidebar for small screens -->
  <TransitionRoot as="template" :show="sidebarOpen" @after-leave="onSidebarClosed">
    <Dialog class="relative z-50 lg:hidden" @close="sidebarOpen = false">
      <TransitionChild
        as="template"
        enter="transition-opacity ease-linear duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="transition-opacity ease-linear duration-300"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-900/80" />
      </TransitionChild>
      <div class="fixed inset-x-0 top-0 flex h-dvh">
        <TransitionChild
          as="template"
          enter="transition ease-in-out duration-300 transform"
          enter-from="-translate-x-full"
          enter-to="translate-x-0"
          leave="transition ease-in-out duration-300 transform"
          leave-from="translate-x-0"
          leave-to="-translate-x-full"
        >
          <DialogPanel class="relative mr-16 flex w-full max-w-xs flex-1">
            <div class="absolute top-0 left-full flex w-16 justify-center pt-5">
              <button type="button" class="-m-2.5 p-2.5" @click="sidebarOpen = false">
                <span class="sr-only">Close menu</span>
                <FontAwesomeIcon :icon="faXmark" class="size-6 text-white" aria-hidden="true" />
              </button>
            </div>
            <SideNav
              :current="currentPage"
              :sections="sections"
              :active-section="activeSection"
              @navigate="navigate"
            />
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>

  <!-- sidebar for large screens -->
  <div class="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-72 lg:flex-col">
    <SideNav
      :current="currentPage"
      :sections="sections"
      :active-section="activeSection"
      @navigate="navigate"
    />
  </div>

  <div class="lg:pl-72">
    <TopBar
      @open-sidebar="sidebarOpen = true"
      @navigate="(page, hash) => navigate(page, hash, true)"
    />

    <main id="main" class="px-4 py-10 sm:px-6 lg:px-8" @click="followPageLink">
      <div class="mx-auto max-w-7xl">
        <header class="mb-8">
          <h1
            ref="pageTitle"
            tabindex="-1"
            class="text-2xl font-medium text-gray-900 outline-none dark:text-gray-50"
          >
            {{ currentPage.title }}
          </h1>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
            {{ currentPage.description }}
          </p>
          <NeInlineNotification
            v-if="notForNethServer8"
            kind="info"
            title="Not for NethServer 8"
            class="mt-6 max-w-3xl"
          >
            <template #description>
              NethServer 8 uses the Carbon Design System instead: see the
              <a href="?page=introduction#nethserver-8" class="font-medium underline"
                >introduction</a
              >.
            </template>
          </NeInlineNotification>
        </header>
        <component :is="currentPage.component" :key="`${currentPage.id}-${visit}`" />
      </div>
    </main>
  </div>
</template>
