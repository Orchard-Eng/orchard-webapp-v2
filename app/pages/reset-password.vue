<script setup lang="ts">
import type { ApiEnvelope, ResetPasswordRequest } from '~/types/api'

definePageMeta({ layout: 'auth' })
usePageSeo('Reset Password', 'Set a new password for your Orchard account.')

const api = useApi()

const resetState = useFlowState<{ email: string }>('oc_reset_password')
const email = computed(() => resetState.get().email ?? '')
const newPassword = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const submitAction = useAsyncAction()
const resultModal = ref(false)
const GENERIC_SUCCESS_IMAGE = '/images/orchard_app_icons/successful-elementor-io-optimized.webp'

async function submit() {
  errorMessage.value = ''
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.'
    return
  }
  await submitAction.run(async () => {
    try {
      // POST /users/auth/resetpassword — confirmed via apex-user.crowdital.com's compiled
      // JS bundle (2026-08-19); see ResetPasswordRequest in ~/types/api.ts. No token is
      // sent here — the previous verify-reset-code step already confirmed it server-side.
      await api<ApiEnvelope<unknown>>('/users/auth/resetpassword', {
        method: 'POST',
        body: { email: email.value, newPassword: newPassword.value } satisfies ResetPasswordRequest
      })
      resetState.clear()
      resultModal.value = true
    } catch (err) {
      errorMessage.value = getApiErrorMessage(err, 'We couldn’t reset your password. Please start over.')
      throw err
    }
  })
}

// There's no active session in this logged-out flow, so there's nothing to log out of —
// this is purely informational before sending them to log in with the new password.
async function onResultClosed(isOpen: boolean) {
  if (isOpen) return
  resultModal.value = false
  await navigateTo('/login')
}
</script>

<template>
  <div>
    <h1 class="oc-display text-xl font-semibold text-[var(--oc-text-primary)]">Set a new password</h1>

    <form class="mt-6 space-y-4" @submit.prevent="submit">
      <label class="block text-sm">
        <span class="mb-1 block font-medium text-[var(--oc-text-primary)]">New Password</span>
        <input
          v-model="newPassword"
          type="password"
          required
          autocomplete="new-password"
          class="w-full rounded-md border border-[var(--oc-border-strong)] bg-[var(--oc-bg-surface)] px-3 py-2.5 text-sm text-[var(--oc-text-primary)] outline-none focus:border-[var(--oc-border-focus)] focus:ring-2 focus:ring-[var(--oc-focus-ring)]"
        >
      </label>
      <label class="block text-sm">
        <span class="mb-1 block font-medium text-[var(--oc-text-primary)]">Confirm New Password</span>
        <input
          v-model="confirmPassword"
          type="password"
          required
          autocomplete="new-password"
          class="w-full rounded-md border border-[var(--oc-border-strong)] bg-[var(--oc-bg-surface)] px-3 py-2.5 text-sm text-[var(--oc-text-primary)] outline-none focus:border-[var(--oc-border-focus)] focus:ring-2 focus:ring-[var(--oc-focus-ring)]"
        >
      </label>

      <p v-if="errorMessage" class="rounded-md bg-[var(--oc-status-danger-bg)] px-3 py-2 text-xs text-[var(--oc-status-danger-fg)]">
        {{ errorMessage }}
      </p>

      <ActionButton :state="submitAction.state.value" label="Reset Password" type="submit" class="w-full" />
    </form>

    <ResultModal
      :open="resultModal"
      status="success"
      title="Password Reset"
      message="Your password has been changed successfully. Please log in with your new password."
      :image="GENERIC_SUCCESS_IMAGE"
      action-label="Log In"
      @update:open="onResultClosed"
    />
  </div>
</template>
