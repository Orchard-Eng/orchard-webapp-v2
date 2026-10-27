<script setup lang="ts">
import { RiInformationLine } from '@remixicon/vue'

withDefaults(defineProps<{ text: string; align?: 'center' | 'right' }>(), { align: 'center' })

const open = ref(false)
const root = ref<HTMLElement | null>(null)

function toggle() {
  open.value = !open.value
}

function onDocumentClick(event: MouseEvent) {
  if (root.value && !root.value.contains(event.target as Node)) open.value = false
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') open.value = false
}

watch(open, (isOpen) => {
  if (isOpen) {
    document.addEventListener('click', onDocumentClick)
    document.addEventListener('keydown', onKeydown)
  } else {
    document.removeEventListener('click', onDocumentClick)
    document.removeEventListener('keydown', onKeydown)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <span ref="root" class="relative inline-flex">
    <button
      type="button"
      aria-label="More information"
      :aria-expanded="open"
      class="inline-flex h-4 w-4 items-center justify-center rounded-full text-[var(--oc-text-faint)] transition-colors duration-fast ease-standard hover:bg-[var(--oc-bg-subtle)] hover:text-[var(--oc-text-secondary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--oc-focus-ring)]"
      @click="toggle"
    >
      <RiInformationLine class="h-3.5 w-3.5" />
    </button>

    <div
      v-if="open"
      role="tooltip"
      class="absolute top-full z-20 mt-2 w-56 max-w-[calc(100vw-2rem)] rounded-md border border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] p-3 text-left text-xs font-normal leading-relaxed text-[var(--oc-text-secondary)] shadow-lg"
      :class="align === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2'"
    >
      {{ text }}
    </div>
  </span>
</template>
