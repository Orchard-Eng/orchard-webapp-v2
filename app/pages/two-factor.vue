<script setup lang="ts">
import type { ApiEnvelope, DashboardData, TwoFactorVerifyRequest, TwoFactorVerifyResponse } from '~/types/api'

definePageMeta({ layout: 'auth' })
usePageSeo('Two-Factor Verification', 'Enter your two-factor authentication code to log in.')

const api = useApi()
const authStore = useAuthStore()

const twoFactorState = useFlowState<{ user_id: string; email: string; message?: string }>('oc_2fa')
const email = computed(() => twoFactorState.get().email ?? '')
const infoMessage = computed(() => twoFactorState.get().message || 'Enter the 6-digit code sent to your email.')

const code = ref('')
const errorMessage = ref('')
const verifyAction = useAsyncAction()
const resendAction = useAsyncAction()
const resent = ref(false)

async function submit() {
  errorMessage.value = ''
  const userId = twoFactorState.get().user_id ?? ''
  if (code.value.length !== 6 || !userId) return
  await verifyAction.run(async () => {
    try {
      // POST /users/auth/verify2fa — confirmed via apex-user.crowdital.com's compiled
      // JS bundle (2026-08-19); see TwoFactorVerifyRequest in ~/types/api.ts.
      const res = await api<ApiEnvelope<TwoFactorVerifyResponse>>('/users/auth/verify2fa', {
        method: 'POST',
        body: { user_id: userId, code: code.value } satisfies TwoFactorVerifyRequest
      })
      authStore.setToken(res.data.token)
      twoFactorState.clear()
      // verify2fa only returns a token — populate the user too so the cookie write-back in
      // plugins/auth.ts isn't left with a null user, and UserMenu.vue's greeting/avatar
      // (which reads authStore.user directly) isn't stuck on its fallback state.
      const dashboardRes = await api<ApiEnvelope<DashboardData>>('/users/dashboard')
      const dashboardUser = dashboardRes.data?.dashboard_data?.user
      if (dashboardUser) authStore.setUser(dashboardUser)
      await navigateTo(isKycComplete(dashboardUser) ? '/dashboard' : { path: '/dashboard', query: { kyc: 'required' } })
    } catch (err) {
      errorMessage.value = getApiErrorMessage(err, 'Invalid 2FA code. Please try again.')
      throw err
    }
  })
}

async function resend() {
  resent.value = false
  errorMessage.value = ''
  const body = email.value ? { email: email.value } : { user_id: twoFactorState.get().user_id }
  await resendAction.run(() => api<ApiEnvelope<unknown>>('/users/onboard/resendotp', { method: 'POST', body }))
  if (resendAction.state.value === 'success') {
    resent.value = true
  } else {
    errorMessage.value = getApiErrorMessage(resendAction.error.value, 'We could not resend the code. Please try again.')
  }
}
</script>

<template>
  <div>
    <h1 class="oc-display text-xl font-semibold text-[var(--oc-text-primary)]">Two-factor verification</h1>
    <p class="mt-1 text-sm text-[var(--oc-text-muted)]">{{ infoMessage }}</p>

    <form class="mt-6 space-y-4" @submit.prevent="submit">
      <PinInput v-model="code" :length="6" />

      <p v-if="errorMessage" class="rounded-md bg-[var(--oc-status-danger-bg)] px-3 py-2 text-xs text-[var(--oc-status-danger-fg)]">
        {{ errorMessage }}
      </p>
      <p v-if="resent" class="rounded-md bg-[var(--oc-status-success-bg)] px-3 py-2 text-xs text-[var(--oc-status-success-fg)]">
        A new code has been sent.
      </p>

      <ActionButton :state="verifyAction.state.value" label="Verify" type="submit" :disabled="code.length !== 6" class="w-full" />
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
