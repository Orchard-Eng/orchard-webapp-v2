<script setup lang="ts">
import type { ApiEnvelope, CreatePinRequest } from '~/types/api'

definePageMeta({ layout: 'auth' })
usePageSeo('Create Transaction PIN', 'Set a transaction PIN to finish setting up your Orchard account.')

const api = useApi()

const onboardingState = useFlowState<{ email: string }>('oc_onboarding')
const email = computed(() => onboardingState.get().email ?? '')
const pin = ref('')
const confirmPin = ref('')
const errorMessage = ref('')
const submitAction = useAsyncAction()

const pinsMatch = computed(() => pin.value.length === 6 && pin.value === confirmPin.value)

async function submit() {
  errorMessage.value = ''
  if (!pinsMatch.value) {
    errorMessage.value = 'Both PINs must match and be 6 digits.'
    return
  }
  await submitAction.run(async () => {
    try {
      // POST /users/onboard/createpin — confirmed via apex-user.crowdital.com's compiled
      // JS bundle (2026-08-19); see CreatePinRequest in ~/types/api.ts. Onboarding then
      // continues to KYC (out of scope, see plandocs/ORCHARD_HANDOFF.md §4.9) — routes to login
      // here instead, matching what's actually built.
      await api<ApiEnvelope<unknown>>('/users/onboard/createpin', {
        method: 'POST',
        body: { email: email.value, pin: pin.value } satisfies CreatePinRequest
      })
      onboardingState.clear()
      await navigateTo('/login')
    } catch (err) {
      errorMessage.value = getApiErrorMessage(err, 'We couldn’t set your PIN. Please try again.')
      throw err
    }
  })
}
</script>

<template>
  <div>
    <h1 class="oc-display text-xl font-semibold text-[var(--oc-text-primary)]">Set a transaction PIN</h1>
    <p class="mt-1 text-sm text-[var(--oc-text-muted)]">You'll use this to authorize withdrawals.</p>

    <form class="mt-6 space-y-5" @submit.prevent="submit">
      <div>
        <span class="mb-2 block text-sm font-medium text-[var(--oc-text-primary)]">New PIN</span>
        <PinInput v-model="pin" masked />
      </div>
      <div>
        <span class="mb-2 block text-sm font-medium text-[var(--oc-text-primary)]">Confirm PIN</span>
        <PinInput v-model="confirmPin" masked :invalid="confirmPin.length === 6 && !pinsMatch" />
      </div>

      <p v-if="errorMessage" class="rounded-md bg-[var(--oc-status-danger-bg)] px-3 py-2 text-xs text-[var(--oc-status-danger-fg)]">
        {{ errorMessage }}
      </p>

      <ActionButton :state="submitAction.state.value" label="Continue" type="submit" :disabled="!pinsMatch" class="w-full" />
    </form>
  </div>
</template>
