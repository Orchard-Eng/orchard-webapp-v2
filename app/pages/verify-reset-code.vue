<script setup lang="ts">
import type { ApiEnvelope, VerifyResetTokenRequest } from '~/types/api'

definePageMeta({ layout: 'auth' })
usePageSeo('Verify Reset Code', 'Enter the code sent to you to reset your Orchard password.')

const api = useApi()

const resetState = useFlowState<{ email: string }>('oc_reset_password')
const email = computed(() => resetState.get().email ?? '')
const code = ref('')
const errorMessage = ref('')
const verifyAction = useAsyncAction()

async function submit() {
  errorMessage.value = ''
  if (code.value.length !== 6) {
    errorMessage.value = 'Please input a total of 6 digits.'
    return
  }
  await verifyAction.run(async () => {
    try {
      // POST /users/auth/verifytoken — confirmed via apex-user.crowdital.com's compiled
      // JS bundle (2026-08-19); see VerifyResetTokenRequest in ~/types/api.ts.
      await api<ApiEnvelope<unknown>>('/users/auth/verifytoken', {
        method: 'POST',
        body: { email: email.value, token: code.value } satisfies VerifyResetTokenRequest
      })
      await navigateTo('/reset-password')
    } catch (err) {
      errorMessage.value = getApiErrorMessage(err, 'Unable to verify that code. Please try again.')
      throw err
    }
  })
}
</script>

<template>
  <div>
    <h1 class="oc-display text-xl font-semibold text-[var(--oc-text-primary)]">Enter your code</h1>
    <p class="mt-1 text-sm text-[var(--oc-text-muted)]">
      Enter the 6-digit code sent to {{ email || 'your email' }}.
    </p>

    <form class="mt-6 space-y-4" @submit.prevent="submit">
      <PinInput v-model="code" :length="6" />

      <p v-if="errorMessage" class="rounded-md bg-[var(--oc-status-danger-bg)] px-3 py-2 text-xs text-[var(--oc-status-danger-fg)]">
        {{ errorMessage }}
      </p>

      <ActionButton :state="verifyAction.state.value" label="Verify" type="submit" :disabled="code.length !== 6" class="w-full" />
    </form>
  </div>
</template>
