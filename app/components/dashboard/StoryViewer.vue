<script setup lang="ts">
import { RiArrowLeftSLine, RiArrowRightSLine, RiCloseLine, RiExternalLinkLine } from '@remixicon/vue'
import type { Banner } from '~/types/api'

const STORY_DURATION_MS = 5000
const PROGRESS_TICK_MS = 50

const open = defineModel<boolean>('open', { default: false })
const props = defineProps<{ banners: Banner[]; startIndex: number }>()

const currentIndex = ref(props.startIndex)
const progress = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function startTimer() {
  stopTimer()
  progress.value = 0
  timer = setInterval(() => {
    progress.value += (PROGRESS_TICK_MS / STORY_DURATION_MS) * 100
    if (progress.value >= 100) next()
  }, PROGRESS_TICK_MS)
}

function next() {
  if (currentIndex.value >= props.banners.length - 1) {
    close()
    return
  }
  currentIndex.value += 1
  startTimer()
}

function previous() {
  if (currentIndex.value <= 0) {
    startTimer()
    return
  }
  currentIndex.value -= 1
  startTimer()
}

function close() {
  open.value = false
}

watch(open, (isOpen) => {
  if (isOpen) {
    currentIndex.value = props.startIndex
    startTimer()
  } else {
    stopTimer()
  }
})

function onKeydown(event: KeyboardEvent) {
  if (!open.value) return
  if (event.key === 'Escape') close()
  else if (event.key === 'ArrowLeft') previous()
  else if (event.key === 'ArrowRight') next()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  stopTimer()
})

const currentBanner = computed<Banner | undefined>(() => props.banners[currentIndex.value])
</script>

<template>
  <Teleport to="body">
    <div v-if="open && currentBanner" class="fixed inset-0 z-[200] flex items-center justify-center bg-black">
      <div class="relative flex h-full w-full max-w-md flex-col">
        <div class="absolute inset-x-0 top-0 z-10 flex gap-1.5 p-3">
          <div v-for="(banner, index) in banners" :key="banner.id" class="h-1 flex-1 overflow-hidden rounded-pill bg-white/30">
            <div
              class="h-full bg-white"
              :style="{
                width: index < currentIndex ? '100%' : index === currentIndex ? `${progress}%` : '0%',
                transition: index === currentIndex ? 'none' : undefined
              }"
            />
          </div>
        </div>

        <button
          type="button"
          class="absolute right-3 top-8 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white"
          aria-label="Close"
          @click="close"
        >
          <RiCloseLine class="h-5 w-5" />
        </button>

        <img :src="currentBanner.imageUrl" :alt="currentBanner.title" class="h-full w-full object-contain">

        <div class="absolute inset-0 flex">
          <button type="button" class="w-1/3" aria-label="Previous story" @click="previous" />
          <button type="button" class="w-2/3" aria-label="Next story" @click="next" />
        </div>

        <button
          type="button"
          class="absolute left-2 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white sm:flex"
          aria-label="Previous story"
          @click="previous"
        >
          <RiArrowLeftSLine class="h-6 w-6" />
        </button>
        <button
          type="button"
          class="absolute right-2 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white sm:flex"
          aria-label="Next story"
          @click="next"
        >
          <RiArrowRightSLine class="h-6 w-6" />
        </button>

        <div class="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 to-transparent p-4">
          <p class="text-sm font-semibold text-white">{{ currentBanner.title }}</p>
          <a
            v-if="currentBanner.link"
            :href="currentBanner.link"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-white/90"
            @click.stop
          >
            {{ currentBanner.callToAction || 'Visit' }} <RiExternalLinkLine class="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  </Teleport>
</template>
