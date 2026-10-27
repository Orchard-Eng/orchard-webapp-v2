<script setup lang="ts">
import { RiCheckLine, RiFileCopyLine } from '@remixicon/vue'

const props = withDefaults(defineProps<{ text: string; label?: string }>(), {
  label: 'Copy'
})

const { copy, copied } = useCopyToClipboard()
</script>

<template>
  <button
    type="button"
    class="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--oc-text-muted)] transition-colors duration-fast ease-standard hover:bg-[var(--oc-bg-subtle)] hover:text-[var(--oc-text-primary)]"
    :aria-label="label"
    @click="copy(props.text)"
  >
    <RiCheckLine v-if="copied" class="h-4 w-4 text-[var(--oc-status-success-solid)]" />
    <RiFileCopyLine v-else class="h-4 w-4" />
  </button>
</template>
