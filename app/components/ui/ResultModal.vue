<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })
const props = defineProps<{ status: 'success' | 'error'; title: string; message: string; image?: string; actionLabel?: string }>()

const image = computed(() =>
  props.image ??
  (props.status === 'success'
    ? '/images/orchard_app_icons/transaction_successful-elementor-io-optimized.webp'
    : '/images/orchard_app_icons/transaction_failed-elementor-io-optimized.webp')
)

function dismiss() {
  open.value = false
}
</script>

<template>
  <Modal v-model:open="open">
    <div class="flex flex-col items-center gap-4 py-2 text-center">
      <NuxtImg :src="image" width="96" height="96" alt="" class="h-24 w-24 object-contain" />
      <div>
        <h3 class="oc-display text-lg font-semibold text-[var(--oc-text-primary)]">{{ title }}</h3>
        <p class="mt-1 text-sm text-[var(--oc-text-muted)]">{{ message }}</p>
      </div>
    </div>

    <template #footer>
      <button
        type="button"
        class="w-full rounded-pill bg-[var(--oc-action-primary-bg)] px-5 py-2.5 text-sm font-semibold text-[var(--oc-action-primary-fg)] transition-colors duration-fast ease-standard hover:bg-[var(--oc-action-primary-bgHover)]"
        @click="dismiss"
      >
        {{ actionLabel ?? 'Done' }}
      </button>
    </template>
  </Modal>
</template>
