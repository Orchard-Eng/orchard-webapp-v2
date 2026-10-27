<script setup lang="ts">
const colorMode = useColorMode()

withDefaults(defineProps<{ collapsed?: boolean }>(), { collapsed: false })
</script>

<template>
  <NuxtLink to="/dashboard" class="flex items-center shrink-0" :class="collapsed ? '' : 'gap-2'">
    <img v-if="collapsed" src="/images/icon.svg" alt="Orchard" class="h-8 w-8 shrink-0">
    <img
      v-else
      :src="colorMode.value === 'dark' ? '/images/logo_white.svg' : '/images/logo.svg'"
      alt="Orchard"
      class="h-7 w-auto shrink-0"
    >
  </NuxtLink>
</template>
