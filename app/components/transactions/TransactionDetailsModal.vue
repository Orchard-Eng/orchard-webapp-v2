<script setup lang="ts">
import { RiArrowDownLine, RiArrowUpLine, RiDownloadCloud2Line } from '@remixicon/vue'
import type { Transaction } from '~/types/api'

const open = defineModel<boolean>('open', { default: false })
const props = defineProps<{ transaction: Transaction | null }>()

const isCredit = computed(() => {
  if (!props.transaction) return true
  const haystack = `${props.transaction.type} ${props.transaction.description}`.toLowerCase()
  if (haystack.includes('credit') || haystack.includes('funding')) return true
  if (haystack.includes('debit') || haystack.includes('invest')) return false
  return Number(props.transaction.amount) >= 0
})

const rows = computed(() => {
  const t = props.transaction
  if (!t) return []
  return [
    { label: 'Transaction ID', value: t.transaction_id },
    { label: 'Type', value: t.type },
    { label: 'Source', value: t.transaction_source ?? '—' },
    { label: 'Destination', value: t.transaction_destination ?? '—' },
    { label: 'Date', value: formatDateTime(t.transaction_date) },
    { label: 'Reference', value: t.reference }
  ]
})
</script>

<template>
  <Modal v-model:open="open">
    <template v-if="transaction" #header>
      <div class="flex items-center gap-3">
        <span
          class="flex h-10 w-10 items-center justify-center rounded-full"
          :class="isCredit ? 'bg-[var(--oc-status-success-bg)] text-[var(--oc-status-success-fg)]' : 'bg-[var(--oc-status-danger-bg)] text-[var(--oc-status-danger-fg)]'"
        >
          <RiArrowDownLine v-if="isCredit" class="h-5 w-5" />
          <RiArrowUpLine v-else class="h-5 w-5" />
        </span>
        <span
          class="oc-tnum oc-display text-xl font-semibold"
          :class="isCredit ? 'text-[var(--oc-status-success-fg)]' : 'text-[var(--oc-status-danger-fg)]'"
        >
          {{ isCredit ? '+' : '-' }}<Currency :value="transaction.amount" />
        </span>
      </div>
    </template>

    <div v-if="transaction" class="space-y-3">
      <p class="text-sm text-[var(--oc-text-muted)]">{{ transaction.description }}</p>

      <dl class="divide-y divide-[var(--oc-border-default)]">
        <div class="flex items-center justify-between py-2 text-sm">
          <dt class="text-[var(--oc-text-muted)]">Status</dt>
          <dd><StatusPill :status="transaction.status" /></dd>
        </div>
        <div v-for="row in rows" :key="row.label" class="flex items-center justify-between py-2 text-sm">
          <dt class="text-[var(--oc-text-muted)]">{{ row.label }}</dt>
          <dd class="max-w-[60%] truncate text-right font-medium text-[var(--oc-text-primary)]">{{ row.value }}</dd>
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
