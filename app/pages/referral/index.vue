<script setup lang="ts">
import { RiArrowLeftLine } from '@remixicon/vue'
import type { ApiEnvelope, DashboardData, ReferralStats } from '~/types/api'

usePageSeo('Referrals', 'Share your Orchard referral link and earn rewards.')

const api = useApi()

// The referral code itself is real data, confirmed live on the dashboard payload.
const { data: dashboardRes, pending } = useLazyAsyncData('dashboard', () =>
  api<ApiEnvelope<DashboardData>>('/users/dashboard')
)

const user = computed(() => dashboardRes.value?.data?.dashboard_data?.user)
const referralCode = computed(() => user.value?.ref_token)
const totalReferred = computed(() => user.value?.referral_stats.total_referred || 0)
const totalEarnedBonus = computed(() => user.value?.referral_stats.total_bonus || 0)
const totalPendingBonus = computed(() => user.value?.referral_stats.pending_bonus || 0)

// TODO: replace '/users/referral' with the real stats endpoint once it's provided — see
// ReferralStats in ~/types/api.ts. It 404s today, so `.catch(() => null)` keeps that
// failure silent and the stats grid below falls back to its placeholder state; once a
// working endpoint is swapped in here, real numbers should appear with no other changes.
const { data: statsRes, pending: statsPending } = useLazyAsyncData('referral-stats', () =>
  api<ApiEnvelope<ReferralStats>>('/users/referral').catch(() => null)
)
const stats = computed(() => statsRes.value?.data ?? null)

const referralLink = computed(() => {
  if (!referralCode.value) return ''
  const origin = import.meta.client ? window.location.origin : ''
  return `${origin}/signup?ref=${referralCode.value}`
})

const howItWorksOpen = ref(true)
const termsOpen = ref(false)
</script>

<template>
  <div>
    <NuxtLink to="/dashboard" class="inline-flex items-center gap-1 text-sm font-semibold text-[var(--oc-text-link)]">
      <RiArrowLeftLine class="h-4 w-4" /> Back
    </NuxtLink>

    <h1 class="oc-display mt-4 text-2xl font-semibold text-[var(--oc-text-primary)]">Referral</h1>

    <SkeletonPage v-if="pending" :count="3" class="mt-6" />

    <template v-else-if="referralCode">
      <img src="/images/orchard_app_icons/referrals-elementor-io-optimized.webp" alt="" class="mx-auto mt-4 h-28 w-28 object-contain">

      <div class="mt-6 grid gap-4 rounded-lg border border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] p-5 shadow-sm sm:grid-cols-3">
        <div>
          <p class="text-xs text-[var(--oc-text-muted)]">Referrer Signups</p>
          <p class="oc-tnum mt-1 text-xl font-semibold text-[var(--oc-text-primary)]">
            <!-- <span v-if="statsPending">…</span>
            <span v-else>{{ stats?.signups ?? '—' }}</span> -->
            {{ totalReferred }}
          </p>
        </div>
        <div>
          <p class="text-xs text-[var(--oc-text-muted)]">Pending Bonus</p>
          <p class="oc-tnum mt-1 text-xl font-semibold text-[var(--oc-text-primary)]">
            <!-- <span v-if="statsPending">…</span> -->
            <Currency  :value="totalPendingBonus" />
            <!-- <span v-else>—</span> -->
            
          </p>
        </div>
        <div>
          <p class="text-xs text-[var(--oc-text-muted)]">Total Bonus Earned</p>
          <p class="oc-tnum mt-1 text-xl font-semibold text-[var(--oc-status-success-fg)]">
            <!-- <span v-if="statsPending">…</span> -->
            <Currency :value="totalEarnedBonus" />
            <!-- <span v-else>—</span> -->
          </p>
        </div>
        <p v-if="!statsPending && !stats" class="text-xs text-[var(--oc-text-faint)] sm:col-span-3">
          Live referral stats aren't available yet.
        </p>
      </div>

      <div class="mt-6 space-y-4">
        <div>
          <label class="mb-1 block text-sm font-semibold text-[var(--oc-text-primary)]">Referral Code</label>
          <div class="flex items-center justify-between rounded-md border border-[var(--oc-border-strong)] px-3 py-2.5">
            <span class="oc-tnum text-sm font-medium text-[var(--oc-text-primary)]">{{ referralCode }}</span>
            <CopyButton :text="referralCode" label="Copy referral code" />
          </div>
        </div>

        <div>
          <label class="mb-1 block text-sm font-semibold text-[var(--oc-text-primary)]">Referral Link</label>
          <div class="flex items-center justify-between gap-2 rounded-md border border-[var(--oc-border-strong)] px-3 py-2.5">
            <span class="truncate text-sm text-[var(--oc-text-secondary)]">{{ referralLink }}</span>
            <CopyButton :text="referralLink" label="Copy referral link" />
          </div>
        </div>
      </div>

      <div class="mt-6 rounded-lg border border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] px-5 shadow-sm">
        <Accordion v-model:open="howItWorksOpen" title="How it works">
          <p>
            Share your referral link or code with friends. When they sign up and complete their
            first investment, you earn a bonus credited to your wallet.
          </p>
        </Accordion>
        <Accordion v-model:open="termsOpen" title="Terms">
          <p>
            Referral bonuses are subject to Orchard's referral program terms and may be adjusted
            or withdrawn at any time. Bonuses are paid once a referred user's qualifying
            investment is confirmed.
          </p>
        </Accordion>
      </div>
    </template>

    <div v-else class="mt-10 flex flex-col items-center gap-3 text-center">
      <img src="/images/orchard_app_icons/referrals-elementor-io-optimized.webp" alt="" class="h-28 w-28 object-contain">
      <p class="text-sm text-[var(--oc-text-muted)]">We couldn't load your referral details right now. Please try again shortly.</p>
    </div>
  </div>
</template>
