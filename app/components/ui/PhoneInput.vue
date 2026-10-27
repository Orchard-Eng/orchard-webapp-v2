<script setup lang="ts">
// Hardcoded rather than fetched from GET /users/onboard/countries — that endpoint has never
// been observed live (its saved Postman example response is empty), so its field names/shape
// are unknown. This app is Nigeria-first (NGN, Nigerian banks, BVN/NIN verification), hence
// Nigeria as the default/first option.
const DEFAULT_COUNTRY = { name: 'Nigeria', flag: '🇳🇬', dialCode: '234' }
const COUNTRIES = [
  DEFAULT_COUNTRY,
  { name: 'Ghana', flag: '🇬🇭', dialCode: '233' },
  { name: 'Kenya', flag: '🇰🇪', dialCode: '254' },
  { name: 'South Africa', flag: '🇿🇦', dialCode: '27' },
  { name: 'United Kingdom', flag: '🇬🇧', dialCode: '44' },
  { name: 'United States', flag: '🇺🇸', dialCode: '1' }
]

const model = defineModel<string>({ default: '' })

function splitInitialValue(value: string) {
  const match = COUNTRIES.find((c) => value.startsWith(c.dialCode))
  if (match) return { dialCode: match.dialCode, localNumber: value.slice(match.dialCode.length) }
  return { dialCode: DEFAULT_COUNTRY.dialCode, localNumber: value.replace(/^0+/, '') }
}

const initial = splitInitialValue(model.value)
const dialCode = ref(initial.dialCode)
const localNumber = ref(initial.localNumber)

watch([dialCode, localNumber], () => {
  model.value = dialCode.value + localNumber.value.replace(/\D/g, '')
})
</script>

<template>
  <div class="flex gap-2">
    <select
      v-model="dialCode"
      aria-label="Country code"
      class="rounded-md border border-[var(--oc-border-strong)] bg-[var(--oc-bg-surface)] px-2 text-sm text-[var(--oc-text-primary)] outline-none focus:border-[var(--oc-border-focus)] focus:ring-2 focus:ring-[var(--oc-focus-ring)]"
    >
      <option v-for="country in COUNTRIES" :key="country.dialCode" :value="country.dialCode">
        {{ country.flag }} +{{ country.dialCode }}
      </option>
    </select>
    <input
      v-model="localNumber"
      type="tel"
      inputmode="numeric"
      placeholder="8012345678"
      class="w-full rounded-md border border-[var(--oc-border-strong)] bg-[var(--oc-bg-surface)] px-3 py-2.5 text-sm text-[var(--oc-text-primary)] outline-none focus:border-[var(--oc-border-focus)] focus:ring-2 focus:ring-[var(--oc-focus-ring)]"
    >
  </div>
</template>
