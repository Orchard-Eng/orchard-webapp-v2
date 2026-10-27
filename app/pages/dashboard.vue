<script setup lang="ts">
import { RiArrowRightSLine } from '@remixicon/vue'
import type { ApiEnvelope, Banner, DashboardData, InvestmentProduct, PortfolioSummary, Transaction } from '~/types/api'

usePageSeo('Dashboard', 'Your Orchard wallet balance, portfolio overview, and recent activity.')

const route = useRoute()
const api = useApi()

// Set by login.vue/two-factor.vue immediately after a fresh sign-in when KYC isn't
// complete — the one-time "hard gate". Once dismissed it doesn't come back on its own;
// the banner below is what keeps reminding an already-active session.
const kycModalOpen = ref(route.query.kyc === 'required')

// lazy: mounts the page immediately (with pending=true) instead of Suspense withholding it
// during client-side navigation — see SkeletonPage below, which otherwise never gets a
// chance to render (nuxt.config.ts uses an out-in page transition, so the incoming page
// stays fully unmounted, not just its data, until a blocking useAsyncData resolves).
const { data: dashboardRes, pending: dashboardPending } = useLazyAsyncData('dashboard', () =>
  api<ApiEnvelope<DashboardData>>('/users/dashboard')
)
// GET /api/banners — confirmed live (see Banner in ~/types/api.ts). Note the base path:
// unlike most endpoints this isn't under /users/. `data` may come back as a single object
// (only one banner exists in the sandbox) rather than an array — normalized here. Caught
// and defaulted to an empty list on failure so a hiccup here can't break the page.
const { data: bannersRes } = useLazyAsyncData('banners', () =>
  api<ApiEnvelope<Banner | Banner[]>>('/banners').catch(() => ({ success: false, message: '', data: [] }))
)
const banners = computed(() => {
  const data = bannersRes.value?.data
  if (!data) return []
  return Array.isArray(data) ? data : [data]
})
const { data: portfolioRes, pending: portfolioPending } = useLazyAsyncData('portfolio-summary', () =>
  api<ApiEnvelope<PortfolioSummary>>('/users/investments/portfolio')
)
const { data: transactionsRes, pending: transactionsPending } = useLazyAsyncData('recent-transactions', () =>
  api<ApiEnvelope<Transaction[]>>('/users/transactions')
)
const { data: productsRes, pending: productsPending } = useLazyAsyncData('featured-products', () =>
  api<ApiEnvelope<InvestmentProduct[]>>('/users/investments/products')
)

const loading = computed(
  () => dashboardPending.value || portfolioPending.value || transactionsPending.value || productsPending.value
)

const user = computed(() => dashboardRes.value?.data?.dashboard_data?.user)
const greeting = computed(() => {
  const p = user.value?.profile
  return p?.firstname || 'there'
})

// Wallet is embedded directly in the user object (confirmed live, 2026-08-19) — no
// separate endpoint call needed, contrary to the earlier bundle-derived assumption.
const wallet = computed(() => user.value?.wallet ?? null)
const needsKyc = computed(() => !isKycComplete(user.value))

// Two distinct real accounts, both nested under profile: v_bank_* is Orchard's own
// virtual funding account (Wallet Funding modal); nuban/nuban_* is the user's own linked
// withdrawal account (Send Money's destination).
const fundingAccount = computed(() => {
  const p = user.value?.profile
  if (!p) return null
  return { bank_name: p.v_bank_name, account_number: p.v_bank_number, account_name: p.v_bank_acct_name }
})
const withdrawalAccount = computed(() => {
  const p = user.value?.profile
  if (!p?.nuban || !p.nuban_bank || !p.nuban_account_name) return null
  return { bank_name: p.nuban_bank, account_number: p.nuban, account_name: p.nuban_account_name }
})

const portfolioData = computed(() => portfolioRes.value?.data)
const portfolioTotal = computed(
  () => portfolioData.value?.portfolio_data?.reduce((sum, p) => sum + (p.total_invested ?? 0), 0) ?? 0
)

// Same palette/shape as the full Portfolio page's chart (app/pages/portfolio/index.vue) —
// reused as-is for visual consistency, fed from the same already-fetched summary endpoint.
const chartPalette = ['#5EC751', '#F98D45', '#2F6FEB', '#F4B740', '#E5484D', '#8A97A5']
const chartSegments = computed(() =>
  (portfolioData.value?.portfolio_data ?? []).map((p, i) => ({
    label: p.product_type_name,
    value: p.total_invested,
    color: chartPalette[i % chartPalette.length] ?? '#8A97A5'
  }))
)

