<script setup lang="ts">
import type { ApiEnvelope } from '~/types/api'

definePageMeta({ layout: 'auth' })
usePageSeo('Verify Email', 'Verify your email to continue setting up your Orchard account.')

const api = useApi()

const onboardingState = useFlowState<{ email: string }>('oc_onboarding')
const email = computed(() => onboardingState.get().email ?? '')

const otp = ref('')
const errorMessage = ref('')
const verifyAction = useAsyncAction()
const resendAction = useAsyncAction()
const resent = ref(false)

async function submit() {
  errorMessage.value = ''
  if (otp.value.length !== 6 || !email.value) return
  await verifyAction.run(async () => {
    try {
      // POST /users/onboard/verifyotp — confirmed via apex-user.crowdital.com's compiled
      // JS bundle (2026-08-19); see OtpVerifyRequest in ~/types/api.ts. Continues to the
      // add-username onboarding step, matching the real app's wizard.
      await api<ApiEnvelope<unknown>>('/users/onboard/verifyotp', {
        method: 'POST',
        body: { otp: otp.value, email: email.value }
      })
      await navigateTo('/add-username')
    } catch (err) {
      errorMessage.value = getApiErrorMessage(err, 'That code didn’t work. Please check and try again.')
      throw err
    }
  })
}

async function resend() {
  resent.value = false
  errorMessage.value = ''
  await resendAction.run(() => api<ApiEnvelope<unknown>>('/users/onboard/resendotp', { method: 'POST', body: { email: email.value } }))
  if (resendAction.state.value === 'success') {
    resent.value = true
  } else {
    errorMessage.value = getApiErrorMessage(resendAction.error.value, 'We could not resend the code. Please try again.')
  }
}
</script>

<template>
  <div>
    <h1 class="oc-display text-xl font-semibold text-[var(--oc-text-primary)]">Verify your email</h1>
    <p class="mt-1 text-sm text-[var(--oc-text-muted)]">
      Enter the 6-digit code sent to {{ email || 'your email' }}.
    </p>

    <form class="mt-6 space-y-4" @submit.prevent="submit">
      <PinInput v-model="otp" :length="6" />

      <p v-if="errorMessage" class="rounded-md bg-[var(--oc-status-danger-bg)] px-3 py-2 text-xs text-[var(--oc-status-danger-fg)]">
        {{ errorMessage }}
      </p>
      <p v-if="resent" class="rounded-md bg-[var(--oc-status-success-bg)] px-3 py-2 text-xs text-[var(--oc-status-success-fg)]">
        A new code has been sent.
      </p>

      <ActionButton :state="verifyAction.state.value" label="Verify" type="submit" :disabled="otp.length !== 6" class="w-full" />
    </form>

    <button
      type="button"
      class="mt-6 w-full text-center text-sm font-semibold text-[var(--oc-text-link)]"
      @click="resend"
    >
      Resend code
    </button>
  </div>
</template>
