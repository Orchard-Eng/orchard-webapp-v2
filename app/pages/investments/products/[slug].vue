<script setup lang="ts">
import { RiArrowLeftLine, RiCalendarLine, RiPercentLine, RiSafeLine } from '@remixicon/vue'
import type { ApiEnvelope, InvestOrderResponse, InvestmentProduct } from '~/types/api'

const route = useRoute()
const api = useApi()

// GET /users/investments/products/:slug wraps its single result in a one-item array
// (confirmed live, 2026-08-19), not a bare object as the endpoint's own product-list
// shape would suggest — take the first (only) element. Keyed by slug now, not product_id
// (confirmed via the Postman collection) — product_id stays the real join key for the
// invest order submission below and the portfolio holdings join, unaffected by this.
// lazy: mounts immediately with pending=true instead of Suspense withholding the whole
// page during client-side navigation (see SkeletonPage below).
const { data: productRes, pending } = useLazyAsyncData(`product-${route.params.slug}`, () =>
  api<ApiEnvelope<InvestmentProduct[]>>(`/users/investments/products/${route.params.slug}`)
)

const product = computed(() => productRes.value?.data?.[0])
usePageSeo(
  () => product.value?.product_name ?? 'Investment Product',
  () => `Invest in ${product.value?.product_name ?? 'this product'} on Orchard.`
)

const descriptionOpen = ref(true)
const noteOpen = ref(false)

const minimumInvestment = computed(() => Number(product.value?.min_amount ?? 10000))
// The tenor in days from the moment of investment (confirmed real field, min_tenure) is a
// more accurate "Days to Maturity" than diffing against the product's own maturity_date,
// which shifts as new investment windows open and doesn't represent any one investor's
// actual holding period.
const daysToMaturity = computed(() => product.value?.min_tenure ?? null)

const amount = ref('')
const amountNumber = computed(() => Number(amount.value) || 0)
const amountValid = computed(() => amountNumber.value >= minimumInvestment.value)

// Real fee/tax fields confirmed live, 2026-08-19 (tax/tr_fee/tr_fee_cap on the product
// itself) — no longer a placeholder. Transaction Fee is a percentage of principal capped
// at tr_fee_cap; Tax is withholding tax applied to the interest earned (the standard
// convention for Nigerian fixed-income yield), not the principal. This is a reasonable
// assembly of real inputs, not fabricated numbers, but the exact formula wasn't
// independently confirmed against a real order — verify against ORDER confirmation
// before treating this as authoritative for compliance purposes (plandocs/ORCHARD_HANDOFF.md §3.6).
const transactionFee = computed(() => {
  if (!product.value) return null
  const rate = Number(product.value.tr_fee) / 100
  const cap = Number(product.value.tr_fee_cap)
  return Math.min(amountNumber.value * rate, cap)
})
const totalToDeduct = computed(() => {
  if (transactionFee.value == null) return null
  return amountNumber.value + transactionFee.value
})
const grossInterestPayout = computed(() => {
  if (!product.value || daysToMaturity.value == null) return null
  const rate = Number(product.value.interest) / 100
  return amountNumber.value * rate * (daysToMaturity.value / 365)
})
const taxAmount = computed(() => {
  if (!product.value || grossInterestPayout.value == null) return null
  return grossInterestPayout.value * (Number(product.value.tax) / 100)
})
const dailyEarnings = computed(() => {
  if (grossInterestPayout.value == null || !daysToMaturity.value) return null
  return grossInterestPayout.value / daysToMaturity.value
})
const netInterestPayout = computed(() => {
  if (grossInterestPayout.value == null || taxAmount.value == null) return null
  return grossInterestPayout.value - taxAmount.value
})
const estimatedPayout = computed(() => {
  if (netInterestPayout.value == null) return null
  return amountNumber.value + netInterestPayout.value
})

const termsAccepted = ref(false)
const canSubmit = computed(() => amountValid.value && termsAccepted.value)

const pinModalOpen = ref(false)
const pinError = ref<string | null>(null)
const submitAction = useAsyncAction()
const resultModal = ref<{ status: 'success' | 'error'; title: string; message: string } | null>(null)

