<script setup lang="ts">
import { RiArrowRightSLine } from '@remixicon/vue'
import type { Component } from 'vue'

// `to` comes through as a fallthrough attribute (not a declared prop) so it lands on
// whichever root element (NuxtLink vs button) actually renders, via Vue's normal
// single-root attribute inheritance.
defineProps<{ icon: Component; title: string; subtitle: string; danger?: boolean }>()
</script>

<template>
  <component
    :is="$attrs.to ? 'NuxtLink' : 'button'"
    :type="$attrs.to ? undefined : 'button'"
    class="flex w-full items-center gap-4 px-2 py-4 text-left transition-colors duration-fast ease-standard hover:bg-[var(--oc-bg-subtle)]"
  >
    <span
      class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
      :class="danger ? 'bg-[var(--oc-status-danger-bg)] text-[var(--oc-status-danger-fg)]' : 'bg-ink text-white'"
    >
      <component :is="icon" class="h-5 w-5" />
    </span>
    <span class="min-w-0 flex-1">
      <span class="block text-sm font-semibold" :class="danger ? 'text-[var(--oc-status-danger-fg)]' : 'text-[var(--oc-text-primary)]'">
        {{ title }}
      </span>
      <span class="block truncate text-xs text-[var(--oc-text-muted)]">{{ subtitle }}</span>
    </span>
    <RiArrowRightSLine class="h-5 w-5 shrink-0 text-[var(--oc-text-faint)]" />
  </component>
</template>
