<script setup lang="ts">
const props = defineProps<{ status: string }>()

const tone = computed(() => {
  const s = props.status.toLowerCase()
  if (['successful', 'completed', 'active'].includes(s)) return 'success'
  if (['pending', 'processing', 'maturing soon'].includes(s)) return 'warning'
  if (['failed', 'declined', 'cancelled'].includes(s)) return 'danger'
  return 'info'
})

const toneClasses: Record<string, string> = {
  success: 'bg-[var(--oc-status-success-bg)] text-[var(--oc-status-success-fg)]',
  warning: 'bg-[var(--oc-status-warning-bg)] text-[var(--oc-status-warning-fg)]',
  danger: 'bg-[var(--oc-status-danger-bg)] text-[var(--oc-status-danger-fg)]',
  info: 'bg-[var(--oc-status-info-bg)] text-[var(--oc-status-info-fg)]'
}

const dotClasses: Record<string, string> = {
  success: 'bg-[var(--oc-status-success-solid)]',
  warning: 'bg-[var(--oc-status-warning-solid)]',
  danger: 'bg-[var(--oc-status-danger-solid)]',
  info: 'bg-[var(--oc-status-info-solid)]'
}
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-semibold capitalize"
    :class="toneClasses[tone]"
  >
    <span class="h-1.5 w-1.5 rounded-full" :class="dotClasses[tone]" />
    {{ status }}
  </span>
</template>
