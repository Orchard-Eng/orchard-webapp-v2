<script setup lang="ts">
import { RiArrowLeftSLine, RiArrowRightSLine, RiSearchLine } from '@remixicon/vue'
import type { ApiEnvelope, Transaction } from '~/types/api'

usePageSeo('Transactions', 'View and search your Orchard transaction history.')

const api = useApi()

const { data: transactionsRes, pending } = useLazyAsyncData('all-transactions', () =>
  api<ApiEnvelope<Transaction[]>>('/users/transactions')
)

const transactions = computed(() => transactionsRes.value?.data ?? [])

const search = ref('')
const fromDate = ref('')
const toDate = ref('')
const typeFilter = ref('')
const statusFilter = ref('')

const typeOptions = computed(() => [...new Set(transactions.value.map((t) => t.type))].sort())
const statusOptions = computed(() => [...new Set(transactions.value.map((t) => t.status))].sort())

const filtered = computed(() =>
  transactions.value.filter((t) => {
    if (search.value) {
      const haystack = `${t.type} ${t.description} ${t.reference}`.toLowerCase()
      if (!haystack.includes(search.value.toLowerCase())) return false
    }
    // transaction_date is a full ISO timestamp; compare only the date portion against the
    // <input type="date"> value (yyyy-mm-dd) so same-day transactions aren't excluded by a
    // naive full-string comparison.
    const dateOnly = t.transaction_date.slice(0, 10)
    if (fromDate.value && dateOnly < fromDate.value) return false
    if (toDate.value && dateOnly > toDate.value) return false
    if (typeFilter.value && t.type !== typeFilter.value) return false
    if (statusFilter.value && t.status !== statusFilter.value) return false
    return true
  })
)

const page = ref(1)
const pageSize = 10
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const paginated = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize))

watch([search, fromDate, toDate, typeFilter, statusFilter], () => {
  page.value = 1
})

const selectedTransaction = ref<Transaction | null>(null)
function openTransaction(transaction: Transaction) {
  selectedTransaction.value = transaction
}

const inputClasses =
  'rounded-md border border-[var(--oc-border-strong)] bg-[var(--oc-bg-surface)] px-3 py-2 text-sm text-[var(--oc-text-primary)] outline-none focus:border-[var(--oc-border-focus)] focus:ring-2 focus:ring-[var(--oc-focus-ring)]'
</script>

<template>
  <div>
    <h1 class="oc-display text-2xl font-semibold text-[var(--oc-text-primary)]">Transactions</h1>

    <div class="mt-4 flex flex-wrap gap-3">
      <div class="relative flex-1 min-w-[200px]">
        <RiSearchLine class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--oc-text-faint)]" />
        <input
          v-model="search"
          type="search"
          placeholder="Search transactions"
          :class="inputClasses"
          class="w-full pl-9"
        >
      </div>
      <input v-model="fromDate" type="date" aria-label="From date" :class="inputClasses">
      <input v-model="toDate" type="date" aria-label="To date" :class="inputClasses">
      <select v-model="typeFilter" aria-label="Type" :class="inputClasses">
        <option value="">All Types</option>
        <option v-for="type in typeOptions" :key="type" :value="type">{{ type }}</option>
      </select>
      <select v-model="statusFilter" aria-label="Status" :class="inputClasses">
        <option value="">All Statuses</option>
        <option v-for="status in statusOptions" :key="status" :value="status">{{ status }}</option>
      </select>
    </div>

    <SkeletonPage v-if="pending" :count="5" class="mt-6" />

    <div v-else class="mt-6 rounded-lg border border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] p-2 shadow-sm">
      <TransactionRow
        v-for="transaction in paginated"
        :key="transaction.uuid"
        :transaction="transaction"
        show-status
        @select="openTransaction"
      />
      <div v-if="!filtered.length" class="flex flex-col items-center gap-3 py-10 text-center">
        <NuxtImg src="/images/orchard_app_icons/empty_state_transactions-elementor-io-optimized.webp" width="128" height="128" loading="lazy" alt="" class="h-32 w-32 object-contain" />
        <p class="text-sm text-[var(--oc-text-muted)]">No transactions match your filters.</p>
      </div>
    </div>

    <div v-if="filtered.length > pageSize" class="mt-4 flex items-center justify-between text-sm">
      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-md border border-[var(--oc-border-strong)] px-3 py-1.5 font-medium text-[var(--oc-text-primary)] disabled:opacity-40"
        :disabled="page === 1"
        @click="page -= 1"
      >
        <RiArrowLeftSLine class="h-4 w-4" /> Prev
      </button>
      <span class="text-[var(--oc-text-muted)]">Page {{ page }} of {{ totalPages }}</span>
      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-md border border-[var(--oc-border-strong)] px-3 py-1.5 font-medium text-[var(--oc-text-primary)] disabled:opacity-40"
        :disabled="page === totalPages"
        @click="page += 1"
      >
        Next <RiArrowRightSLine class="h-4 w-4" />
      </button>
    </div>

    <TransactionDetailsModal
      :open="!!selectedTransaction"
      :transaction="selectedTransaction"
      @update:open="(v) => !v && (selectedTransaction = null)"
    />
  </div>
</template>
