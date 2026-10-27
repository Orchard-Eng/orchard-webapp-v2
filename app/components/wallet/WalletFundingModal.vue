<script setup lang="ts">
import type { ApiEnvelope, DashboardData } from '~/types/api'

// Generic display shape — the caller maps whichever real API fields hold the funding
// account (currently user.profile.v_bank_name / v_bank_acct_name / v_bank_number).
interface FundingAccount {
  bank_name: string
  account_number: string
  account_name: string
}

const open = defineModel<boolean>('open', { default: false })
const props = defineProps<{
  account: FundingAccount | null
  email: string | null
  balance: string | null
  initialTab?: 'bank' | 'paystack'
}>()
const emit = defineEmits<{ result: [status: 'success' | 'error', message: string] }>()

const runtimeConfig = useRuntimeConfig()
const dashboardData = useNuxtData<ApiEnvelope<DashboardData>>('dashboard')

const activeTab = ref<'bank' | 'paystack'>(props.initialTab ?? 'bank')
const paystackAmount = ref('')
const paystackLoading = ref(false)
const paystackError = ref('')

const confirming = ref(false)
const confirmTimedOut = ref(false)

function parseBalance(value: string | null | undefined): number {
  return Number(String(value ?? '0').replace(/,/g, '')) || 0
}

const paystackAmountNumber = computed(() => Number(paystackAmount.value) || 0)
const paystackAmountValid = computed(() => paystackAmountNumber.value > 0)

const POLL_INTERVAL_MS = 5000
const MAX_POLL_ATTEMPTS = 24 // ~2 minutes
let pollTimer: ReturnType<typeof setInterval> | null = null
let pollAttempts = 0

