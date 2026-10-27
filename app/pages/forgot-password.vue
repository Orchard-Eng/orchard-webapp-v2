<script setup lang="ts">
import type { ApiEnvelope, SendPassTokenRequest } from '~/types/api'

definePageMeta({ layout: 'auth' })
usePageSeo('Forgot Password', 'Reset the password for your Orchard account.')

const api = useApi()
const email = ref('')
const errorMessage = ref('')
const submitAction = useAsyncAction()
const resetState = useFlowState<{ email: string }>('oc_reset_password')

async function submit() {
  errorMessage.value = ''
  await submitAction.run(async () => {
    try {
      // POST /users/auth/sendpasstoken — confirmed via apex-user.crowdital.com's compiled
      // JS bundle (2026-08-19); see SendPassTokenRequest in ~/types/api.ts.
      await api<ApiEnvelope<unknown>>('/users/auth/sendpasstoken', {
        method: 'POST',
        body: { email: email.value } satisfies SendPassTokenRequest
      })
      resetState.set({ email: email.value })
      await navigateTo('/verify-reset-code')
    } catch (err) {
      errorMessage.value = getApiErrorMessage(err, 'We couldn’t send a code to that email. Please try again.')
      throw err
    }
  })
}
</script>

<template>
  <div>
    <h1 class="oc-display text-xl font-semibold text-[var(--oc-text-primary)]">Reset your password</h1>
    <p class="mt-1 text-sm text-[var(--oc-text-muted)]">
      Enter your email and we'll send you a code to reset your password.
    </p>

    <form class="mt-6 space-y-4" @submit.prevent="submit">
      <label class="block text-sm">
        <span class="mb-1 block font-medium text-[var(--oc-text-primary)]">Email</span>
        <input
          v-model="email"
          type="email"
          required
          autocomplete="email"
          class="w-full rounded-md border border-[var(--oc-border-strong)] bg-[var(--oc-bg-surface)] px-3 py-2.5 text-sm text-[var(--oc-text-primary)] outline-none focus:border-[var(--oc-border-focus)] focus:ring-2 focus:ring-[var(--oc-focus-ring)]"
        >
      </label>

      <p v-if="errorMessage" class="rounded-md bg-[var(--oc-status-danger-bg)] px-3 py-2 text-xs text-[var(--oc-status-danger-fg)]">
        {{ errorMessage }}
      </p>

      <ActionButton :state="submitAction.state.value" label="Send Code" type="submit" class="w-full" />
    </form>

    <p class="mt-6 text-center text-sm text-[var(--oc-text-muted)]">
      <NuxtLink to="/login" class="font-semibold text-[var(--oc-text-link)]">Back to login</NuxtLink>
    </p>
  </div>
</template>
