<script setup lang="ts">
import type { Banner } from '~/types/api'

defineProps<{ banners: Banner[] }>()
const emit = defineEmits<{ open: [index: number] }>()
</script>

<template>
  <div class="flex gap-4 overflow-x-auto pb-1">
    <button
      v-for="(banner, index) in banners"
      :key="banner.id"
      type="button"
      class="flex shrink-0 flex-col items-center gap-1.5"
      @click="emit('open', index)"
    >
      <span
        class="flex h-16 w-16 items-center justify-center rounded-full p-0.5"
        :class="banner.viewStatus === 'unviewed' ? 'bg-gradient-to-tr from-orange-500 to-green-500' : 'bg-[var(--oc-border-default)]'"
      >
        <span class="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-[var(--oc-bg-surface)] bg-[var(--oc-bg-subtle)]">
          <img :src="banner.imageUrl" :alt="banner.title" class="h-full w-full object-cover">
        </span>
      </span>
      <span class="max-w-[4.5rem] truncate text-xs font-medium text-[var(--oc-text-secondary)]">
        {{ banner.title }}
      </span>
    </button>
  </div>
</template>
