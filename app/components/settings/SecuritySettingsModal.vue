<script setup lang="ts">
import { RiEyeLine, RiEyeOffLine } from '@remixicon/vue'
import type { ApiEnvelope, ChangePasswordRequest, DashboardData, TwoFactorToggleRequest } from '~/types/api'

const open = defineModel<boolean>('open', { default: false })

const api = useApi()
const dashboardData = useNuxtData<ApiEnvelope<DashboardData>>('dashboard')
const user = computed(() => dashboardData.data.value?.data?.dashboard_data?.user)

const activeTab = ref<'password' | 'pin' | '2fa'>('password')

watch(open, (isOpen) => {
  if (isOpen) activeTab.value = 'password'
})

const resultModal = ref<{ status: 'success' | 'error'; title: string; message: string; image?: string } | null>(null)
const GENERIC_SUCCESS_IMAGE = '/images/orchard_app_icons/successful-elementor-io-optimized.webp'
const GENERIC_FAILED_IMAGE = '/images/orchard_app_icons/failed-elementor-io-optimized.webp'

// --- Password update ---
// PATCH /users/settings/passwordchange — the real authenticated "change password while
// logged in" endpoint (confirmed via the Postman collection), verifying current_password
// server-side. Distinct from POST /users/auth/resetpassword, which stays reserved for the
// logged-out forgot-password flow (no current-password check there, by design).
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const passwordAction = useAsyncAction()
const passwordValid = computed(
  () => currentPassword.value.length > 0 && newPassword.value.length >= 8 && newPassword.value === confirmPassword.value
)
const passwordMismatch = computed(
  () => confirmPassword.value.length > 0 && newPassword.value !== confirmPassword.value
)

async function updatePassword() {
  if (!passwordValid.value || !user.value?.email) return
  await passwordAction.run(() =>
    api<ApiEnvelope<unknown>>('/users/settings/passwordchange', {
      method: 'PATCH',
      body: {
        email: user.value!.email,
        current_password: currentPassword.value,
        new_password: newPassword.value
      } satisfies ChangePasswordRequest
    })
  )
  if (passwordAction.state.value === 'success') {
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    resultModal.value = {
      status: 'success',
      title: 'Password Updated',
      message: 'Your password has been changed successfully.',
      image: GENERIC_SUCCESS_IMAGE
    }
  } else {
    resultModal.value = {
      status: 'error',
      title: 'Password Update Failed',
      message: getApiErrorMessage(passwordAction.error.value, 'We could not update your password. Please try again.'),
      image: GENERIC_FAILED_IMAGE
    }
  }
}

// --- PIN update ---
// PATCH /users/settings/resetpin — the correct authenticated pin-change endpoint (takes
// current_pin + new_pin), as opposed to POST /users/onboard/createpin which is for setting
// a PIN during onboarding and has no concept of a "current" PIN to verify.
const currentPin = ref('')
const newPin = ref('')
const confirmPin = ref('')
const pinAction = useAsyncAction()
const pinValid = computed(() => currentPin.value.length === 6 && newPin.value.length === 6 && newPin.value === confirmPin.value)
const pinMismatch = computed(() => confirmPin.value.length === 6 && newPin.value !== confirmPin.value)

async function updatePin() {
  if (!pinValid.value) return
  await pinAction.run(() =>
    api<ApiEnvelope<unknown>>('/users/settings/resetpin', {
      method: 'PATCH',
      body: { current_pin: currentPin.value, new_pin: newPin.value }
    })
  )
  if (pinAction.state.value === 'success') {
    currentPin.value = ''
    newPin.value = ''
    confirmPin.value = ''
    resultModal.value = {
      status: 'success',
      title: 'PIN Updated',
      message: 'Your transaction PIN has been changed successfully.',
      image: GENERIC_SUCCESS_IMAGE
    }
  } else {
    resultModal.value = {
      status: 'error',
      title: 'PIN Update Failed',
      message: getApiErrorMessage(pinAction.error.value, 'We could not update your PIN. Please try again.'),
      image: GENERIC_FAILED_IMAGE
    }
  }
}