const recentTransactions = computed(() => (transactionsRes.value?.data ?? []).slice(0, 6))
// "featured" is a real product field (confirmed live, 2026-08-19) — prefer it, falling
// back to the first few products if nothing is flagged featured.
const featuredProducts = computed(() => {
  const products = productsRes.value?.data ?? []
  const flagged = products.filter((p) => p.featured)
  return (flagged.length ? flagged : products).slice(0, 6)
})

const quickAccess = [
  { to: '/investments', image: '/images/orchard_app_icons/investment-elementor-io-optimized.webp', title: 'Investments' },
  { to: '/portfolio', image: '/images/orchard_app_icons/portfolio-elementor-io-optimized.webp', title: 'Portfolio' },
  { to: '/transactions', image: '/images/orchard_app_icons/transactions-elementor-io-optimized.webp', title: 'Transactions' },
  { to: '/settings', image: '/images/orchard_app_icons/help_support-elementor-io-optimized.webp', title: 'Help & Support' }
]

const addMoneyMode = ref<'bank' | 'paystack' | null>(null)
const sendMoneyOpen = ref(false)
const selectedTransaction = ref<Transaction | null>(null)
const storyViewerOpen = ref(false)
const storyStartIndex = ref(0)

const resultModal = ref<{ status: 'success' | 'error'; title: string; message: string; image?: string } | null>(null)

const GENERIC_FAILED_IMAGE = '/images/orchard_app_icons/failed-elementor-io-optimized.webp'

function onSendMoneyResult(status: 'success' | 'error', message: string) {
  resultModal.value = {
    status,
    title: status === 'success' ? 'Transfer Initiated' : 'Transfer Failed',
    message
  }
}

function onFundingResult(status: 'success' | 'error', message: string) {
  resultModal.value = {
    status,
    title: status === 'success' ? 'Transfer Confirmed' : 'Confirmation Failed',
    message,
    image: status === 'error' ? GENERIC_FAILED_IMAGE : undefined
  }
}

function openStory(index: number) {
  storyStartIndex.value = index
  storyViewerOpen.value = true
}

function openTransaction(transaction: Transaction) {
  selectedTransaction.value = transaction
}

</script>

