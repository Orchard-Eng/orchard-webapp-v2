<script setup lang="ts">
import type { ApiEnvelope, Bank, DashboardData, KycSubmissionRequest } from '~/types/api'

const open = defineModel<boolean>('open', { default: false })

const api = useApi()
const authStore = useAuthStore()
// Reads the same 'dashboard' cache every page that needs the user already fetches, rather
// than requiring callers (the dashboard banner, the settings section, the post-login
// auto-open) to each thread a `user` prop through.
const dashboardData = useNuxtData<ApiEnvelope<DashboardData>>('dashboard')
const user = computed(() => dashboardData.data.value?.data?.dashboard_data?.user)

// GET /users/onboard/banks — double-enveloped (confirmed live, 2026-08-19): the outer
// ApiEnvelope's own `data` wraps a second {status, message, data} object.
const { data: banksRes } = useLazyAsyncData('onboard-banks', () =>
  api<ApiEnvelope<{ status: boolean; message: string; data: Bank[] }>>('/users/onboard/banks')
)
const banks = computed(() => banksRes.value?.data?.data ?? [])

const bankCode = ref('')
const accountNumber = ref('')
const bvn = ref('')
const nin = ref('')

function sanitizeDigits(value: string, maxLength: number) {
  return value.replace(/\D/g, '').slice(0, maxLength)
}

const selectedBank = computed(() => banks.value.find((b) => b.code === bankCode.value))

// Resolved server-side (server/api/paystack/resolve-account.get.ts) — the Paystack secret
// key this needs can never be exposed to the browser, so the actual Paystack call happens
// in that same-origin Nitro route; this just triggers it and shows the result.
const resolvedAccountName = ref('')
const resolving = ref(false)
const resolveError = ref('')
let resolveTimer: ReturnType<typeof setTimeout> | null = null

watch([bankCode, accountNumber], () => {
  resolvedAccountName.value = ''
  resolveError.value = ''
  if (resolveTimer) clearTimeout(resolveTimer)
  if (!bankCode.value || accountNumber.value.length !== 10) return
  resolveTimer = setTimeout(resolveAccount, 500)
})

async function resolveAccount() {
  resolving.value = true
  resolveError.value = ''
  try {
    const res = await $fetch<{ account_name: string }>('/api/paystack/resolve-account', {
      query: { account_number: accountNumber.value, bank_code: bankCode.value },
      headers: authStore.token ? { Authorization: `Bearer ${authStore.token}` } : undefined
    })
    resolvedAccountName.value = res.account_name
  } catch (err) {
    resolveError.value = getApiErrorMessage(err, "We couldn't verify this account number. Please check the details and try again.")
  } finally {
    resolving.value = false
  }
}

onUnmounted(() => {
  if (resolveTimer) clearTimeout(resolveTimer)
})

const isValid = computed(
  () =>
    !!bankCode.value &&
    accountNumber.value.trim().length >= 10 &&
    bvn.value.length === 11 &&
    nin.value.length === 11 &&
    !!resolvedAccountName.value
)

const submitAction = useAsyncAction()
const resultModal = ref<{ status: 'success' | 'error'; title: string; message: string; image?: string } | null>(null)
const GENERIC_SUCCESS_IMAGE = '/images/orchard_app_icons/successful-elementor-io-optimized.webp'
const GENERIC_FAILED_IMAGE = '/images/orchard_app_icons/failed-elementor-io-optimized.webp'

async function submit() {
  if (!isValid.value || !user.value || !selectedBank.value) return
  const currentUser = user.value
  const bank = selectedBank.value
  await submitAction.run(() =>
    api<ApiEnvelope<unknown>>('/users/verify/bvnfull', {
      method: 'POST',
      body: {
        bvn: bvn.value,
        nin: nin.value,
        first_name: currentUser.profile.firstname,
        last_name: currentUser.profile.lastname,
        email: currentUser.email,
        phone: currentUser.mobile_number,
        account_number: accountNumber.value.trim(),
        bank_code: bank.code,
        bank: bank.name,
        account_name: resolvedAccountName.value
      } satisfies KycSubmissionRequest
    })
  )
  if (submitAction.state.value === 'success') {
    await refreshNuxtData('dashboard')
    open.value = false
    resultModal.value = {
      status: 'success',
      title: 'Verification Submitted',
      message: 'Your identity verification details have been submitted successfully.',
      image: GENERIC_SUCCESS_IMAGE
    }
  } else {
    resultModal.value = {
      status: 'error',
      title: 'Verification Failed',
      message: getApiErrorMessage(submitAction.error.value, 'We could not verify your details. Please try again.'),
      image: GENERIC_FAILED_IMAGE
    }
  }
}