// --- 2FA toggle ---
// PATCH /users/auth/enable2fa — confirmed via the Postman collection, 2026-09-08: requires
// the transaction pin inline, in both directions (not just when disabling).
const twoFactorEnabled = ref(false)
watchEffect(() => {
  twoFactorEnabled.value = user.value?.two_factor_enabled ?? false
})
const twoFactorAction = useAsyncAction()
const twoFactorPinModalOpen = ref(false)
const twoFactorPinError = ref<string | null>(null)
const pendingTwoFactorState = ref(false)

function toggleTwoFactor() {
  pendingTwoFactorState.value = !twoFactorEnabled.value
  twoFactorPinError.value = null
  twoFactorPinModalOpen.value = true
}

async function applyTwoFactorChange(pin: string) {
  const next = pendingTwoFactorState.value
  twoFactorPinError.value = null
  await twoFactorAction.run(() =>
    api<ApiEnvelope<unknown>>('/users/auth/enable2fa', {
      method: 'PATCH',
      body: { requires_2fa: next, pin } satisfies TwoFactorToggleRequest
    })
  )
  if (twoFactorAction.state.value === 'success') {
    twoFactorPinModalOpen.value = false
    twoFactorEnabled.value = next
    resultModal.value = {
      status: 'success',
      title: 'Two-Factor Authentication Updated',
      message: next ? 'Two-factor authentication has been enabled.' : 'Two-factor authentication has been disabled.',
      image: GENERIC_SUCCESS_IMAGE
    }
  } else {
    twoFactorPinError.value = getApiErrorMessage(twoFactorAction.error.value, 'We could not update your two-factor setting. Please try again.')
  }
}

const inputClasses =
  'w-full rounded-md border border-[var(--oc-border-strong)] bg-[var(--oc-bg-surface)] px-3 py-2.5 pr-10 text-sm text-[var(--oc-text-primary)] outline-none focus:border-[var(--oc-border-focus)] focus:ring-2 focus:ring-[var(--oc-focus-ring)]'
</script>

