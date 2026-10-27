<script setup lang="ts">
import { RiArrowLeftLine } from '@remixicon/vue'
import type { ApiEnvelope, InvestmentProduct, PortfolioHolding, PortfolioTypeDetail } from '~/types/api'

const route = useRoute()
const api = useApi()

const { data: detailRes, pending } = useLazyAsyncData(`portfolio-type-${route.params.id}`, () =>
  api<ApiEnvelope<PortfolioTypeDetail>>(`/users/investments/portfolio/items/${route.params.id}`)
)
// PortfolioHolding carries no image/issuer field — cross-reference the products list by
// product_id (same join pattern investments/index.vue uses) so HoldingCard can show a real
// image/issuer instead of the mockup's flat placeholder.
const { data: productsRes } = useLazyAsyncData('investment-products', () =>
  api<ApiEnvelope<InvestmentProduct[]>>('/users/investments/products')
)

const detail = computed(() => detailRes.value?.data)
usePageSeo(
  () => detail.value?.product_type_name ?? 'Portfolio Details',
  () => `Your ${detail.value?.product_type_name ?? 'portfolio'} holdings on Orchard.`
)
const activeHoldings = computed(() => detail.value?.investments ?? [])
const productsById = computed(() => {
  const map = new Map<string, InvestmentProduct>()
  for (const product of productsRes.value?.data ?? []) map.set(product.product_id, product)
  return map
})

const selectedHolding = ref<PortfolioHolding | null>(null)
function openHolding(holding: PortfolioHolding) {
  selectedHolding.value = holding
}
</script>

<template>
  <div>
    <NuxtLink to="/portfolio" class="inline-flex items-center gap-1 text-sm font-semibold text-[var(--oc-text-link)]">
      <RiArrowLeftLine class="h-4 w-4" /> Back
    </NuxtLink>

    <SkeletonPage v-if="pending" :count="3" class="mt-6" />

    <template v-else-if="detail">
      <h1 class="oc-display mt-4 text-2xl font-semibold text-[var(--oc-text-primary)]">{{ detail.product_type_name }}</h1>

      <div class="mt-4 grid gap-4 rounded-lg border border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] p-5 shadow-sm sm:grid-cols-3">
        <div>
          <p class="inline-flex items-center gap-1 text-xs text-[var(--oc-text-muted)]">
            Current Value
            <InfoTip text="What this category is worth right now: your total investment plus the interest earned so far." />
          </p>
          <p class="oc-tnum mt-1 text-lg font-semibold text-[var(--oc-text-primary)]">
            <Currency :value="detail.total_invested + detail.total_accumulated_yield" />
          </p>
        </div>
        <div>
          <p class="text-xs text-[var(--oc-text-muted)]">Total Investment</p>
          <p class="oc-tnum mt-1 text-lg font-semibold text-[var(--oc-text-primary)]">
            <Currency :value="detail.total_invested" />
          </p>
        </div>
        <div>
          <p class="inline-flex items-center gap-1 text-xs text-[var(--oc-text-muted)]">
            Total Gain
            <InfoTip text="Interest earned so far across all investments in this category. This grows daily but is only paid out at each investment's maturity date." align="right" />
          </p>
          <p class="oc-tnum mt-1 text-lg font-semibold text-[var(--oc-status-success-fg)]">
            <Currency :value="detail.total_accumulated_yield" />
          </p>
        </div>
      </div>

      <h2 class="oc-display mt-8 text-lg font-semibold text-[var(--oc-text-primary)]">
        Active Investments ({{ activeHoldings.length }})
      </h2>
      <div class="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <HoldingCard
          v-for="holding in activeHoldings"
          :key="holding.uuid"
          :holding="holding"
          :product="productsById.get(holding.product_id)"
          @select="openHolding"
        />
        <div v-if="!activeHoldings.length" class="col-span-full flex flex-col items-center gap-3 py-10 text-center">
          <NuxtImg src="/images/orchard_app_icons/empty_state_portfolio-elementor-io-optimized.webp" width="128" height="128" loading="lazy" alt="" class="h-32 w-32 object-contain" />
          <p class="text-sm text-[var(--oc-text-muted)]">No active investments in this category.</p>
        </div>
      </div>
    </template>

    <InvestmentDetailsModal
      :open="!!selectedHolding"
      :holding="selectedHolding"
      :product="selectedHolding ? productsById.get(selectedHolding.product_id) : undefined"
      @update:open="(v) => !v && (selectedHolding = null)"
    />
  </div>
</template>
