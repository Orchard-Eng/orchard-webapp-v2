<script setup lang="ts">
import { RiInformationLine } from '@remixicon/vue'
import type { ApiEnvelope, WithdrawRequest } from '~/types/api'

// Generic display shape — the caller maps whichever real API fields hold the user's
// linked withdrawal account (currently user.profile.nuban / nuban_account_name / nuban_bank).
interface DestinationAccount {
  bank_name: string
  account_number: string
  account_name: string
}

const open = defineModel<boolean>('open', { default: false })
const props = defineProps<{ destination: DestinationAccount | null; walletId: string | null; balance: string | null }>()
const emit = defineEmits<{ result: [status: 'success' | 'error', message: string] }>()

const step = ref<'amount' | 'pin'>('amount')
const amount = ref('')
const pin = ref('')
const api = useApi()
const submitAction = useAsyncAction()

// Confirmed live, 2026-08-19: a sub-10,000 withdraw is rejected server-side with
// "Withdrawal amount should be more than. 10000.00" — validated client-side too so the
// PIN step isn't reached only to fail on submit.
const MIN_WITHDRAWAL = 10000

const balanceNumber = computed(() => Number(String(props.balance ?? '0').replace(/,/g, '')) || 0)
const amountNumber = computed(() => Number(amount.value) || 0)
const amountValid = computed(
  () => amountNumber.value >= MIN_WITHDRAWAL && amountNumber.value <= balanceNumber.value
)
const amountError = computed(() => {
  if (!amount.value || amountNumber.value <= 0) return null
  if (amountNumber.value > balanceNumber.value) return 'Amount exceeds your available balance.'
  if (amountNumber.value < MIN_WITHDRAWAL) return `Minimum transfer amount is ${formatNaira(MIN_WITHDRAWAL)}.`
  return null
})

const canSubmit = computed(() => !!props.walletId && pin.value.length === 6)

function goToPin() {
  if (!amountValid.value) return
  step.value = 'pin'
}

function goBack() {
  step.value = 'amount'
}

async function submit() {
  if (!canSubmit.value || !props.walletId) return
  // POST /users/transactions/wallet/withdraw — confirmed via apex-user.crowdital.com's
  // compiled JS bundle (2026-08-19); this is the real Send Money endpoint. Requires the
  // wallet id and the transaction PIN, unlike the invest flow (plandocs/ORCHARD_HANDOFF.md §4.0).
  await submitAction.run(() =>
    api<ApiEnvelope<unknown>>('/users/transactions/wallet/withdraw', {
      method: 'POST',
      body: {
        wallet_id: props.walletId!,
        amount: amountNumber.value,
        pin: pin.value
      } satisfies WithdrawRequest
    })
  )
  if (submitAction.state.value === 'success') {
    open.value = false
    reset()
    await refreshNuxtData('dashboard')
    emit(
      'result',
      'success',
      'Your transfer request has been received and will be settled to your bank account within 24 working hours.'
    )
  } else {
    emit('result', 'error', getApiErrorMessage(submitAction.error.value, 'We could not process this transfer. Please try again.'))
  }
}

function reset() {
  amount.value = ''
  pin.value = ''
  step.value = 'amount'
}

function cancel() {
  open.value = false
  reset()
}
</script>

