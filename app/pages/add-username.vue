<script setup lang="ts">
import type { ApiEnvelope, AddUsernameRequest } from '~/types/api'

definePageMeta({ layout: 'auth' })
usePageSeo('Choose Username', 'Choose a username to continue setting up your Orchard account.')

const api = useApi()

const onboardingState = useFlowState<{ email: string }>('oc_onboarding')
const email = computed(() => onboardingState.get().email ?? '')
const username = ref('')
const dob = ref('')
const errorMessage = ref('')
const submitAction = useAsyncAction()

// yyyy-mm-dd string for the date input's max attribute — stops the picker itself from
// offering an underage date in browsers that support it.
const maxDob = computed(() => {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 18)
  return d.toISOString().slice(0, 10)
})

const isOver18 = computed(() => {
  if (!dob.value) return false
  const birth = new Date(dob.value)
  if (Number.isNaN(birth.getTime())) return false
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate())
  if (!hasHadBirthdayThisYear) age -= 1
  return age >= 18
})
const isUnderage = computed(() => dob.value.length > 0 && !isOver18.value)
const canSubmit = computed(() => !!username.value.trim() && isOver18.value)

const attempted = ref(false)
const missingUsername = computed(() => attempted.value && !username.value.trim())
const missingDob = computed(() => attempted.value && !dob.value)

async function submit() {
  errorMessage.value = ''
  attempted.value = true
  if (!canSubmit.value) return
  await submitAction.run(async () => {
    try {
      // POST /users/onboard/addusername — confirmed via apex-user.crowdital.com's
      // compiled JS bundle (2026-08-19); see AddUsernameRequest in ~/types/api.ts. The
      // Postman collection's own example includes dob/email alongside username.
      await api<ApiEnvelope<unknown>>('/users/onboard/addusername', {
        method: 'POST',
        body: { username: username.value.trim(), dob: dob.value, email: email.value } satisfies AddUsernameRequest
      })
      await navigateTo('/create-pin')
    } catch (err) {
      errorMessage.value = getApiErrorMessage(err, 'That username isn’t available. Please try another.')
      throw err
    }
  })
}
</script>

<template>
  <div>
    <h1 class="oc-display text-xl font-semibold text-[var(--oc-text-primary)]">Choose a username</h1>
    <p class="mt-1 text-sm text-[var(--oc-text-muted)]">This is how you'll appear on Orchard.</p>

    <form class="mt-6 space-y-4" @submit.prevent="submit">
      <label class="block text-sm">
        <span class="mb-1 block font-medium text-[var(--oc-text-primary)]">Username</span>
        <input
          v-model="username"
          type="text"
          required
          class="w-full rounded-md border border-[var(--oc-border-strong)] bg-[var(--oc-bg-surface)] px-3 py-2.5 text-sm text-[var(--oc-text-primary)] outline-none focus:border-[var(--oc-border-focus)] focus:ring-2 focus:ring-[var(--oc-focus-ring)]"
        >
      </label>

      <label class="block text-sm">
        <span class="mb-1 block font-medium text-[var(--oc-text-primary)]">Date of Birth</span>
        <input
          v-model="dob"
          type="date"
          required
          :max="maxDob"
          class="w-full rounded-md border border-[var(--oc-border-strong)] bg-[var(--oc-bg-surface)] px-3 py-2.5 text-sm text-[var(--oc-text-primary)] outline-none focus:border-[var(--oc-border-focus)] focus:ring-2 focus:ring-[var(--oc-focus-ring)]"
        >
      </label>

      <p v-if="missingUsername" class="rounded-md bg-[var(--oc-status-danger-bg)] px-3 py-2 text-xs text-[var(--oc-status-danger-fg)]">
        Please enter a username.
      </p>

      <p v-if="missingDob" class="rounded-md bg-[var(--oc-status-danger-bg)] px-3 py-2 text-xs text-[var(--oc-status-danger-fg)]">
        Please select your date of birth.
      </p>

      <p v-if="isUnderage" class="rounded-md bg-[var(--oc-status-danger-bg)] px-3 py-2 text-xs text-[var(--oc-status-danger-fg)]">
        You must be at least 18 years old to sign up.
      </p>

      <p v-if="errorMessage" class="rounded-md bg-[var(--oc-status-danger-bg)] px-3 py-2 text-xs text-[var(--oc-status-danger-fg)]">
        {{ errorMessage }}
      </p>

      <ActionButton :state="submitAction.state.value" label="Continue" type="submit" :disabled="!canSubmit" class="w-full" />
    </form>
  </div>
</template>
