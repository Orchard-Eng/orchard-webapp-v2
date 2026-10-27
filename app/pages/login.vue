<script setup lang="ts">
import { RiEyeLine, RiEyeOffLine } from '@remixicon/vue'
import type { ApiEnvelope, LoginRequest, LoginResponse } from '~/types/api'

definePageMeta({ layout: 'auth' })
usePageSeo('Log In', 'Log in to your Orchard account.')

const route = useRoute()
const api = useApi()
const authStore = useAuthStore()

const identifier = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')
const wasIdle = computed(() => route.query.idle === '1')

const loginAction = useAsyncAction()
const twoFactorState = useFlowState<{ user_id: string; email: string; message?: string }>('oc_2fa')

async function submit() {
  errorMessage.value = ''
  await loginAction.run(async () => {
    try {
      // POST /users/auth/login — the non-2FA response ({user, token}, requires_2fa on
      // user.requires_2fa) was confirmed live, 2026-08-19, but the 2FA-required shape never
      // was. Handle it defensively: any response missing a token/user, or flagging
      // requires_2fa, is treated as a 2FA challenge rather than assuming exact fields.
      const res = await api<ApiEnvelope<Partial<LoginResponse> & { user_id?: string }>>('/users/auth/login', {
        method: 'POST',
        body: { identifier: identifier.value, password: password.value } satisfies LoginRequest
      })
      const { user, token } = res.data
      if (!token || !user || user.requires_2fa) {
        const userId = user?.uuid ?? res.data.user_id ?? ''
        const email = user?.email ?? (identifier.value.includes('@') ? identifier.value : '')
        twoFactorState.set({ user_id: userId, email, message: res.message })
        await navigateTo('/two-factor')
        return
      }
      authStore.setSession(token, user)
      await navigateTo(isKycComplete(user) ? '/dashboard' : { path: '/dashboard', query: { kyc: 'required' } })
    } catch (err) {
      const errData = (err as { data?: { message?: string; data?: { user_id?: string }; user_id?: string } })?.data
      const challengeUserId = errData?.data?.user_id ?? errData?.user_id
      const looksLikeTwoFactor = challengeUserId || /otp|2fa|two.factor|verification code/i.test(errData?.message ?? '')
      if (looksLikeTwoFactor) {
        const email = identifier.value.includes('@') ? identifier.value : ''
        twoFactorState.set({ user_id: challengeUserId ?? '', email, message: errData?.message })
        await navigateTo('/two-factor')
        return
      }
      errorMessage.value = getApiErrorMessage(err, 'Incorrect email/phone or password. Please try again.')
      throw err
    }
  })
}
</script>

<template>
  <div>
    <h1 class="oc-display text-xl font-semibold text-[var(--oc-text-primary)]">Welcome back</h1>
    <p class="mt-1 text-sm text-[var(--oc-text-muted)]">Log in to your Orchard account.</p>

    <p v-if="wasIdle" class="mt-4 rounded-md bg-[var(--oc-status-info-bg)] px-3 py-2 text-xs text-[var(--oc-status-info-fg)]">
      You were logged out due to inactivity. Please log in again.
    </p>

    <form class="mt-6 space-y-4" @submit.prevent="submit">
      <label class="block text-sm">
        <span class="mb-1 block font-medium text-[var(--oc-text-primary)]">Email or Phone</span>
        <input
          v-model="identifier"
          type="text"
          required
          autocomplete="username"
          class="w-full rounded-md border border-[var(--oc-border-strong)] bg-[var(--oc-bg-surface)] px-3 py-2.5 text-sm text-[var(--oc-text-primary)] outline-none focus:border-[var(--oc-border-focus)] focus:ring-2 focus:ring-[var(--oc-focus-ring)]"
        >
      </label>

      <label class="relative block text-sm">
        <span class="mb-1 block font-medium text-[var(--oc-text-primary)]">Password</span>
        <input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          required
          autocomplete="current-password"
          class="w-full rounded-md border border-[var(--oc-border-strong)] bg-[var(--oc-bg-surface)] px-3 py-2.5 pr-10 text-sm text-[var(--oc-text-primary)] outline-none focus:border-[var(--oc-border-focus)] focus:ring-2 focus:ring-[var(--oc-focus-ring)]"
        >
        <button
          type="button"
          class="absolute right-2 top-[34px] text-[var(--oc-text-muted)]"
          :aria-label="showPassword ? 'Hide password' : 'Show password'"
          @click="showPassword = !showPassword"
        >
          <RiEyeOffLine v-if="showPassword" class="h-4 w-4" />
          <RiEyeLine v-else class="h-4 w-4" />
        </button>
      </label>

      <div class="flex justify-end">
        <NuxtLink to="/forgot-password" class="text-xs font-semibold text-[var(--oc-text-link)]">
          Forgot password?
        </NuxtLink>
      </div>

      <p v-if="errorMessage" class="rounded-md bg-[var(--oc-status-danger-bg)] px-3 py-2 text-xs text-[var(--oc-status-danger-fg)]">
        {{ errorMessage }}
      </p>

      <ActionButton :state="loginAction.state.value" label="Log In" type="submit" class="w-full" />
    </form>

    <p class="mt-6 text-center text-sm text-[var(--oc-text-muted)]">
      Don't have an account?
      <NuxtLink to="/signup" class="font-semibold text-[var(--oc-text-link)]">Sign up</NuxtLink>
    </p>
  </div>
</template>
