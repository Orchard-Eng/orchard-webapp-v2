<script setup lang="ts">
import type { ApiEnvelope, DashboardData, NextOfKin, NextOfKinUpdateRequest } from '~/types/api'

const open = defineModel<boolean>('open', { default: false })

const api = useApi()
const dashboardData = useNuxtData<ApiEnvelope<DashboardData>>('dashboard')
const user = computed(() => dashboardData.data.value?.data?.dashboard_data?.user)

// GET /users/nextofkin/:uuid/show — keyed by the user's uuid (confirmed via the Postman
// collection, 2026-09-08; previously keyed by email). Only fetch once we know the uuid.
const { data: kinRes } = useLazyAsyncData(
  'next-of-kin',
  () => {
    if (!user.value?.uuid) return Promise.resolve({ success: false, message: '', data: [] })
    return api<ApiEnvelope<NextOfKin[]>>(`/users/nextofkin/${encodeURIComponent(user.value.uuid)}/show`)
  },
  { watch: [user] }
)
const existingKin = computed(() => kinRes.value?.data?.[0] ?? null)

const kinForm = reactive<NextOfKinUpdateRequest>({
  firstname: '',
  lastname: '',
  phone: '',
  email: '',
  relationship: ''
})

const RELATIONSHIP_OPTIONS = ['Spouse', 'Parent', 'Sibling', 'Child', 'Guardian', 'Other']
// Include a legacy/unrecognized saved value so the select doesn't silently blank it out.
const relationshipOptions = computed(() => {
  const current = kinForm.relationship
  if (current && !RELATIONSHIP_OPTIONS.includes(current)) return [current, ...RELATIONSHIP_OPTIONS]
  return RELATIONSHIP_OPTIONS
})

watch(
  [existingKin, open],
  () => {
    const kin = existingKin.value
    if (!kin || !open.value) return
    kinForm.firstname = kin.firstname ?? ''
    kinForm.lastname = kin.lastname ?? ''
    kinForm.phone = kin.phone ?? ''
    kinForm.email = kin.email ?? ''
    kinForm.relationship = kin.relationship ?? ''
  },
  { immediate: true }
)

const kinAction = useAsyncAction()
const resultModal = ref<{ status: 'success' | 'error'; title: string; message: string; image?: string } | null>(null)
const GENERIC_SUCCESS_IMAGE = '/images/orchard_app_icons/successful-elementor-io-optimized.webp'
const GENERIC_FAILED_IMAGE = '/images/orchard_app_icons/failed-elementor-io-optimized.webp'

async function updateKin() {
  // POST /users/nextofkin/:uuid/add — keyed by the user's uuid (confirmed via the Postman
  // collection, 2026-09-08; previously keyed by email).
  await kinAction.run(() =>
    api<ApiEnvelope<unknown>>(`/users/nextofkin/${encodeURIComponent(user.value?.uuid ?? '')}/add`, {
      method: 'POST',
      body: kinForm
    })
  )
  if (kinAction.state.value === 'success') {
    await refreshNuxtData('next-of-kin')
    open.value = false
    resultModal.value = {
      status: 'success',
      title: 'Next of Kin Updated',
      message: 'Your next of kin details have been updated successfully.',
      image: GENERIC_SUCCESS_IMAGE
    }
  } else {
    resultModal.value = {
      status: 'error',
      title: 'Update Failed',
      message: getApiErrorMessage(kinAction.error.value, 'We could not update your next of kin details. Please try again.'),
      image: GENERIC_FAILED_IMAGE
    }
  }
}

const inputClasses =
  'w-full rounded-md border border-[var(--oc-border-strong)] bg-[var(--oc-bg-surface)] px-3 py-2.5 text-sm text-[var(--oc-text-primary)] outline-none focus:border-[var(--oc-border-focus)] focus:ring-2 focus:ring-[var(--oc-focus-ring)]'
</script>

<template>
  <Modal v-model:open="open" title="Next of Kin Details">
    <p class="mb-4 inline-flex items-start gap-1 text-xs text-[var(--oc-text-muted)]">
      Who should we contact if we can't reach you?
      <InfoTip text="The person we'd contact about your account and investments if we're ever unable to reach you directly." />
    </p>
    <form class="grid gap-4 sm:grid-cols-2" @submit.prevent="updateKin">
      <label class="block text-sm">
        <span class="mb-1 block font-medium text-[var(--oc-text-primary)]">Next of Kin Firstname</span>
        <input v-model="kinForm.firstname" type="text" :class="inputClasses">
      </label>
      <label class="block text-sm">
        <span class="mb-1 block font-medium text-[var(--oc-text-primary)]">Next of Kin Lastname</span>
        <input v-model="kinForm.lastname" type="text" :class="inputClasses">
      </label>
      <div class="text-sm">
        <span class="mb-1 block font-medium text-[var(--oc-text-primary)]">Next of Kin Phone</span>
        <PhoneInput v-model="kinForm.phone" />
      </div>
      <label class="block text-sm">
        <span class="mb-1 block font-medium text-[var(--oc-text-primary)]">Next of Kin Email</span>
        <input v-model="kinForm.email" type="email" :class="inputClasses">
      </label>
      <label class="block text-sm sm:col-span-2">
        <span class="mb-1 block font-medium text-[var(--oc-text-primary)]">Relationship</span>
        <select v-model="kinForm.relationship" :class="inputClasses">
          <option v-for="option in relationshipOptions" :key="option" :value="option">{{ option }}</option>
        </select>
      </label>

      <ActionButton
        :state="kinAction.state.value"
        label="Update Next of Kin Details"
        variant="secondary"
        type="submit"
        class="sm:col-span-2 sm:w-auto"
      />
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
