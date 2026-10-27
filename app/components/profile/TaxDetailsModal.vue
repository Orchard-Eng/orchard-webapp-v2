<script setup lang="ts">
import type { ApiEnvelope, MatchTinRequest } from '~/types/api'

const open = defineModel<boolean>('open', { default: false })

const api = useApi()

// POST /users/verify/matchtin — independent of the KYC (bvnfull) call; not requested or
// required at onboarding, only much later, so there's no "already provided" state to
// reflect here (no tin/tin_status field is confirmed anywhere on UserProfile).
const tin = ref('')
const tinAction = useAsyncAction()
const resultModal = ref<{ status: 'success' | 'error'; title: string; message: string; image?: string } | null>(null)
const GENERIC_SUCCESS_IMAGE = '/images/orchard_app_icons/successful-elementor-io-optimized.webp'
const GENERIC_FAILED_IMAGE = '/images/orchard_app_icons/failed-elementor-io-optimized.webp'

async function submitTin() {
  if (!tin.value.trim()) return
  await tinAction.run(() => api<ApiEnvelope<unknown>>('/users/verify/matchtin', { method: 'POST', body: { tin: tin.value.trim() } satisfies MatchTinRequest }))
  if (tinAction.state.value === 'success') {
    tin.value = ''
    open.value = false
    resultModal.value = {
      status: 'success',
      title: 'TIN Submitted',
      message: 'Your Tax Identification Number has been submitted successfully.',
      image: GENERIC_SUCCESS_IMAGE
    }
  } else {
    resultModal.value = {
      status: 'error',
      title: 'TIN Submission Failed',
      message: getApiErrorMessage(tinAction.error.value, 'We could not verify this TIN. Please try again.'),
      image: GENERIC_FAILED_IMAGE
    }
  }
}

const inputClasses =
  'w-full rounded-md border border-[var(--oc-border-strong)] bg-[var(--oc-bg-surface)] px-3 py-2.5 text-sm text-[var(--oc-text-primary)] outline-none focus:border-[var(--oc-border-focus)] focus:ring-2 focus:ring-[var(--oc-focus-ring)]'
</script>

<template>
  <Modal v-model:open="open" title="Tax Details">
    <form class="space-y-4" @submit.prevent="submitTin">
      <label class="block text-sm">
        <span class="mb-1 inline-flex items-center gap-1 font-medium text-[var(--oc-text-primary)]">
          Tax Identification Number (TIN)
          <InfoTip text="Your Tax Identification Number. Adding this lets us apply the correct tax treatment to your returns. It's optional and not required to start investing." />
        </span>
        <input v-model="tin" type="text" :class="inputClasses">
      </label>
      <ActionButton :state="tinAction.state.value" label="Submit TIN" variant="secondary" type="submit" :disabled="!tin.trim()" />
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
