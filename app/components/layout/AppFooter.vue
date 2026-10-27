<script setup lang="ts">
const year = new Date().getFullYear()

const links = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms', to: '/terms' }
]
</script>

<template>
  <footer class="border-t border-[var(--oc-border-default)] px-6 py-6 sm:px-6 lg:px-8">
    <div class="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 text-sm text-[var(--oc-text-muted)] sm:flex-row">
      <p>© {{ year }} Crowdital Limited. All rights reserved.</p>
      <nav class="flex items-center gap-4">
        <NuxtLink
          v-for="link in links"
          :key="link.label"
          :to="link.to"
          class="font-medium text-[var(--oc-text-secondary)] transition-colors duration-fast ease-standard hover:text-[var(--oc-text-primary)]"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
    </div>
  </footer>
</template>
