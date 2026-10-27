<script setup lang="ts">
import { RiBankLine, RiSecurePaymentLine } from '@remixicon/vue'

const emit = defineEmits<{ 'bank-transfer': []; 'online-payment': [] }>()

const open = ref(false)
const rootEl = ref<HTMLElement | null>(null)

function onClickOutside(event: MouseEvent) {
  if (rootEl.value && !rootEl.value.contains(event.target as Node)) open.value = false
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))

function selectBankTransfer() {
  open.value = false
  emit('bank-transfer')
}

function selectOnlinePayment() {
  open.value = false
  emit('online-payment')
}
</script>

<template>
  <div ref="rootEl" class="relative">
    <button
      type="button"
      class="rounded-pill bg-[var(--oc-action-primary-bg)] px-5 py-2.5 text-sm font-semibold text-[var(--oc-action-primary-fg)] transition-colors duration-fast ease-standard hover:bg-[var(--oc-action-primary-bgHover)]"
      @click="open = !open"
    >
      Add Money
    </button>

    <Transition
      enter-active-class="transition-all duration-fast ease-standard"
      leave-active-class="transition-all duration-fast ease-standard"
      enter-from-class="opacity-0 scale-95"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="open"
        class="absolute left-0 z-20 mt-2 w-64 overflow-hidden rounded-md border border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] shadow-md"
      >
        <button
          type="button"
          class="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-[var(--oc-bg-subtle)]"
          @click="selectOnlinePayment"
        >
          <RiSecurePaymentLine class="mt-0.5 h-4 w-4 shrink-0 text-[var(--oc-text-secondary)]" />
          <span>
            <span class="block text-sm font-medium text-[var(--oc-text-primary)]">Online Payment</span>
            <span class="block text-xs text-[var(--oc-text-muted)]">Pay with Paystack</span>
          </span>
        </button>
        <button
          type="button"
          class="flex w-full items-start gap-3 border-t border-[var(--oc-border-default)] px-4 py-3 text-left hover:bg-[var(--oc-bg-subtle)]"
          @click="selectBankTransfer"
        >
          <RiBankLine class="mt-0.5 h-4 w-4 shrink-0 text-[var(--oc-text-secondary)]" />
          <span>
            <span class="block text-sm font-medium text-[var(--oc-text-primary)]">Bank Transfer</span>
            <span class="block text-xs text-[var(--oc-text-muted)]">Manual account funding</span>
          </span>
        </button>
      </div>
    </Transition>
  </div>
</template>
