<script setup lang="ts">
import { RiArrowRightLine, RiCompassLine } from '@remixicon/vue'
import type { ApiEnvelope, InvestmentType } from '~/types/api'

usePageSeo('Opportunities', 'Explore investment categories and opportunities on Orchard.')

const api = useApi()

const { data: typesRes, pending } = useLazyAsyncData('investment-types', () =>
  api<ApiEnvelope<InvestmentType[]>>('/users/investments/types')
)

const types = computed(() => typesRes.value?.data ?? [])
</script>

<template>
  <div>
    <h1 class="oc-display text-2xl font-semibold text-[var(--oc-text-primary)]">Opportunities</h1>

    <SkeletonPage v-if="pending" :count="3" class="mt-6" />

    <div v-else class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="type in types"
        :key="type.uuid"
        :to="`/investments/types/${type.uuid}`"
        class="flex flex-col gap-3 rounded-lg border border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] p-5 shadow-sm transition-shadow duration-fast ease-standard hover:shadow-md"
      >
        <div class="flex items-center justify-between">
          <span class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md bg-[var(--oc-bg-subtle)] text-[var(--oc-text-brand)]">
            <ApiImage :src="resolveApiImage(type.product_type_image)" :alt="type.name" :fallback-icon="RiCompassLine" />
          </span>
          <span
            v-if="type.risk_category?.name"
            class="rounded-pill px-2.5 py-1 text-xs font-semibold"
            :style="{ color: type.risk_category.colour_code, backgroundColor: `${type.risk_category.colour_code}1a` }"
          >
            {{ type.risk_category.name }}
          </span>
        </div>

        <h2 class="oc-display text-lg font-semibold text-[var(--oc-text-primary)]">{{ type.name }}</h2>
        <SafeHtml
          class="line-clamp-2 min-w-0 break-words text-sm text-[var(--oc-text-muted)] [overflow-wrap:anywhere]"
          :html="type.description"
        />

        <span class="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-[var(--oc-text-link)]">
          See what's available <RiArrowRightLine class="h-4 w-4" />
        </span>
      </NuxtLink>

      <div v-if="!types.length" class="col-span-full flex flex-col items-center gap-3 py-10 text-center">
        <NuxtImg src="/images/orchard_app_icons/empty_state_investments-elementor-io-optimized.webp" width="128" height="128" loading="lazy" alt="" class="h-32 w-32 object-contain" />
        <p class="text-sm text-[var(--oc-text-muted)]">No opportunity categories available right now.</p>
      </div>
    </div>
  </div>
</template>
