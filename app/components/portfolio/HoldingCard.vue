<script setup lang="ts">
import { RiArrowRightSLine, RiSafeLine } from '@remixicon/vue'
import type { InvestmentProduct, PortfolioHolding } from '~/types/api'

const props = defineProps<{
  holding: PortfolioHolding
  // PortfolioHolding itself carries no image/issuer field — the caller (portfolio/[id].vue)
  // cross-references the products list by product_id, same pattern investments/index.vue
  // already uses to join products with their type. Degrades gracefully (icon fallback, no
  // issuer line) when no match is found.
  product?: InvestmentProduct
}>()
defineEmits<{ select: [holding: PortfolioHolding] }>()

// No elapsed-time field exists on the API — computed client-side from created_at (start)
// to maturity_date, clamped to [0, 100].
const progressPercent = computed(() => {
  const start = new Date(props.holding.created_at).getTime()
  const end = new Date(props.holding.maturity_date).getTime()
  if (!(end > start)) return 0
  return Math.min(100, Math.max(0, ((Date.now() - start) / (end - start)) * 100))
})
</script>

<template>
  <button
    type="button"
    class="flex w-full flex-col gap-4 rounded-2xl border border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] p-5 text-left shadow-sm transition-shadow duration-fast ease-standard hover:shadow-md"
    @click="$emit('select', holding)"
  >
    <div class="flex items-center gap-4">
      <span class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--oc-bg-subtle)] text-[var(--oc-text-secondary)]">
        <ApiImage
          :src="resolveApiImage(product?.product_image)"
          :alt="holding.product_name"
          :fallback-icon="RiSafeLine"
          icon-class="h-7 w-7"
        />
      </span>
      <div class="min-w-0">
        <p class="truncate text-base font-semibold text-[var(--oc-text-primary)]">{{ holding.product_name }}</p>
        <p v-if="product?.partner?.name" class="truncate text-sm text-[var(--oc-text-muted)]">{{ product.partner.name }}</p>
      </div>
    </div>

    <div class="rounded-xl border border-[var(--oc-border-default)] p-4">
      <div class="flex items-center justify-between">
        <p class="text-xs text-[var(--oc-text-muted)]">Total Invested</p>
        <p class="text-xs text-[var(--oc-text-muted)]">Rate</p>
      </div>
      <div class="mt-1 flex items-center justify-between">
        <p class="oc-tnum text-lg font-semibold text-[var(--oc-text-primary)]"><Currency :value="holding.amount_invested" /></p>
        <p class="oc-tnum text-lg font-semibold text-[var(--oc-text-primary)]">{{ Number(holding.interest_rate) }}% p.a</p>
      </div>

      <div class="mt-4 h-2 w-full overflow-hidden rounded-pill bg-[var(--oc-bg-muted)]">
        <div class="h-full rounded-pill bg-[var(--oc-action-primary-bg)]" :style="{ width: `${progressPercent}%` }" />
      </div>

      <div class="mt-3 flex items-center justify-between">
        <p class="text-xs text-[var(--oc-text-muted)]">Start</p>
        <p class="text-xs text-[var(--oc-text-muted)]">Maturity</p>
      </div>
      <div class="mt-1 flex items-center justify-between">
        <p class="text-sm font-semibold text-[var(--oc-text-primary)]">{{ formatDate(holding.created_at) }}</p>
        <p class="text-sm font-semibold text-[var(--oc-text-primary)]">{{ formatDate(holding.maturity_date) }}</p>
      </div>
    </div>

    <span class="flex items-center justify-end gap-1 text-xs font-semibold text-[var(--oc-text-link)]">
      View Details
      <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-white">
        <RiArrowRightSLine class="h-3.5 w-3.5" />
      </span>
    </span>
  </button>
</template>