const inputClasses =
  'w-full rounded-md border border-[var(--oc-border-strong)] bg-[var(--oc-bg-surface)] px-3 py-2.5 text-sm text-[var(--oc-text-primary)] outline-none focus:border-[var(--oc-border-focus)] focus:ring-2 focus:ring-[var(--oc-focus-ring)]'
</script>

<template>
  <Modal v-model:open="open" title="Identity Verification">
    <div class="space-y-4">
      <p class="text-xs font-semibold uppercase tracking-wide text-[var(--oc-text-muted)]">Step 1</p>
      <p class="text-sm text-[var(--oc-text-secondary)]">
        Provide your bank account and identity details so we can verify your account.
      </p>

      <label class="block text-sm">
        <span class="mb-1 block font-medium text-[var(--oc-text-primary)]">Bank</span>
        <select v-model="bankCode" :class="inputClasses">
          <option value="" disabled>Select your bank</option>
          <option v-for="bank in banks" :key="bank.code" :value="bank.code">{{ bank.name }}</option>
        </select>
      </label>

      <label class="block text-sm">
        <span class="mb-1 block font-medium text-[var(--oc-text-primary)]">Account Number</span>
        <input
          :value="accountNumber"
          type="text"
          inputmode="numeric"
          maxlength="10"
          autocomplete="off"
          :class="inputClasses"
          @input="accountNumber = sanitizeDigits(($event.target as HTMLInputElement).value, 10)"
        >
        <span v-if="resolving" class="mt-1 block text-xs text-[var(--oc-text-faint)]">Verifying account…</span>
        <span v-else-if="resolvedAccountName" class="mt-1 block text-xs font-medium text-[var(--oc-status-success-fg)]">
          Account Name: {{ resolvedAccountName }}
        </span>
        <span v-else-if="resolveError" class="mt-1 block text-xs font-medium text-[var(--oc-status-danger-fg)]">
          {{ resolveError }}
        </span>
        <span v-else class="mt-1 block text-xs text-[var(--oc-text-faint)]">We'll verify this account automatically.</span>
      </label>

      <label class="block text-sm">
        <span class="mb-1 inline-flex items-center gap-1 font-medium text-[var(--oc-text-primary)]">
          BVN
          <InfoTip text="Your 11-digit Bank Verification Number, used to confirm your identity with your bank. Dial *565*0# from your registered phone number to retrieve it." />
        </span>
        <input
          :value="bvn"
          type="text"
          inputmode="numeric"
          maxlength="11"
          autocomplete="off"
          :class="inputClasses"
          @input="bvn = sanitizeDigits(($event.target as HTMLInputElement).value, 11)"
        >
      </label>

      <label class="block text-sm">
        <span class="mb-1 inline-flex items-center gap-1 font-medium text-[var(--oc-text-primary)]">
          NIN
          <InfoTip text="Your 11-digit National Identification Number, required by Nigerian financial regulation to verify who you are." />
        </span>
        <input
          :value="nin"
          type="text"
          inputmode="numeric"
          maxlength="11"
          autocomplete="off"
          :class="inputClasses"
          @input="nin = sanitizeDigits(($event.target as HTMLInputElement).value, 11)"
        >
      </label>
    </div>

    <template #footer>
      <ActionButton
        :state="submitAction.state.value"
        label="Submit for Verification"
        :disabled="!isValid"
        class="w-full"
        @click="submit"
      />
    </template>
  </Modal>

  <ResultModal
    v-if="resultModal"
    :open="!!resultModal"
    :status="resultModal.status"
    :title="resultModal.title"
    :message="resultModal.message"
    :image="resultModal.image"
    @update:open="(v) => !v && (resultModal = null)"
  />
</template>
