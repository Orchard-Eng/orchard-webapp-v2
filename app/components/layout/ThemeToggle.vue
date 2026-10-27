<script setup lang="ts">
import { RiMoonLine, RiSunLine } from '@remixicon/vue'

const colorMode = useColorMode()

function toggle() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <button
    type="button"
    class="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--oc-border-default)] text-[var(--oc-text-secondary)] transition-colors duration-fast ease-standard hover:bg-[var(--oc-bg-subtle)] hover:text-[var(--oc-text-primary)]"
    :aria-label="colorMode.value === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggle"
  >
    <RiMoonLine v-if="colorMode.value === 'dark'" class="h-5 w-5" />
    <RiSunLine v-else class="h-5 w-5" />
  </button>
</template>
