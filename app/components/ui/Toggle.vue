<script setup lang="ts">
const modelValue = defineModel<boolean>({ default: false })
defineProps<{ disabled?: boolean }>()
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :disabled="disabled"
    class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-pill transition-colors duration-fast ease-standard disabled:cursor-not-allowed disabled:opacity-50"
    :class="modelValue ? 'bg-[var(--oc-action-primary-bg)]' : 'bg-[var(--oc-bg-muted)]'"
    @click="!disabled && (modelValue = !modelValue)"
  >
    <span
      class="inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-fast ease-standard"
      :class="modelValue ? 'translate-x-5' : 'translate-x-1'"
    />
  </button>
</template>
