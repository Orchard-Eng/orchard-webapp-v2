<script setup lang="ts">
import { RiBankLine, RiFileTextLine, RiIdCardLine, RiTeamLine, RiUserLine } from '@remixicon/vue'
import type { ApiEnvelope, DashboardData } from '~/types/api'

usePageSeo('Account Profile', 'View and update your Orchard profile and next of kin details.')

const api = useApi()

const { data: dashboardRes, pending } = useLazyAsyncData('dashboard', () =>
  api<ApiEnvelope<DashboardData>>('/users/dashboard')
)
const user = computed(() => dashboardRes.value?.data?.dashboard_data?.user)

const profileModalOpen = ref(false)
const kinModalOpen = ref(false)
const kycModalOpen = ref(false)
const bankModalOpen = ref(false)
const taxModalOpen = ref(false)
</script>

<template>
  <div>
    <SkeletonPage v-if="pending" :count="2" />

    <template v-else>
      <ProfileHeaderCard :user="user" />

      <p class="mb-2 mt-8 text-xs font-semibold uppercase tracking-wide text-[var(--oc-text-muted)]">Account Profile</p>
      <div class="divide-y divide-[var(--oc-border-default)] rounded-lg border border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] px-2 shadow-sm">
        <SettingsRow
          :icon="RiUserLine"
          title="Profile Details"
          subtitle="Update your personal information"
          @click="profileModalOpen = true"
        />
        <SettingsRow
          :icon="RiTeamLine"
          title="Next of Kin Details"
          subtitle="Add your emergency contact"
          @click="kinModalOpen = true"
        />
        <SettingsRow
          :icon="RiIdCardLine"
          title="KYC Details"
          subtitle="Complete your verification profile"
          @click="kycModalOpen = true"
        />
        <SettingsRow
          :icon="RiBankLine"
          title="Bank Details"
          subtitle="View linked bank account information"
          @click="bankModalOpen = true"
        />
        <SettingsRow
          :icon="RiFileTextLine"
          title="Tax Details"
          subtitle="Provide your Tax Identification Number"
          @click="taxModalOpen = true"
        />
      </div>
    </template>

    <ProfileDetailsModal v-model:open="profileModalOpen" />
    <NextOfKinModal v-model:open="kinModalOpen" />
    <KycDetailsModal v-model:open="kycModalOpen" />
    <BankDetailsModal v-model:open="bankModalOpen" />
    <TaxDetailsModal v-model:open="taxModalOpen" />
  </div>
</template>
