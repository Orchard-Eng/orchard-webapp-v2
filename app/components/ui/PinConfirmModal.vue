<script setup lang="ts">
import type { ApiEnvelope, VerifyTransactionPinRequest } from '~/types/api'

const open = defineModel<boolean>('open', { default: false })
const props = withDefaults(
  defineProps<{ title?: string; description?: string; pending?: boolean; errorMessage?: string | null }>(),
  { title: 'Confirm with your PIN', description: 'Enter your transaction PIN to continue.', pending: false, errorMessage: null }
)
const emit = defineEmits<{ confirm: [pin: string] }>()

const api = useApi()
const pin = ref('')
const verifyAction = useAsyncAction()
const verifyError = ref<string | null>(null)

const isPending = computed(() => verifyAction.state.value === 'pending' || props.pending)
const displayError = computed(() => verifyError.value ?? props.errorMessage)

// POST /users/verify/transaction-pin — an independent check called before the real action,
// since invest/enable2fa themselves don't reject a wrong pin server-side (confirmed live,
// 2026-09-08: both executed successfully with an arbitrary pin — see InvestOrderRequest /
// TwoFactorToggleRequest in ~/types/api.ts). This only protects a user going through this
// app's own UI, not a direct API call with a valid token — the real fix belongs on those
// two endpoints server-side.
async function submit() {
  if (pin.value.length !== 6 || isPending.value) return
  verifyError.value = null
  await verifyAction.run(() =>
    api<ApiEnvelope<unknown>>('/users/verify/transaction-pin', {
      method: 'POST',
      body: { pin: pin.value } satisfies VerifyTransactionPinRequest
    })
  )
  if (verifyAction.state.value === 'success') {
    emit('confirm', pin.value)
  } else {
    verifyError.value = getApiErrorMessage(verifyAction.error.value, 'Incorrect PIN. Please try again.')
  }
}

watch(open, (isOpen) => {
  if (!isOpen) {
    pin.value = ''
    verifyError.value = null
  }
})
</script>

<template>
  <Modal v-model:open="open" :title="title">
    <div class="space-y-4">
      <p class="text-sm text-[var(--oc-text-secondary)]">{{ description }}</p>
      <div>
        <span class="mb-2 block text-sm font-medium text-[var(--oc-text-primary)]">Transaction PIN</span>
        <PinInput v-model="pin" masked :invalid="!!displayError" />
      </div>
      <p v-if="displayError" class="text-xs font-medium text-[var(--oc-status-danger-fg)]">{{ displayError }}</p>
    </div>

    <template #footer>
      <ActionButton
        :state="isPending ? 'pending' : 'idle'"
        label="Confirm"
        :disabled="pin.length !== 6 || isPending"
        class="w-full"
        @click="submit"
      />
    </template>
  </Modal>
</template>
