<script setup lang="ts">
import { RiComputerLine, RiMoonLine, RiSunLine } from '@remixicon/vue'

const open = defineModel<boolean>('open', { default: false })

const colorMode = useColorMode()

const OPTIONS = [
  { value: 'light', label: 'Light', icon: RiSunLine },
  { value: 'dark', label: 'Dark', icon: RiMoonLine },
  { value: 'system', label: 'System', icon: RiComputerLine }
] as const
</script>

<template>
  <Modal v-model:open="open" title="Appearance">
    <p class="text-sm text-[var(--oc-text-secondary)]">Choose how Orchard looks on this device.</p>

    <div class="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-[var(--oc-bg-subtle)] p-1">
      <button
        v-for="option in OPTIONS"
        :key="option.value"
        type="button"
        class="flex flex-col items-center gap-1.5 rounded-md py-3 text-xs font-semibold transition-colors duration-fast ease-standard"
        :class="
          colorMode.preference === option.value
            ? 'bg-[var(--oc-bg-surface)] text-[var(--oc-text-primary)] shadow-sm'
            : 'text-[var(--oc-text-muted)]'
        "
        @click="colorMode.preference = option.value"
      >
        <component :is="option.icon" class="h-5 w-5" />
        {{ option.label }}
      </button>
    </div>
  </Modal>
</template>