// POST /users/investments/order/invest now requires the transaction pin inline (confirmed
// via the Postman collection, 2026-09-08) — a wrong pin surfaces on the pin modal itself
// (kept open for retry) rather than the after-the-fact result modal.
async function submit(pin: string) {
  if (!product.value || !canSubmit.value) return
  pinError.value = null
  await submitAction.run(() =>
    api<ApiEnvelope<InvestOrderResponse>>('/users/investments/order/invest', {
      method: 'POST',
      body: { product_id: product.value!.product_id, quantity: 1, price: amountNumber.value, pin }
    })
  )
  if (submitAction.state.value === 'success') {
    pinModalOpen.value = false
    await Promise.all([refreshNuxtData('dashboard'), refreshNuxtData('portfolio-summary')])
    resultModal.value = {
      status: 'success',
      title: 'Investment Successful',
      message: `Your investment of ${formatNaira(amountNumber.value)} in ${product.value.product_name} has been placed.`
    }
  } else {
    pinError.value = getApiErrorMessage(submitAction.error.value, 'We could not place this investment. Please try again.')
  }
}

function dismissResult() {
  const wasSuccess = resultModal.value?.status === 'success'
  resultModal.value = null
  if (wasSuccess) navigateTo('/portfolio')
}
</script>

<template>
  <div>
    <NuxtLink to="/investments" class="inline-flex items-center gap-1 text-sm font-semibold text-[var(--oc-text-link)]">
      <RiArrowLeftLine class="h-4 w-4" /> Back
    </NuxtLink>

    <SkeletonPage v-if="pending" :count="2" class="mt-6" />

    <template v-else-if="product">
      <div class="mt-4 flex items-center gap-3">
        <span class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[var(--oc-bg-subtle)] text-[var(--oc-text-secondary)]">
          <ApiImage
            :src="resolveApiImage(product.product_image)"
            :alt="product.product_name"
            :fallback-icon="RiSafeLine"
            icon-class="h-6 w-6"
          />
        </span>
        <div>
          <h1 class="oc-display text-xl font-semibold text-[var(--oc-text-primary)]">{{ product.product_name }}</h1>
          <p v-if="product.partner?.name" class="text-sm text-[var(--oc-text-muted)]">{{ product.partner.name }}</p>
        </div>
      </div>

      <div class="mt-6 grid gap-6 lg:grid-cols-2">
        <div class="min-w-0 rounded-lg border border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] p-5 shadow-sm">
          <Accordion v-model:open="descriptionOpen" title="Description">
            <SafeHtml class="oc-prose" :html="product.description" />
          </Accordion>
          <Accordion v-model:open="noteOpen" title="Investment Note">
            <SafeHtml v-if="product.investment_note" class="oc-prose" :html="product.investment_note" />
            <p v-else class="text-[var(--oc-text-faint)]">No additional notes for this product.</p>
          </Accordion>
        </div>

        <div class="space-y-5 rounded-lg border border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] p-5 shadow-sm">
          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-lg bg-[var(--oc-status-success-bg)] p-3">
              <span class="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--oc-status-success-fg)]">
                <RiPercentLine class="h-4 w-4" /> Interest Rate
                <InfoTip text="This is a per annum (yearly) rate. Your actual interest is prorated for the number of days you're invested, shown as Days to Maturity." />
              </span>
              <p class="oc-tnum mt-1 text-lg font-semibold text-[var(--oc-status-success-fg)]">
                {{ product.interest ? `${Number(product.interest)}%` : '—' }}
              </p>
            </div>
            <div class="rounded-lg bg-[var(--oc-accent-subtle)] p-3">
              <span class="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--oc-accent-subtleFg)]">
                <RiCalendarLine class="h-4 w-4" /> Maturity Date
              </span>
              <p class="mt-1 text-lg font-semibold text-[var(--oc-accent-subtleFg)]">{{ formatDate(product.maturity_date) }}</p>
            </div>
          </div>

          <div class="space-y-3 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-[var(--oc-text-muted)]">Available Volume</span>
              <span class="oc-tnum font-semibold text-[var(--oc-text-primary)]">
                <Currency v-if="product.available_volume != null" :value="product.available_volume" />
                <template v-else>—</template>
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="inline-flex items-center gap-1 text-[var(--oc-text-muted)]">
                Days to Maturity
                <InfoTip text="How many days your money is locked in for, starting from the day you invest. It can't be withdrawn early. This is also the number of days your interest is prorated over." />
              </span>
              <span class="oc-tnum font-semibold text-[var(--oc-text-primary)]">{{ daysToMaturity ?? '—' }}</span>
            </div>
          </div>

          <label class="block">
            <span class="mb-1 block text-sm font-semibold text-[var(--oc-text-primary)]">
              How much would you like to invest?
            </span>
            <input
              v-model="amount"
              type="number"
              min="0"
              placeholder="0.00"
              class="oc-tnum w-full rounded-md border border-[var(--oc-border-strong)] bg-[var(--oc-bg-surface)] px-3 py-2.5 text-sm text-[var(--oc-text-primary)] outline-none focus:border-[var(--oc-border-focus)] focus:ring-2 focus:ring-[var(--oc-focus-ring)]"
            >
            <span class="mt-1 block text-xs text-[var(--oc-text-faint)]">
              Minimum of <Currency :value="minimumInvestment" />
            </span>
          </label>

          <div v-if="amountNumber > 0" class="space-y-2 rounded-lg bg-[var(--oc-bg-subtle)] p-4 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-[var(--oc-text-muted)]">Principal</span>
              <span class="oc-tnum font-medium text-[var(--oc-text-primary)]"><Currency :value="amountNumber" /></span>
            </div>
            <div class="flex items-center justify-between">
              <span class="inline-flex items-center gap-1 text-[var(--oc-text-muted)]">
                Transaction Fee
                <InfoTip text="A one-off fee taken from your wallet when you invest, capped at a fixed maximum no matter how large your investment is." />
              </span>
              <span class="oc-tnum font-medium text-[var(--oc-text-primary)]">
                <Currency v-if="transactionFee != null" :value="transactionFee" />
                <template v-else>—</template>
              </span>
            </div>
            <div class="flex items-center justify-between border-t border-[var(--oc-border-default)] pt-2">
              <span class="inline-flex items-center gap-1 font-semibold text-[var(--oc-text-primary)]">
                Total to Deduct
                <InfoTip text="What comes out of your wallet right now: your investment amount plus the one-off transaction fee." />
              </span>
              <span class="oc-tnum font-semibold text-[var(--oc-text-primary)]">
                <Currency v-if="totalToDeduct != null" :value="totalToDeduct" />
                <template v-else>—</template>
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[var(--oc-text-muted)]">Daily Earnings</span>
              <span class="oc-tnum font-medium text-[var(--oc-text-primary)]">
                <Currency v-if="dailyEarnings != null" :value="dailyEarnings" />
                <template v-else>—</template>
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="inline-flex items-center gap-1 text-[var(--oc-text-muted)]">
                Interest Payout
                <InfoTip text="The interest you'll actually receive at maturity, after tax has been deducted." />
              </span>
              <span class="oc-tnum font-medium text-[var(--oc-text-primary)]">
                <Currency v-if="netInterestPayout != null" :value="netInterestPayout" />
                <template v-else>—</template>
              </span>
            </div>
            <div class="flex items-center justify-between border-t border-[var(--oc-border-default)] pt-2">
              <span class="inline-flex items-center gap-1 font-semibold text-[var(--oc-text-primary)]">
                Estimated Payout
                <InfoTip text="Your principal plus interest (after tax), if you hold this investment to its maturity date." />
              </span>
              <span class="oc-tnum font-semibold text-[var(--oc-status-success-fg)]">
                <Currency v-if="estimatedPayout != null" :value="estimatedPayout" />
                <template v-else>—</template>
              </span>
            </div>
          </div>

          <label class="flex items-center gap-3">
            <Toggle v-model="termsAccepted" />
            <span class="text-sm text-[var(--oc-text-secondary)]">
              I have read, understood and agreed to the
              <NuxtLink to="/terms" target="_blank" class="font-semibold text-[var(--oc-text-link)]">Investment Terms</NuxtLink>
            </span>
          </label>

          <ActionButton
            :state="submitAction.state.value"
            label="Continue"
            :disabled="!canSubmit"
            class="w-full"
            @click="pinModalOpen = true"
          />
        </div>
      </div>
    </template>

    <PinConfirmModal
      v-model:open="pinModalOpen"
      title="Confirm Investment"
      description="Enter your transaction PIN to place this investment."
      :pending="submitAction.state.value === 'pending'"
      :error-message="pinError"
      @confirm="submit"
    />

    <ResultModal
      v-if="resultModal"
      :open="!!resultModal"
      :status="resultModal.status"
      :title="resultModal.title"
      :message="resultModal.message"
      @update:open="(v) => !v && dismissResult()"
    />
  </div>
</template>