function stopPolling() {
  if (pollTimer != null) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

// Neither the bank-transfer "confirm" endpoint nor a Paystack webhook are observable from
// here, so instead of trusting an unverified confirmation call, just watch the wallet
// balance itself (already cached under the shared 'dashboard' useLazyAsyncData key) until
// it changes.
function startConfirming() {
  confirming.value = true
  confirmTimedOut.value = false
  pollAttempts = 0
  const baseline = parseBalance(props.balance)
  stopPolling()
  pollTimer = setInterval(async () => {
    pollAttempts += 1
    await refreshNuxtData('dashboard')
    const latest = dashboardData.data.value?.data?.dashboard_data?.user?.wallet?.balance
    if (parseBalance(latest) !== baseline) {
      stopPolling()
      confirming.value = false
      open.value = false
      emit('result', 'success', 'Your wallet balance has been updated.')
      return
    }
    if (pollAttempts >= MAX_POLL_ATTEMPTS) {
      stopPolling()
      confirmTimedOut.value = true
    }
  }, POLL_INTERVAL_MS)
}

function confirmSent() {
  startConfirming()
}

async function payWithPaystack() {
  paystackError.value = ''
  if (!paystackAmountValid.value || !props.email) return
  paystackLoading.value = true
  try {
    await loadPaystackScript()
    // paystackLoading stays true (showing "Opening secure payment…") until onLoad fires,
    // bridging the gap between clicking Pay Now and Paystack's popup actually rendering —
    // v1's openIframe() had no equivalent signal, which is what produced a blank flash.
    new window.PaystackPop!().newTransaction({
      key: runtimeConfig.public.paystackPublicKey,
      email: props.email,
      amount: Math.round(paystackAmountNumber.value * 100),
      currency: 'NGN',
      reference: `orchard_${Date.now()}`,
      onLoad: () => {
        paystackLoading.value = false
      },
      onCancel: () => {
        paystackLoading.value = false
      },
      onError: (error) => {
        paystackLoading.value = false
        paystackError.value = error.message || 'We could not process this payment. Please try again.'
      },
      onSuccess: () => {
        paystackLoading.value = false
        startConfirming()
      }
    })
  } catch {
    paystackLoading.value = false
    paystackError.value = 'We could not open Paystack. Please try again.'
  }
}

function closeConfirming() {
  stopPolling()
  confirming.value = false
  open.value = false
}

watch(open, (isOpen) => {
  if (isOpen) {
    activeTab.value = props.initialTab ?? 'bank'
    paystackAmount.value = ''
    paystackError.value = ''
    confirming.value = false
    confirmTimedOut.value = false
  } else {
    stopPolling()
  }
})

onUnmounted(stopPolling)
</script>

<template>
  <Modal v-model:open="open" title="Fund Wallet">
    <div v-if="confirming" class="flex flex-col items-center gap-4 py-4 text-center">
      <template v-if="!confirmTimedOut">
        <span class="h-10 w-10 animate-spin rounded-full border-2 border-[var(--oc-border-strong)] border-t-[var(--oc-action-primary-bg)]" />
        <p class="text-sm text-[var(--oc-text-secondary)]">
          Waiting for your wallet balance to update. This usually takes a few minutes.
        </p>
      </template>
      <template v-else>
        <p class="text-sm text-[var(--oc-text-secondary)]">
          This is taking longer than usual. We'll reflect the update on your dashboard as soon as it's confirmed —
          you can safely close this window.
        </p>
        <button
          type="button"
          class="rounded-pill bg-[var(--oc-action-primary-bg)] px-5 py-2.5 text-sm font-semibold text-[var(--oc-action-primary-fg)]"
          @click="closeConfirming"
        >
          Close
        </button>
      </template>
    </div>

    <div v-else class="space-y-4">
      <div class="flex gap-2 rounded-md bg-[var(--oc-bg-subtle)] p-1 text-sm font-semibold">
        <button
          type="button"
          class="flex-1 rounded-md py-2 transition-colors duration-fast ease-standard"
          :class="activeTab === 'bank' ? 'bg-[var(--oc-bg-surface)] text-[var(--oc-text-primary)] shadow-sm' : 'text-[var(--oc-text-muted)]'"
          @click="activeTab = 'bank'"
        >
          Bank Transfer
        </button>
        <button
          type="button"
          class="flex-1 rounded-md py-2 transition-colors duration-fast ease-standard"
          :class="activeTab === 'paystack' ? 'bg-[var(--oc-bg-surface)] text-[var(--oc-text-primary)] shadow-sm' : 'text-[var(--oc-text-muted)]'"
          @click="activeTab = 'paystack'"
        >
          Pay with Paystack
        </button>
      </div>

      <template v-if="activeTab === 'bank'">
        <NuxtImg src="/images/orchard_app_icons/fund_wallet-elementor-io-optimized.webp" width="96" height="96" loading="lazy" alt="" class="mx-auto h-24 w-24 object-contain" />

        <p class="text-sm text-[var(--oc-text-secondary)]">
          Transfer funds to your dedicated wallet account below. It takes a few minutes for the
          funds to reflect in your wallet.
        </p>

        <div class="space-y-3 rounded-lg border border-[var(--oc-border-default)] bg-[var(--oc-bg-subtle)] p-4">
          <div class="flex items-center justify-between text-sm">
            <span class="text-[var(--oc-text-muted)]">Bank Name</span>
            <span class="font-medium text-[var(--oc-text-primary)]">{{ account?.bank_name ?? '—' }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-[var(--oc-text-muted)]">Account Number</span>
            <span class="flex items-center gap-1 font-medium text-[var(--oc-text-primary)]">
              {{ account?.account_number ?? '—' }}
              <CopyButton v-if="account?.account_number" :text="account.account_number" label="Copy account number" />
            </span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-[var(--oc-text-muted)]">Account Name</span>
            <span class="font-medium text-[var(--oc-text-primary)]">{{ account?.account_name ?? '—' }}</span>
          </div>
        </div>

        <p class="text-xs text-[var(--oc-text-faint)]">
          Please note that it takes a few minutes to get the funds in your wallet.
        </p>

        <button
          type="button"
          class="w-full rounded-pill bg-[var(--oc-action-primary-bg)] px-5 py-2.5 text-sm font-semibold text-[var(--oc-action-primary-fg)] transition-colors duration-fast ease-standard hover:bg-[var(--oc-action-primary-bgHover)]"
          @click="confirmSent"
        >
          I have sent the money
        </button>
      </template>

      <template v-else>
        <NuxtImg src="/images/orchard_app_icons/fund_wallet-elementor-io-optimized.webp" width="96" height="96" loading="lazy" alt="" class="mx-auto h-24 w-24 object-contain" />

        <label class="block">
          <span class="mb-1 block text-sm font-semibold text-[var(--oc-text-primary)]">Amount to Fund</span>
          <input
            v-model="paystackAmount"
            type="number"
            min="0"
            placeholder="0.00"
            class="oc-tnum w-full rounded-md border border-[var(--oc-border-strong)] bg-[var(--oc-bg-surface)] px-3 py-2.5 text-sm text-[var(--oc-text-primary)] outline-none focus:border-[var(--oc-border-focus)] focus:ring-2 focus:ring-[var(--oc-focus-ring)]"
          >
        </label>

        <p v-if="paystackError" class="text-xs font-medium text-[var(--oc-status-danger-fg)]">{{ paystackError }}</p>

        <ActionButton
          :state="paystackLoading ? 'pending' : 'idle'"
          label="Pay Now"
          pending-label="Opening secure payment…"
          :disabled="!paystackAmountValid"
          class="w-full"
          @click="payWithPaystack"
        />
      </template>
    </div>
  </Modal>
</template>
