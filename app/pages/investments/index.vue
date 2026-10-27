<script setup lang="ts">
import type { ApiEnvelope, InvestmentProduct, InvestmentType } from '~/types/api'

usePageSeo('Investments', 'Browse curated investment products available on Orchard.')

const api = useApi()

const { data: typesRes, pending: typesPending } = useLazyAsyncData('investment-types', () =>
  api<ApiEnvelope<InvestmentType[]>>('/users/investments/types')
)
const { data: productsRes, pending: productsPending } = useLazyAsyncData('investment-products', () =>
  api<ApiEnvelope<InvestmentProduct[]>>('/users/investments/products')
)

const loading = computed(() => typesPending.value || productsPending.value)

const groups = computed(() => {
  const types = typesRes.value?.data ?? []
  const products = productsRes.value?.data ?? []
  return types
    .map((type) => ({
      type,
      products: products.filter((p) => p.product_type_id === type.uuid)
    }))
    .filter((group) => group.products.length > 0)
})
</script>

<template>
  <div>
    <h1 class="oc-display text-2xl font-semibold text-[var(--oc-text-primary)]">Invest</h1>

    <SkeletonPage v-if="loading" :count="3" class="mt-6" />

    <div v-else class="mt-6 space-y-8">
      <section v-for="group in groups" :key="group.type.uuid">
        <div class="flex items-center justify-between">
          <h2 class="oc-display text-lg font-semibold text-[var(--oc-text-primary)]">{{ group.type.name }}</h2>
          <NuxtLink
            :to="`/investments/types/${group.type.uuid}`"
            class="text-xs font-semibold uppercase tracking-wide text-[var(--oc-text-link)]"
          >
            View All
          </NuxtLink>
        </div>
        <div class="mt-3 flex gap-4 overflow-x-auto pb-2">
          <ProductCard
            v-for="product in group.products.slice(0, 4)"
            :key="product.product_id"
            :product="product"
            :risk-category="group.type.risk_category"
          />
        </div>
      </section>

      <div v-if="!groups.length" class="flex flex-col items-center gap-3 py-10 text-center">
        <NuxtImg src="/images/orchard_app_icons/empty_state_investments-elementor-io-optimized.webp" width="128" height="128" loading="lazy" alt="" class="h-32 w-32 object-contain" />
        <p class="text-sm text-[var(--oc-text-muted)]">No investment products available right now.</p>
      </div>
    </div>
  </div>
</template>
