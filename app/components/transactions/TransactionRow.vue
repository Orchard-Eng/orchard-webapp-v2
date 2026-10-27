<script setup lang="ts">
import { RiArrowDownLine, RiArrowUpLine } from '@remixicon/vue'
import type { Transaction } from '~/types/api'

const props = withDefaults(defineProps<{ transaction: Transaction; showStatus?: boolean }>(), {
  showStatus: false
})
defineEmits<{ select: [transaction: Transaction] }>()

// "credit" (money in) vs "debit" (money out) — `type` is a free-form category (confirmed
// live values include "debit" and "investment", not a clean binary), and `direction` was
// observed null on every real transaction, so this still falls back to a keyword match
// rather than trusting a single field.
const isCredit = computed(() => {
  const haystack = `${props.transaction.type} ${props.transaction.description}`.toLowerCase()
  if (haystack.includes('credit') || haystack.includes('funding')) return true
  if (haystack.includes('debit') || haystack.includes('invest')) return false
  return Number(props.transaction.amount) >= 0
})

// `type` is a raw free-form category from the API ("debit", "investment") — title-case it
// for display since it's now the secondary label, not fabricate a fuller mapping the API
// values don't confirm.
const typeLabel = computed(() => {
  const type = props.transaction.type
  if (!type) return ''
  return type.charAt(0).toUpperCase() + type.slice(1)
})
</script>

<template>
  <button
    type="button"
    class="flex w-full items-center gap-3 rounded-md px-2 py-3 text-left transition-colors duration-fast ease-standard hover:bg-[var(--oc-bg-subtle)]"
    @click="$emit('select', transaction)"
  >
    <span
      class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
      :class="isCredit ? 'bg-[var(--oc-status-success-bg)] text-[var(--oc-status-success-fg)]' : 'bg-[var(--oc-status-danger-bg)] text-[var(--oc-status-danger-fg)]'"
    >
      <RiArrowDownLine v-if="isCredit" class="h-4 w-4" />
      <RiArrowUpLine v-else class="h-4 w-4" />
    </span>

    <span class="min-w-0 flex-1">
      <span class="block truncate text-sm font-medium text-[var(--oc-text-primary)]">
        {{ transaction.description }}
      </span>
      <span class="block truncate text-xs text-[var(--oc-text-muted)]">
        {{ typeLabel }}
      </span>
      <StatusPill v-if="showStatus" :status="transaction.status" class="mt-1" />
    </span>

    <span class="shrink-0 text-right">
      <span
        class="oc-tnum block text-sm font-semibold"
        :class="isCredit ? 'text-[var(--oc-status-success-fg)]' : 'text-[var(--oc-status-danger-fg)]'"
      >
        {{ isCredit ? '+' : '-' }}<Currency :value="transaction.amount" />
      </span>
      <span class="block text-xs text-[var(--oc-text-faint)]">{{ formatDateTime(transaction.transaction_date) }}</span>
    </span>
  </button>
</template>
