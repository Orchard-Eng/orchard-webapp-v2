<script setup lang="ts">
const props = defineProps<{ error: { statusCode: number; statusMessage?: string } }>()
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center gap-3 bg-[var(--oc-bg-canvas)] px-4 text-center">
    <p class="oc-display text-4xl font-semibold text-[var(--oc-text-primary)]">
      {{ props.error.statusCode }}
    </p>
    <p class="text-sm text-[var(--oc-text-muted)]">
      {{ props.error.statusMessage || 'Something went wrong.' }}
    </p>
    <NuxtLink to="/dashboard" class="mt-2 text-sm font-semibold text-[var(--oc-text-link)]">
      Back to dashboard
    </NuxtLink>
  </div>
</template>
