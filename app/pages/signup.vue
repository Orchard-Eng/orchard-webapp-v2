<script setup lang="ts">
import type { ApiEnvelope, SignupRequest } from '~/types/api'

definePageMeta({ layout: 'auth' })
usePageSeo('Sign Up', 'Create your Orchard account and start investing.')

const route = useRoute()
const api = useApi()

const form = reactive<SignupRequest>({
  firstname: '',
  lastname: '',
  email: '',
  phone: '',
  password: '',
  policy_agreement: false,
  is_pep: false,
  referral_code: typeof route.query.ref === 'string' ? route.query.ref : undefined
})
const passwordConfirmation = ref('')

const errorMessage = ref('')
const signupAction = useAsyncAction()
const canSubmit = computed(() => form.policy_agreement)
const onboardingState = useFlowState<{ email: string }>('oc_onboarding')

async function submit() {
  errorMessage.value = ''
  if (!canSubmit.value) return
  if (form.password !== passwordConfirmation.value) {
    errorMessage.value = 'Passwords do not match.'
    return
  }
  await signupAction.run(async () => {
    try {
      // POST /users/onboard/register — confirmed via apex-user.crowdital.com's compiled
      // JS bundle (2026-08-19); see SignupRequest in ~/types/api.ts. No token is returned
      // here — the real app verifies the OTP first, then continues onboarding.
      await api<ApiEnvelope<unknown>>('/users/onboard/register', { method: 'POST', body: form })
      onboardingState.set({ email: form.email })
      await navigateTo('/otp')
    } catch (err) {
      errorMessage.value = getApiErrorMessage(err, 'We couldn’t create your account. Please check your details and try again.')
      throw err
    }
  })
}

const inputClasses =
  'w-full rounded-md border border-[var(--oc-border-strong)] bg-[var(--oc-bg-surface)] px-3 py-2.5 text-sm text-[var(--oc-text-primary)] outline-none focus:border-[var(--oc-border-focus)] focus:ring-2 focus:ring-[var(--oc-focus-ring)]'
</script>

<template>
  <div>
    <h1 class="oc-display text-xl font-semibold text-[var(--oc-text-primary)]">Create your account</h1>
    <p class="mt-1 text-sm text-[var(--oc-text-muted)]">Start investing with Orchard.</p>

    <form class="mt-6 space-y-4" @submit.prevent="submit">
      <div class="grid grid-cols-2 gap-3">
        <label class="block text-sm">
          <span class="mb-1 block font-medium text-[var(--oc-text-primary)]">Firstname</span>
          <input v-model="form.firstname" type="text" required :class="inputClasses">
        </label>
        <label class="block text-sm">
          <span class="mb-1 block font-medium text-[var(--oc-text-primary)]">Lastname</span>
          <input v-model="form.lastname" type="text" required :class="inputClasses">
        </label>
      </div>

      <label class="block text-sm">
        <span class="mb-1 block font-medium text-[var(--oc-text-primary)]">Email</span>
        <input v-model="form.email" type="email" required autocomplete="email" :class="inputClasses">
      </label>

      <div class="text-sm">
        <span class="mb-1 block font-medium text-[var(--oc-text-primary)]">Mobile Number</span>
        <PhoneInput v-model="form.phone" />
      </div>

      <label class="block text-sm">
        <span class="mb-1 block font-medium text-[var(--oc-text-primary)]">Password</span>
        <input v-model="form.password" type="password" required autocomplete="new-password" :class="inputClasses">
      </label>

      <label class="block text-sm">
        <span class="mb-1 block font-medium text-[var(--oc-text-primary)]">Confirm Password</span>
        <input v-model="passwordConfirmation" type="password" required autocomplete="new-password" :class="inputClasses">
      </label>

      <label v-if="form.referral_code" class="block text-sm">
        <span class="mb-1 block font-medium text-[var(--oc-text-primary)]">Referral Code</span>
        <input v-model="form.referral_code" type="text" :class="inputClasses">
      </label>

      <label class="flex items-center gap-3">
        <Toggle v-model="form.policy_agreement" />
        <span class="text-sm text-[var(--oc-text-secondary)]">
          I agree to the
          <NuxtLink to="/terms" target="_blank" class="font-semibold text-[var(--oc-text-link)]">Terms & Conditions</NuxtLink>
          and
          <NuxtLink to="/privacy" target="_blank" class="font-semibold text-[var(--oc-text-link)]">Privacy Policy</NuxtLink>
        </span>
      </label>

      <p v-if="errorMessage" class="rounded-md bg-[var(--oc-status-danger-bg)] px-3 py-2 text-xs text-[var(--oc-status-danger-fg)]">
        {{ errorMessage }}
      </p>

      <ActionButton :state="signupAction.state.value" label="Sign Up" type="submit" :disabled="!canSubmit" class="w-full" />
    </form>

    <p class="mt-6 text-center text-sm text-[var(--oc-text-muted)]">
      Already have an account?
      <NuxtLink to="/login" class="font-semibold text-[var(--oc-text-link)]">Log in</NuxtLink>
    </p>
  </div>
</template>
