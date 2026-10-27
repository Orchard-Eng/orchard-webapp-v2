<script setup lang="ts">
import { RiLoader4Line } from '@remixicon/vue'
import type { AsyncActionState } from '~/composables/useAsyncAction'

const props = withDefaults(
  defineProps<{
    state?: AsyncActionState
    label: string
    pendingLabel?: string
    variant?: 'primary' | 'secondary'
    disabled?: boolean
    type?: 'button' | 'submit'
  }>(),
  {
    state: 'idle',
    pendingLabel: 'Processing…',
    variant: 'primary',
    disabled: false,
    type: 'button'
  }
)

const isPending = computed(() => props.state === 'pending')

const variantClasses = computed(() =>
  props.variant === 'primary'
    ? 'bg-[var(--oc-action-primary-bg)] text-[var(--oc-action-primary-fg)] hover:bg-[var(--oc-action-primary-bgHover)]'
    : 'bg-[var(--oc-action-secondary-bg)] text-[var(--oc-action-secondary-fg)] hover:bg-[var(--oc-action-secondary-bgHover)]'
)
</script>

<template>
  <button
    :type="type"
    class="inline-flex items-center justify-center gap-2 rounded-pill px-5 py-2.5 text-sm font-semibold transition-colors duration-fast ease-standard disabled:cursor-not-allowed disabled:opacity-50"
    :class="variantClasses"
    :disabled="disabled || isPending"
  >
    <RiLoader4Line v-if="isPending" class="h-4 w-4 animate-spin" />
    <span v-if="isPending">{{ pendingLabel }}</span>
    <slot v-else>{{ label }}</slot>
  </button>
</template>