<template>
  <Modal v-model:open="open" title="Send Money">
    <div class="space-y-4">
      <NuxtImg v-if="step === 'amount'" src="/images/orchard_app_icons/send_money-elementor-io-optimized.webp" width="96" height="96" loading="lazy" alt="" class="mx-auto h-24 w-24 object-contain" />

      <div class="space-y-3 rounded-lg border border-[var(--oc-border-default)] bg-[var(--oc-bg-subtle)] p-4">
        <template v-if="step === 'amount'">
          <div class="flex items-center justify-between text-sm">
            <span class="text-[var(--oc-text-muted)]">Account Name</span>
            <span class="font-medium text-[var(--oc-text-primary)]">{{ destination?.account_name ?? '—' }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-[var(--oc-text-muted)]">Account Number</span>
            <span class="font-medium text-[var(--oc-text-primary)]">{{ destination?.account_number ?? '—' }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-[var(--oc-text-muted)]">Bank</span>
            <span class="font-medium text-[var(--oc-text-primary)]">{{ destination?.bank_name ?? '—' }}</span>
          </div>
        </template>
        <div v-else class="flex items-center justify-between text-sm">
          <span class="text-[var(--oc-text-muted)]">Sending to</span><br/>
          <span class="font-medium text-[var(--oc-text-primary)]">
            {{ destination?.account_name ?? '—' }} <br/> {{ destination?.bank_name ?? '—' }} <br/> {{ destination?.account_number ?? '—' }}
          </span>
        </div>
      </div>

      <template v-if="step === 'amount'">
        <label class="block">
          <span class="mb-1 block text-sm font-semibold text-[var(--oc-text-primary)]">Amount to Send</span>
          <input
            v-model="amount"
            type="number"
            min="0"
            placeholder="0.00"
            class="oc-tnum w-full rounded-md border border-[var(--oc-border-strong)] bg-[var(--oc-bg-surface)] px-3 py-2.5 text-sm text-[var(--oc-text-primary)] outline-none focus:border-[var(--oc-border-focus)] focus:ring-2 focus:ring-[var(--oc-focus-ring)]"
          >
          <span class="mt-1 block text-xs text-[var(--oc-text-faint)]">
            Available balance: <Currency :value="balanceNumber" />
          </span>
          <span v-if="amountError" class="mt-1 block text-xs font-medium text-[var(--oc-status-danger-fg)]">
            {{ amountError }}
          </span>
        </label>
      </template>

      <template v-else>
        <div>
          <span class="mb-1 block text-sm text-[var(--oc-text-muted)]">Amount</span>
          <p class="oc-tnum text-2xl font-semibold text-[var(--oc-text-primary)]"><Currency :value="amountNumber" /></p>
        </div>

        <div>
          <span class="mb-2 block text-sm font-semibold text-[var(--oc-text-primary)]">Transaction PIN</span>
          <PinInput v-model="pin" masked />
        </div>

        <div class="flex gap-2 rounded-md bg-[var(--oc-status-info-bg)] p-3 text-xs text-[var(--oc-status-info-fg)]">
          <RiInformationLine class="h-4 w-4 shrink-0" />
          <p>
            Transfer requests are usually settled in your bank account
            within 24 working hours. You will be notified as soon as this is completed.
          </p>
        </div>
      </template>
    </div>

    <template #footer>
      <div v-if="step === 'amount'" class="flex gap-3">
        <button
          type="button"
          class="flex-1 rounded-pill border border-[var(--oc-action-ghost-border)] px-5 py-2.5 text-sm font-semibold text-[var(--oc-action-ghost-fg)] transition-colors duration-fast ease-standard hover:bg-[var(--oc-bg-subtle)]"
          @click="cancel"
        >
          Cancel
        </button>
        <button
          type="button"
          class="flex-1 rounded-pill bg-[var(--oc-action-primary-bg)] px-5 py-2.5 text-sm font-semibold text-[var(--oc-action-primary-fg)] transition-colors duration-fast ease-standard hover:bg-[var(--oc-action-primary-bgHover)] disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!amountValid"
          @click="goToPin"
        >
          Next
        </button>
      </div>
      <div v-else class="flex gap-3">
        <button
          type="button"
          class="flex-1 rounded-pill border border-[var(--oc-action-ghost-border)] px-5 py-2.5 text-sm font-semibold text-[var(--oc-action-ghost-fg)] transition-colors duration-fast ease-standard hover:bg-[var(--oc-bg-subtle)]"
          @click="goBack"
        >
          Back
        </button>
        <ActionButton
          :state="submitAction.state.value"
          label="Continue"
          :disabled="!canSubmit"
          class="flex-1"
          @click="submit"
        />
      </div>
    </template>
  </Modal>
</template>
