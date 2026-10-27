<script setup lang="ts">
import { RiGiftLine, RiHeadphoneLine, RiLockLine, RiLogoutBoxLine, RiSettings3Line } from '@remixicon/vue'
import type { ApiEnvelope, DashboardData } from '~/types/api'

usePageSeo('Account Settings', 'Manage your Orchard password, transaction PIN, and security settings.')

const api = useApi()
const authStore = useAuthStore()

const { data: dashboardRes, pending } = useLazyAsyncData('dashboard', () =>
  api<ApiEnvelope<DashboardData>>('/users/dashboard')
)
const user = computed(() => dashboardRes.value?.data?.dashboard_data?.user)

const appearanceModalOpen = ref(false)
const securityModalOpen = ref(false)
const helpModalOpen = ref(false)

async function logout() {
  authStore.logout()
  await navigateTo('/login')
}
</script>

<template>
  <div>
    <SkeletonPage v-if="pending" :count="2" />

    <template v-else>
      <ProfileHeaderCard :user="user" />

      <p class="mb-2 mt-8 text-xs font-semibold uppercase tracking-wide text-[var(--oc-text-muted)]">Account Settings</p>
      <div class="divide-y divide-[var(--oc-border-default)] rounded-lg border border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] px-2 shadow-sm">
        <SettingsRow
          :icon="RiSettings3Line"
          title="Appearance"
          subtitle="Choose how Orchard looks on this device"
          @click="appearanceModalOpen = true"
        />
        <SettingsRow
          :icon="RiLockLine"
          title="Security Settings"
          subtitle="Manage password and login security"
          @click="securityModalOpen = true"
        />
        <SettingsRow
          :icon="RiHeadphoneLine"
          title="Help and Support"
          subtitle="Get help from the support team"
          @click="helpModalOpen = true"
        />
        <SettingsRow :icon="RiGiftLine" title="Referral" subtitle="Invite friends and earn rewards" to="/referral" />
        <SettingsRow :icon="RiLogoutBoxLine" title="Logout" subtitle="Sign out of your account" danger @click="logout" />
      </div>
    </template>

    <AppearanceModal v-model:open="appearanceModalOpen" />
    <SecuritySettingsModal v-model:open="securityModalOpen" />
    <HelpSupportModal v-model:open="helpModalOpen" />
  </div>
</template>
