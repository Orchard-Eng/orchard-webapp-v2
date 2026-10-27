<script setup lang="ts">
import { RiRefreshLine } from '@remixicon/vue'
import type { ApiEnvelope, DashboardData, ProfileUpdateRequest } from '~/types/api'

const open = defineModel<boolean>('open', { default: false })

const api = useApi()
const dashboardData = useNuxtData<ApiEnvelope<DashboardData>>('dashboard')
const user = computed(() => dashboardData.data.value?.data?.dashboard_data?.user)

// Only these 5 fields are actually accepted by PUT /users/details/edit (confirmed via
// apex-user.crowdital.com's compiled JS bundle, 2026-08-19) — username/email/date of birth
// are shown for context but aren't editable here since the real API doesn't take them on
// this endpoint.
const profileForm = reactive<ProfileUpdateRequest>({
  firstname: '',
  lastname: '',
  mobile_number: '',
  address_line_1: '',
  gender: ''
})
const displayUsername = ref('')
const displayEmail = ref('')
const displayDob = ref('')

watch(
  [user, open],
  () => {
    const u = user.value
    if (!u || !open.value) return
    profileForm.firstname = u.profile.firstname ?? ''
    profileForm.lastname = u.profile.lastname ?? ''
    profileForm.mobile_number = u.mobile_number ?? ''
    profileForm.address_line_1 = u.profile.address_line_1 ?? ''
    profileForm.gender = u.profile.gender ?? ''

    displayUsername.value = u.profile.username ?? ''
    displayEmail.value = u.email ?? ''
    displayDob.value = formatDate(u.profile.dob)
  },
  { immediate: true }
)

const profileAction = useAsyncAction()
const resultModal = ref<{ status: 'success' | 'error'; title: string; message: string; image?: string } | null>(null)
const GENERIC_SUCCESS_IMAGE = '/images/orchard_app_icons/successful-elementor-io-optimized.webp'
const GENERIC_FAILED_IMAGE = '/images/orchard_app_icons/failed-elementor-io-optimized.webp'

async function updateProfile() {
  // PUT /users/details/edit — confirmed via apex-user.crowdital.com's compiled JS bundle
  // (2026-08-19); see ProfileUpdateRequest in ~/types/api.ts.
  await profileAction.run(() => api<ApiEnvelope<unknown>>('/users/details/edit', { method: 'PUT', body: profileForm }))
  if (profileAction.state.value === 'success') {
    await refreshNuxtData('dashboard')
    open.value = false
    resultModal.value = {
      status: 'success',
      title: 'Profile Updated',
      message: 'Your profile details have been updated successfully.',
      image: GENERIC_SUCCESS_IMAGE
    }
  } else {
    resultModal.value = {
      status: 'error',
      title: 'Update Failed',
      message: getApiErrorMessage(profileAction.error.value, 'We could not update your profile. Please try again.'),
      image: GENERIC_FAILED_IMAGE
    }
  }
}

const inputClasses =
  'w-full rounded-md border border-[var(--oc-border-strong)] bg-[var(--oc-bg-surface)] px-3 py-2.5 text-sm text-[var(--oc-text-primary)] outline-none focus:border-[var(--oc-border-focus)] focus:ring-2 focus:ring-[var(--oc-focus-ring)]'
const readonlyClasses =
  'w-full rounded-md border border-[var(--oc-border-default)] bg-[var(--oc-bg-subtle)] px-3 py-2.5 text-sm text-[var(--oc-text-muted)]'
</script>

<template>
  <Modal v-model:open="open" title="Profile Details">
    <form class="grid gap-4 sm:grid-cols-2" @submit.prevent="updateProfile">
      <label class="block text-sm">
        <span class="mb-1 block font-medium text-[var(--oc-text-primary)]">Firstname</span>
        <input :value="profileForm.firstname" type="text" disabled :class="readonlyClasses">
      </label>
      <label class="block text-sm">
        <span class="mb-1 block font-medium text-[var(--oc-text-primary)]">Lastname</span>
        <input :value="profileForm.lastname" type="text" disabled :class="readonlyClasses">
      </label>
      <label class="block text-sm">
        <span class="mb-1 block font-medium text-[var(--oc-text-primary)]">Username</span>
        <input :value="displayUsername" type="text" disabled :class="readonlyClasses">
      </label>
      <label class="block text-sm">
        <span class="mb-1 block font-medium text-[var(--oc-text-primary)]">Gender</span>
        <select v-model="profileForm.gender" :class="inputClasses">
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </label>
      <label class="block text-sm">
        <span class="mb-1 block font-medium text-[var(--oc-text-primary)]">Email</span>
        <input :value="displayEmail" type="email" disabled :class="readonlyClasses">
      </label>
      <div class="text-sm">
        <span class="mb-1 block font-medium text-[var(--oc-text-primary)]">Phone</span>
        <PhoneInput v-model="profileForm.mobile_number" />
      </div>
      <label class="block text-sm">
        <span class="mb-1 block font-medium text-[var(--oc-text-primary)]">Date of Birth</span>
        <input :value="displayDob" type="text" disabled :class="readonlyClasses">
      </label>
      <p class="text-xs text-[var(--oc-text-faint)] sm:col-span-2">
        Firstname and Lastname can only be changed by our support team. Contact us if these need correcting.
      </p>

      <label class="block text-sm sm:col-span-2">
        <span class="mb-1 block font-medium text-[var(--oc-text-primary)]">Address</span>
        <input v-model="profileForm.address_line_1" type="text" :class="inputClasses">
      </label>

      <ActionButton
        :state="profileAction.state.value"
        label="Update Details"
        variant="secondary"
        type="submit"
        class="sm:col-span-2 sm:w-auto"
      >
        <RiRefreshLine class="h-4 w-4" /> Update Details
      </ActionButton>
    </form>
  </Modal>

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
