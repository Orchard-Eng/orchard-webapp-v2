<script setup lang="ts">
import { RiArrowRightSLine, RiSafeLine } from '@remixicon/vue'
import type { InvestmentProduct } from '~/types/api'

const props = defineProps<{
  product: InvestmentProduct
  // The investment type also carries its own risk_category (confirmed live, 2026-08-19,
  // and identical in practice to the product's own) — callers that already have it
  // (grouped-by-type views) can pass it down instead of relying on the product's copy.
  riskCategory?: { name: string; colour_code: string }
}>()

const risk = computed(() => props.riskCategory ?? props.product.risk_category)
</script>

<template>
  <NuxtLink
    :to="`/investments/products/${product.slug}`"
    class="flex min-w-[260px] flex-col gap-4 rounded-2xl border border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] p-5 shadow-sm transition-shadow duration-fast ease-standard hover:shadow-md"
  >
    <div class="flex items-center gap-4">
      <span class="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--oc-bg-subtle)] text-[var(--oc-text-secondary)]">
        <ApiImage
          :src="resolveApiImage(product.product_image)"
          :alt="product.product_name"
          :fallback-icon="RiSafeLine"
          icon-class="h-6 w-6"
        />
      </span>
      <div class="min-w-0">
        <p class="truncate text-base font-semibold text-[var(--oc-text-primary)]">{{ product.product_name }}</p>
        <p v-if="product.partner?.name" class="truncate text-sm text-[var(--oc-text-muted)]">{{ product.partner.name }}</p>
      </div>
    </div>

    <div class="grid grid-cols-3 divide-x divide-[var(--oc-border-default)] rounded-xl bg-[var(--oc-bg-subtle)] p-4">
      <div class="pr-3">
        <p class="text-xs text-[var(--oc-text-muted)]">Maturity Date</p>
        <p class="mt-1 text-sm font-semibold text-[var(--oc-text-primary)]">{{ formatDate(product.maturity_date) }}</p>
      </div>
      <div class="px-3">
        <p class="text-xs text-[var(--oc-text-muted)]">Rate</p>
        <p class="oc-tnum mt-1 text-sm font-semibold text-[var(--oc-text-primary)]">
          {{ product.interest ? `${Number(product.interest)}% p.a` : '—' }}
        </p>
      </div>
      <div class="pl-3">
        <span
          v-if="risk?.name"
          class="inline-flex items-center gap-1.5 text-xs font-semibold"
          :style="{ color: risk.colour_code }"
        >
          <span class="h-1.5 w-1.5 shrink-0 rounded-full" :style="{ backgroundColor: risk.colour_code }" />
          {{ risk.name }}
        </span>
        <span class="mt-1 flex items-center gap-1 text-xs font-semibold text-[var(--oc-text-link)]">
          View Details
          <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-white">
            <RiArrowRightSLine class="h-3.5 w-3.5" />
          </span>
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
