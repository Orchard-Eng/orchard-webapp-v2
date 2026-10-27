<script setup lang="ts">
import { RiDownloadCloud2Line, RiSafeLine } from '@remixicon/vue'
import type { InvestmentProduct, PortfolioHolding } from '~/types/api'

const open = defineModel<boolean>('open', { default: false })
const props = defineProps<{ holding: PortfolioHolding | null; product?: InvestmentProduct }>()

// Several of these fields come back as strings from the portfolio-items endpoint
// (confirmed live, 2026-08-19) — Number() them explicitly before arithmetic, since JS's
// `+` silently concatenates a number and a string instead of adding them.
const currentValue = computed(() => {
  const h = props.holding
  if (!h) return 0
  return h.amount_invested + Number(h.accumulated_yield)
})

const rows = computed(() => {
  const h = props.holding
  if (!h) return []
  return [
    { label: 'Total Invested', value: h.amount_invested, currency: true },
    {
      label: 'Interest Rate',
      value: `${Number(h.interest_rate)}%`,
      tip: 'A per annum (yearly) rate. Your gains are prorated for the number of days held, shown as Tenure.'
    },
    { label: 'Tenure', value: `${h.minimum_tenure} Days`, tip: 'The number of days this investment is locked in for, and the period its interest is prorated over.' },
    { label: 'Total Gains', value: Number(h.accumulated_yield), currency: true, tip: 'Interest earned so far. This grows daily but is only paid out at maturity.' },
    { label: 'Current Value', value: currentValue.value, currency: true, tip: 'What this investment is worth right now: your principal plus interest earned so far.' },
    {
      label: 'Estimated Final Payout',
      value: Number(h.expected_payout),
      currency: true,
      tip: 'Your principal plus interest, if held to the maturity date.'
    },
    { label: 'Growth %', value: `${h.percentage_gain}%`, tip: 'Interest earned so far as a percentage of your principal.' },
    { label: 'Start Date', value: formatDate(h.created_at) },
    { label: 'Maturity Date', value: formatDate(h.maturity_date), tip: "The date this investment matures and is paid out to your wallet. You can't withdraw before this date." }
  ]
})
</script>

<template>
  <Modal v-model:open="open" title="Investment Details">
    <div v-if="holding" class="space-y-4">
      <div class="flex flex-col items-center gap-3">
        <span class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[var(--oc-bg-subtle)] text-[var(--oc-text-secondary)]">
          <ApiImage
            :src="resolveApiImage(product?.product_image)"
            :alt="holding.product_name"
            :fallback-icon="RiSafeLine"
            icon-class="h-8 w-8"
          />
        </span>
        <span class="oc-display text-center text-lg font-semibold text-[var(--oc-text-primary)]">{{ holding.product_name }}</span>
      </div>

      <dl class="divide-y divide-[var(--oc-border-default)]">
        <div v-for="row in rows" :key="row.label" class="flex items-center justify-between py-2 text-sm">
          <dt class="inline-flex items-center gap-1 text-[var(--oc-text-muted)]">
            {{ row.label }}
            <InfoTip v-if="row.tip" :text="row.tip" />
          </dt>
          <dd class="oc-tnum font-medium text-[var(--oc-text-primary)]">
            <Currency v-if="row.currency" :value="row.value as number" />
            <template v-else>{{ row.value }}</template>
          </dd>
        </div>
      </dl>
    </div>

    <template #footer>
      <button
        type="button"
        disabled
        title="Statement export isn't wired up yet"
        class="flex w-full items-center justify-center gap-2 rounded-pill bg-[var(--oc-action-secondary-bg)] px-5 py-2.5 text-sm font-semibold text-[var(--oc-action-secondary-fg)] opacity-50"
      >
        <RiDownloadCloud2Line class="h-4 w-4" /> Download PDF
      </button>
    </template>
  </Modal>
</template>
