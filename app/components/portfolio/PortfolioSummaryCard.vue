<script setup lang="ts">
import { RiArrowRightLine, RiSafeLine } from '@remixicon/vue'
import type { PortfolioTypeSummary } from '~/types/api'

const props = defineProps<{ summary: PortfolioTypeSummary }>()

const growthPercent = computed(() => {
  if (!props.summary.total_invested) return 0
  return (props.summary.total_accumulated_yield / props.summary.total_invested) * 100
})
</script>

<template>
  <NuxtLink
    :to="`/portfolio/${summary.product_type_id}`"
    class="flex flex-col gap-3 rounded-lg border border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] p-5 shadow-sm transition-shadow duration-fast ease-standard hover:shadow-md"
  >
    <div class="flex items-center gap-3">
      <span class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[var(--oc-bg-subtle)] text-[var(--oc-text-secondary)]">
        <ApiImage :src="resolveApiImage(summary.type_image)" :alt="summary.product_type_name" :fallback-icon="RiSafeLine" />
      </span>
      <p class="truncate text-sm font-semibold text-[var(--oc-text-primary)]">{{ summary.product_type_name }}</p>
    </div>

    <div class="grid grid-cols-2 gap-3 text-sm">
      <div>
        <p class="text-xs text-[var(--oc-text-muted)]">Total Invested</p>
        <p class="oc-tnum font-semibold text-[var(--oc-text-primary)]"><Currency :value="summary.total_invested" /></p>
      </div>
      <div>
        <p class="text-xs text-[var(--oc-text-muted)]">Total Gained</p>
        <p class="oc-tnum font-semibold text-[var(--oc-status-success-fg)]">
          <Currency :value="summary.total_accumulated_yield" />
        </p>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <span class="oc-tnum text-xs font-semibold text-[var(--oc-status-success-fg)]">
        +{{ growthPercent.toFixed(2) }}%
      </span>
      <span class="inline-flex items-center gap-1 text-xs font-semibold text-[var(--oc-text-link)]">
        View Portfolio <RiArrowRightLine class="h-3.5 w-3.5" />
      </span>
    </div>
  </NuxtLink>
</template>
