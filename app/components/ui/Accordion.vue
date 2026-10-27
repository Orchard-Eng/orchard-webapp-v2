<script setup lang="ts">
import { RiAddLine, RiSubtractLine } from '@remixicon/vue'

const open = defineModel<boolean>('open', { default: false })
defineProps<{ title: string }>()
</script>

<template>
  <div class="border-b border-[var(--oc-border-default)] py-4 last:border-b-0">
    <button
      type="button"
      class="flex w-full items-center justify-between text-left"
      @click="open = !open"
    >
      <span class="text-sm font-semibold text-[var(--oc-text-primary)]">{{ title }}</span>
      <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--oc-bg-subtle)] text-[var(--oc-text-secondary)]">
        <RiSubtractLine v-if="open" class="h-3.5 w-3.5" />
        <RiAddLine v-else class="h-3.5 w-3.5" />
      </span>
    </button>
    <div
      v-if="open"
      class="mt-3 min-w-0 break-words text-sm leading-relaxed text-[var(--oc-text-secondary)] [overflow-wrap:anywhere] [&_*]:max-w-full"
    >
      <slot />
    </div>
  </div>
</template>