<template>
  <Modal v-model:open="open" title="Security Settings">
    <div class="flex gap-2 rounded-md bg-[var(--oc-bg-subtle)] p-1 text-sm font-semibold">
      <button
        type="button"
        class="flex-1 rounded-md py-2 transition-colors duration-fast ease-standard"
        :class="activeTab === 'password' ? 'bg-[var(--oc-bg-surface)] text-[var(--oc-text-primary)] shadow-sm' : 'text-[var(--oc-text-muted)]'"
        @click="activeTab = 'password'"
      >
        Password
      </button>
      <button
        type="button"
        class="flex-1 rounded-md py-2 transition-colors duration-fast ease-standard"
        :class="activeTab === 'pin' ? 'bg-[var(--oc-bg-surface)] text-[var(--oc-text-primary)] shadow-sm' : 'text-[var(--oc-text-muted)]'"
        @click="activeTab = 'pin'"
      >
        PIN
      </button>
      <button
        type="button"
        class="flex-1 rounded-md py-2 transition-colors duration-fast ease-standard"
        :class="activeTab === '2fa' ? 'bg-[var(--oc-bg-surface)] text-[var(--oc-text-primary)] shadow-sm' : 'text-[var(--oc-text-muted)]'"
        @click="activeTab = '2fa'"
      >
        2FA
      </button>
    </div>

    <form v-if="activeTab === 'password'" class="mt-4 space-y-4" @submit.prevent="updatePassword">
      <label class="relative block text-sm">
        <span class="mb-1 block font-medium text-[var(--oc-text-primary)]">Current Password</span>
        <input
          v-model="currentPassword"
          :type="showCurrentPassword ? 'text' : 'password'"
          autocomplete="current-password"
          :class="inputClasses"
        >
        <button
          type="button"
          class="absolute right-2 top-[34px] text-[var(--oc-text-muted)]"
          :aria-label="showCurrentPassword ? 'Hide password' : 'Show password'"
          @click="showCurrentPassword = !showCurrentPassword"
        >
          <RiEyeOffLine v-if="showCurrentPassword" class="h-4 w-4" />
          <RiEyeLine v-else class="h-4 w-4" />
        </button>
      </label>
      <label class="relative block text-sm">
        <span class="mb-1 block font-medium text-[var(--oc-text-primary)]">New Password</span>
        <input
          v-model="newPassword"
          :type="showNewPassword ? 'text' : 'password'"
          autocomplete="new-password"
          :class="inputClasses"
        >
        <button
          type="button"
          class="absolute right-2 top-[34px] text-[var(--oc-text-muted)]"
          :aria-label="showNewPassword ? 'Hide password' : 'Show password'"
          @click="showNewPassword = !showNewPassword"
        >
          <RiEyeOffLine v-if="showNewPassword" class="h-4 w-4" />
          <RiEyeLine v-else class="h-4 w-4" />
        </button>
      </label>
      <label class="relative block text-sm">
        <span class="mb-1 block font-medium text-[var(--oc-text-primary)]">Confirm New Password</span>
        <input
          v-model="confirmPassword"
          :type="showConfirmPassword ? 'text' : 'password'"
          autocomplete="new-password"
          :class="inputClasses"
        >
        <button
          type="button"
          class="absolute right-2 top-[34px] text-[var(--oc-text-muted)]"
          :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
          @click="showConfirmPassword = !showConfirmPassword"
        >
          <RiEyeOffLine v-if="showConfirmPassword" class="h-4 w-4" />
          <RiEyeLine v-else class="h-4 w-4" />
        </button>
      </label>
      <p v-if="passwordMismatch" class="text-xs font-medium text-[var(--oc-status-danger-fg)]">
        Passwords must match and be at least 8 characters.
      </p>
      <ActionButton
        :state="passwordAction.state.value"
        label="Update Password"
        variant="secondary"
        type="submit"
        :disabled="!passwordValid"
      />
    </form>

    <form v-else-if="activeTab === 'pin'" class="mt-4 space-y-4" @submit.prevent="updatePin">
      <div>
        <span class="mb-2 block text-sm font-medium text-[var(--oc-text-primary)]">Current Pin</span>
        <PinInput v-model="currentPin" masked />
      </div>
      <div>
        <span class="mb-2 block text-sm font-medium text-[var(--oc-text-primary)]">New Pin</span>
        <PinInput v-model="newPin" masked />
      </div>
      <div>
        <span class="mb-2 block text-sm font-medium text-[var(--oc-text-primary)]">Confirm New Pin</span>
        <PinInput v-model="confirmPin" masked :invalid="pinMismatch" />
      </div>
      <p v-if="pinMismatch" class="text-xs font-medium text-[var(--oc-status-danger-fg)]">
        PINs must match and be 6 digits.
      </p>
      <ActionButton :state="pinAction.state.value" label="Update Pin" variant="secondary" type="submit" :disabled="!pinValid" />
    </form>

    <div v-else class="mt-4 flex items-center justify-between rounded-lg bg-[var(--oc-bg-subtle)] p-4">
      <div>
        <p class="text-sm font-semibold text-[var(--oc-text-primary)]">Two Factor Authentication</p>
        <p class="mt-1 text-xs text-[var(--oc-text-muted)]">
          Add an extra layer of security to your account when signing in.
        </p>
      </div>
      <Toggle :model-value="twoFactorEnabled" :disabled="twoFactorAction.state.value === 'pending'" @update:model-value="toggleTwoFactor" />
    </div>
  </Modal>

  <PinConfirmModal
    v-model:open="twoFactorPinModalOpen"
    :title="pendingTwoFactorState ? 'Enable Two-Factor Authentication' : 'Disable Two-Factor Authentication'"
    :description="`Enter your transaction PIN to confirm you want to ${pendingTwoFactorState ? 'enable' : 'disable'} two-factor authentication.`"
    :pending="twoFactorAction.state.value === 'pending'"
    :error-message="twoFactorPinError"
    @confirm="applyTwoFactorChange"
  />

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
