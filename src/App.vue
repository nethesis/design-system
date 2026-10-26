<!--
  Copyright (C) 2026 Nethesis S.r.l.
  SPDX-License-Identifier: GPL-3.0-or-later
-->

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import SideNav from './components/SideNav.vue'
import TopBar from './components/TopBar.vue'
import { HOME_PAGE, findPage, pageFromLocation, pageHref, type Page } from './pages'

const currentPage = shallowRef(pageFromLocation())
const sidebarOpen = ref(false)
// changes when a link opens the current page again, so that the page starts
// over from the new address, without the filters of the old one
const visit = ref(0)
const pageTitle = ref<HTMLElement>()

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

// each page has its own query parameters and anchors
async function navigate(page: Page, hash = '') {
  sidebarOpen.value = false
  if (page !== currentPage.value || hash) {
    window.history.pushState(null, '', `${pageHref(page)}${hash}`)
    if (page === currentPage.value) visit.value++
    currentPage.value = page
  }
  await nextTick()
  const target = hash ? await waitForElement(hash.slice(1)) : null
  if (target) {
    target.scrollIntoView()
    // keyboard and screen reader users continue from the target
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true, focusVisible: false } as FocusOptions)
  } else {
    window.scrollTo(0, 0)
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
  navigate(page, url.hash)
}

const onPopState = () => (currentPage.value = pageFromLocation())
onMounted(async () => {
  window.addEventListener('popstate', onPopState)
  // the browser looks for the anchor before the page is rendered
  const id = decodeURIComponent(window.location.hash.slice(1))
  if (id && !document.getElementById(id)) (await waitForElement(id))?.scrollIntoView()
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
  <TransitionRoot as="template" :show="sidebarOpen">
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
            <SideNav :current="currentPage" @navigate="navigate" />
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>

  <!-- sidebar for large screens -->
  <div class="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-72 lg:flex-col">
    <SideNav :current="currentPage" @navigate="navigate" />
  </div>

  <div class="lg:pl-72">
    <TopBar @open-sidebar="sidebarOpen = true" @navigate="navigate" />

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
        </header>
        <component :is="currentPage.component" :key="`${currentPage.id}-${visit}`" />
      </div>
    </main>
  </div>
</template>
