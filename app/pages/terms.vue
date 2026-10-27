<script setup lang="ts">
import { RiArrowLeftLine } from '@remixicon/vue'

// No layout: this page must render for logged-out visitors too (linked from the signup
// form, before any session exists) — the default layout's sidebar/topbar assume an
// authenticated user, and the auth layout's photo carousel doesn't fit a plain text page.
definePageMeta({ layout: false })
usePageSeo('Terms & Conditions', "Orchard's terms of service and investment terms.")
</script>

<template>
  <div class="mx-auto max-w-4xl px-6 py-12">
    <NuxtLink to="/" class="inline-flex items-center gap-1 text-sm font-semibold text-[var(--oc-text-link)]">
      <RiArrowLeftLine class="h-4 w-4" /> Back
    </NuxtLink>

    <h1 class="oc-display mt-4 text-2xl font-semibold text-[var(--oc-text-primary)]">Terms & Conditions</h1>

    <LegalDocumentView title="Terms" />
  </div>
</template>
