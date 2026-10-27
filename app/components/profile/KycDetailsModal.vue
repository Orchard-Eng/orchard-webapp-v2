<script setup lang="ts">
import { RiCheckboxCircleFill } from '@remixicon/vue'
import type { ApiEnvelope, DashboardData } from '~/types/api'

const open = defineModel<boolean>('open', { default: false })

const dashboardData = useNuxtData<ApiEnvelope<DashboardData>>('dashboard')
const user = computed(() => dashboardData.data.value?.data?.dashboard_data?.user)

const bankAccount = computed(() => {
  const p = user.value?.profile
  if (!p?.nuban || !p.nuban_bank) return null
  return { bank_name: p.nuban_bank, account_number: p.nuban }
})

const kycModalOpen = ref(false)
</script>

<template>
  <Modal v-model:open="open" title="KYC Details">
    <div class="space-y-3">
      <div class="flex items-center justify-between rounded-lg bg-[var(--oc-bg-subtle)] p-4">
        <div>
          <p class="text-sm font-medium text-[var(--oc-text-primary)]">Bank Account</p>
          <p class="mt-1 text-xs text-[var(--oc-text-muted)]">
            {{ bankAccount?.bank_name ?? '—' }} · {{ maskExceptLast4(bankAccount?.account_number) }}
          </p>
        </div>
        <RiCheckboxCircleFill v-if="hasLinkedBankAccount(user)" class="h-5 w-5 shrink-0 text-[var(--oc-status-success-solid)]" />
      </div>
      <div class="flex items-center justify-between rounded-lg bg-[var(--oc-bg-subtle)] p-4">
        <div>
          <p class="text-sm font-medium text-[var(--oc-text-primary)]">BVN</p>
          <p class="mt-1 text-xs text-[var(--oc-text-muted)]">{{ maskExceptLast4(user?.profile?.bvn) }}</p>
        </div>
        <RiCheckboxCircleFill v-if="isBvnVerified(user)" class="h-5 w-5 shrink-0 text-[var(--oc-status-success-solid)]" />
      </div>
      <div class="flex items-center justify-between rounded-lg bg-[var(--oc-bg-subtle)] p-4">
        <div>
          <p class="text-sm font-medium text-[var(--oc-text-primary)]">NIN</p>
          <p class="mt-1 text-xs text-[var(--oc-text-muted)]">{{ maskExceptLast4(user?.profile?.nin) }}</p>
        </div>
        <RiCheckboxCircleFill v-if="isNinVerified(user)" class="h-5 w-5 shrink-0 text-[var(--oc-status-success-solid)]" />
      </div>

      <ActionButton
        v-if="!isKycComplete(user)"
        state="idle"
        label="Complete Verification"
        variant="secondary"
        type="button"
        @click="kycModalOpen = true"
      />
    </div>
  </Modal>

  <KycModal v-model:open="kycModalOpen" />
</template>
