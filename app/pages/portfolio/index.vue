<script setup lang="ts">
import type { ApiEnvelope, PortfolioSummary } from '~/types/api'

usePageSeo('Portfolio', 'Track the performance of your investments on Orchard.')

const api = useApi()

const { data: portfolioRes, pending } = useLazyAsyncData('portfolio-summary', () =>
  api<ApiEnvelope<PortfolioSummary>>('/users/investments/portfolio')
)

const portfolioData = computed(() => portfolioRes.value?.data?.portfolio_data ?? [])
const activeCount = computed(() => portfolioRes.value?.data?.active_portfolio ?? 0)
const completedCount = computed(() => portfolioRes.value?.data?.completed_portfolio ?? 0)

const portfolioBalance = computed(() =>
  portfolioData.value.reduce((sum, p) => sum + (p.total_invested ?? 0), 0)
)

const palette = ['#5EC751', '#F98D45', '#2F6FEB', '#F4B740', '#E5484D', '#8A97A5']
const chartSegments = computed(() =>
  portfolioData.value.map((p, i) => ({
    label: p.product_type_name,
    value: p.total_invested,
    color: palette[i % palette.length] ?? '#8A97A5'
  }))
)
</script>

<template>
  <div>
    <h1 class="oc-display text-2xl font-semibold text-[var(--oc-text-primary)]">Portfolio</h1>

    <SkeletonPage v-if="pending" :count="4" class="mt-6" />

    <template v-else>
      <div class="mt-6 rounded-lg border border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] p-6 shadow-sm">
        <h2 class="oc-display text-lg font-semibold text-[var(--oc-text-primary)]">Portfolio Overview</h2>

        <div class="mt-4 grid gap-6 lg:grid-cols-[auto_1fr]">
          <DonutChart :segments="chartSegments" />

          <div class="grid grid-cols-3 gap-4">
            <div>
              <p class="inline-flex items-center gap-1 text-xs text-[var(--oc-text-muted)]">
                Portfolio Balance
                <InfoTip text="The total amount you've invested across every category below. This is your principal only, not including interest earned." />
              </p>
              <p class="oc-tnum mt-1 text-xl font-semibold text-[var(--oc-text-primary)]">
                <AnimatedCurrency :value="portfolioBalance" />
              </p>
            </div>
            <div>
              <p class="inline-flex items-center gap-1 text-xs text-[var(--oc-text-muted)]">
                Active Investments
                <InfoTip text="Investments still earning interest. You'll get your principal and interest back once each one matures." />
              </p>
              <p class="oc-tnum mt-1 text-xl font-semibold text-[var(--oc-text-primary)]">{{ activeCount }}</p>
            </div>
            <div>
              <p class="inline-flex items-center gap-1 text-xs text-[var(--oc-text-muted)]">
                Completed Investments
                <InfoTip
                  text="Investments that have matured and already been paid out to your wallet."
                  align="right"
                />
              </p>
              <p class="oc-tnum mt-1 text-xl font-semibold text-[var(--oc-text-primary)]">{{ completedCount }}</p>
            </div>
          </div>
        </div>
      </div>

      <h2 class="oc-display mt-8 text-lg font-semibold text-[var(--oc-text-primary)]">Portfolio Summary</h2>
      <div class="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <PortfolioSummaryCard v-for="summary in portfolioData" :key="summary.product_type_id" :summary="summary" />
        <div v-if="!portfolioData.length" class="col-span-full flex flex-col items-center gap-3 py-10 text-center">
          <NuxtImg src="/images/orchard_app_icons/empty_state_portfolio-elementor-io-optimized.webp" width="128" height="128" loading="lazy" alt="" class="h-32 w-32 object-contain" />
          <p class="text-sm text-[var(--oc-text-muted)]">You don't have any investments yet.</p>
        </div>
      </div>
    </template>
  </div>
</template>