<template>
  <div>
    <StoryRail v-if="banners.length" :banners="banners" class="mt-6" @open="openStory" />
    <h1 class="mt-4 oc-display text-2xl font-semibold text-[var(--oc-text-primary)]">
      Hello {{ greeting }}!
    </h1>

    <SkeletonPage v-if="loading" :count="4" class="mt-6" />

    <template v-else>
      <button
        v-if="needsKyc"
        type="button"
        class="mt-6 flex w-full items-center justify-between gap-3 rounded-lg bg-[var(--oc-status-warning-bg)] px-4 py-3 text-left transition-colors duration-fast ease-standard hover:bg-[var(--oc-status-warning-bg)]/80"
        @click="kycModalOpen = true"
      >
        <span class="text-sm font-semibold text-[var(--oc-status-warning-fg)]">
          Your identity verification is incomplete — tap to complete KYC
        </span>
        <RiArrowRightSLine class="h-5 w-5 shrink-0 text-[var(--oc-status-warning-fg)]" />
      </button>

      <div class="mt-6 grid gap-4 lg:grid-cols-2">
        <div class="rounded-lg bg-ink p-6 shadow-md">
          <p class="text-sm text-slate-300">Wallet Balance</p>
          <p class="oc-display mt-2 text-3xl font-semibold text-white">
            <AnimatedCurrency :value="wallet?.balance ?? 0" />
          </p>
          <div v-if="fundingAccount" class="mt-3 flex items-center gap-2 text-sm text-slate-300">
            <span>Account: {{ fundingAccount.bank_name }} {{ fundingAccount.account_number }}</span>
            <CopyButton :text="fundingAccount.account_number" label="Copy account number" />
          </div>
          <div class="mt-5 flex gap-3">
            <AddMoneyMenu
              @bank-transfer="addMoneyMode = 'bank'"
              @online-payment="addMoneyMode = 'paystack'"
            />
            <button
              type="button"
              class="rounded-pill border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-fast ease-standard hover:bg-white/10"
              @click="sendMoneyOpen = true"
            >
              Send Money
            </button>
          </div>
        </div>

        <div class="rounded-lg border border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] p-6 shadow-sm">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-sm text-[var(--oc-text-muted)]">Portfolio Overview</p>
              <p class="oc-display mt-2 text-3xl font-semibold text-[var(--oc-text-primary)]">
                <AnimatedCurrency :value="portfolioTotal" />
              </p>
            </div>
            <DonutChart v-if="chartSegments.length" :segments="chartSegments" :show-legend="false" class="shrink-0" />
          </div>
          <!-- <p class="mt-1 text-xs text-[var(--oc-text-faint)]">Legacy Balance <Currency value="0" /></p> -->
          <NuxtLink
            to="/portfolio"
            class="mt-5 inline-block rounded-pill bg-[var(--oc-action-secondary-bg)] px-5 py-2.5 text-sm font-semibold text-[var(--oc-action-secondary-fg)] transition-colors duration-fast ease-standard hover:bg-[var(--oc-action-secondary-bgHover)]"
          >
            View Portfolio
          </NuxtLink>
        </div>
      </div>

      <div class="mt-6 rounded-2xl bg-[var(--oc-bg-surface)] p-6 shadow-sm">
        <div class="grid grid-cols-4 gap-4">
          <NuxtLink
            v-for="item in quickAccess"
            :key="item.to"
            :to="item.to"
            class="flex flex-col items-center gap-3 text-center"
          >
            <span class="flex h-20 w-20 items-center justify-center rounded-2xl border border-[var(--oc-green-200)] sm:h-24 sm:w-24">
              <NuxtImg :src="item.image" :alt="item.title" width="64" height="64" loading="lazy" class="h-14 w-14 object-contain sm:h-16 sm:w-16" />
            </span>
            <span class="text-sm font-semibold text-[var(--oc-text-primary)]">{{ item.title }}</span>
          </NuxtLink>
        </div>
      </div>

      <div class="mt-8">
        <h2 class="oc-display text-lg font-semibold text-[var(--oc-text-primary)]">Featured Opportunities</h2>
        <div class="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ProductCard v-for="product in featuredProducts" :key="product.product_id" :product="product" />
          <p v-if="!featuredProducts.length" class="text-sm text-[var(--oc-text-muted)]">
            No products available right now.
          </p>
        </div>
      </div>

      <div class="mt-8">
        <h2 class="oc-display text-lg font-semibold text-[var(--oc-text-primary)]">Recent Transactions</h2>
        <div class="mt-3 rounded-lg border border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] p-2 shadow-sm">
          <TransactionRow
            v-for="transaction in recentTransactions"
            :key="transaction.uuid"
            :transaction="transaction"
            @select="openTransaction"
          />
          <p v-if="!recentTransactions.length" class="px-2 py-3 text-sm text-[var(--oc-text-muted)]">
            No transactions yet.
          </p>
        </div>
      </div>
    </template>

    <TransactionDetailsModal
      :open="!!selectedTransaction"
      :transaction="selectedTransaction"
      @update:open="(v) => !v && (selectedTransaction = null)"
    />
    <WalletFundingModal
      :open="addMoneyMode !== null"
      :account="fundingAccount"
      :email="user?.email ?? null"
      :balance="wallet?.balance ?? null"
      :initial-tab="addMoneyMode ?? 'bank'"
      @update:open="(v) => !v && (addMoneyMode = null)"
      @result="onFundingResult"
    />
    <SendMoneyModal
      v-model:open="sendMoneyOpen"
      :destination="withdrawalAccount"
      :wallet-id="wallet?.uuid ?? null"
      :balance="wallet?.balance ?? null"
      @result="onSendMoneyResult"
    />
    <StoryViewer v-model:open="storyViewerOpen" :banners="banners" :start-index="storyStartIndex" />
    <KycModal v-model:open="kycModalOpen" />
    <ResultModal
      v-if="resultModal"
      :open="!!resultModal"
      :status="resultModal.status"
      :title="resultModal.title"
      :message="resultModal.message"
      :image="resultModal.image"
      @update:open="(v) => !v && (resultModal = null)"
    />
  </div>
</template>
