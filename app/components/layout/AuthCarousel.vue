<script setup lang="ts">
const images = [
  '/images/auth/hero_img.webp',
  '/images/auth/hero_img2.webp',
  '/images/auth/hero_img3.webp',
  '/images/auth/about_img.webp'
]

// Same 5s cadence as StoryViewer.vue's auto-advance, for consistency.
const INTERVAL_MS = 5000
const index = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    index.value = (index.value + 1) % images.length
  }, INTERVAL_MS)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="relative h-full w-full overflow-hidden">
    <NuxtImg
      v-for="(src, i) in images"
      :key="src"
      :src="src"
      width="960"
      height="1280"
      quality="75"
      :loading="i === 0 ? 'eager' : 'lazy'"
      :fetchpriority="i === 0 ? 'high' : 'auto'"
      alt=""
      class="absolute inset-0 h-full w-full object-cover transition-opacity duration-slow ease-standard"
      :class="i === index ? 'opacity-100' : 'opacity-0'"
    />
  </div>
</template>
