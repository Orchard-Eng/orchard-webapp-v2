<script setup lang="ts">
import type { ApiEnvelope, DashboardData } from '~/types/api'

const open = defineModel<boolean>('open', { default: false })

const dashboardData = useNuxtData<ApiEnvelope<DashboardData>>('dashboard')
const user = computed(() => dashboardData.data.value?.data?.dashboard_data?.user)

// The user's own linked withdrawal account — confirmed live, 2026-08-19 — lives under
// profile.nuban/nuban_*, not a dedicated bank_account field.
const bankAccount = computed(() => {
  const p = user.value?.profile
  if (!p?.nuban || !p.nuban_bank || !p.nuban_account_name) return null
  return { bank_name: p.nuban_bank, account_number: p.nuban, account_name: p.nuban_account_name }
})
</script>

<template>
  <Modal v-model:open="open" title="Bank Details">
    <div class="grid gap-4 sm:grid-cols-3">
      <div>
        <p class="text-xs text-[var(--oc-text-muted)]">Bankname</p>
        <p class="mt-1 text-sm font-medium text-[var(--oc-text-primary)]">{{ bankAccount?.bank_name ?? '—' }}</p>
      </div>
      <div>
        <p class="text-xs text-[var(--oc-text-muted)]">Account Number</p>
        <p class="oc-tnum mt-1 text-sm font-medium text-[var(--oc-text-primary)]">{{ bankAccount?.account_number ?? '—' }}</p>
      </div>
      <div>
        <p class="text-xs text-[var(--oc-text-muted)]">Account Name</p>
        <p class="mt-1 text-sm font-medium text-[var(--oc-text-primary)]">{{ bankAccount?.account_name ?? '—' }}</p>
      </div>
    </div>
  </Modal>
</template>
