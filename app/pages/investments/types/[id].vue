<script setup lang="ts">
import { RiArrowLeftLine } from '@remixicon/vue'
import type { ApiEnvelope, InvestmentProduct, InvestmentType } from '~/types/api'

const route = useRoute()
const api = useApi()

const { data: typesRes, pending: typesPending } = useLazyAsyncData('investment-types', () =>
  api<ApiEnvelope<InvestmentType[]>>('/users/investments/types')
)
const { data: productsRes, pending: productsPending } = useLazyAsyncData('investment-products', () =>
  api<ApiEnvelope<InvestmentProduct[]>>('/users/investments/products')
)

const loading = computed(() => typesPending.value || productsPending.value)

const type = computed(() =>
  (typesRes.value?.data ?? []).find((t) => t.uuid === route.params.id)
)
const products = computed(() =>
  (productsRes.value?.data ?? []).filter((p) => p.product_type_id === route.params.id)
)
usePageSeo(
  () => type.value?.name ?? 'Investment Category',
  () => `Browse ${type.value?.name ?? 'investment'} opportunities on Orchard.`
)
</script>

<template>
  <div>
    <NuxtLink to="/investments" class="inline-flex items-center gap-1 text-sm font-semibold text-[var(--oc-text-link)]">
      <RiArrowLeftLine class="h-4 w-4" /> Back
    </NuxtLink>

    <SkeletonPage v-if="loading" :count="3" class="mt-6" />

    <template v-else>
      <h1 class="oc-display mt-4 text-2xl font-semibold text-[var(--oc-text-primary)]">
        {{ type?.name ?? 'Investment Category' }}
      </h1>
      <SafeHtml v-if="type?.description" class="mt-2 max-w-2xl text-sm text-[var(--oc-text-muted)]" :html="type.description" />

      <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ProductCard
          v-for="product in products"
          :key="product.product_id"
          :product="product"
          :risk-category="type?.risk_category"
        />
        <div v-if="!products.length" class="col-span-full flex flex-col items-center gap-3 py-10 text-center">
          <NuxtImg src="/images/orchard_app_icons/empty_state_investments-elementor-io-optimized.webp" width="128" height="128" loading="lazy" alt="" class="h-32 w-32 object-contain" />
          <p class="text-sm text-[var(--oc-text-muted)]">No products available in this category right now.</p>
        </div>
      </div>
    </template>
  </div>
</template>
