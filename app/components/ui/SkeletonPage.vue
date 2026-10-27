<script setup lang="ts">
withDefaults(defineProps<{ count?: number }>(), { count: 5 })
</script>

<template>
  <div class="space-y-4">
    <SkeletonCard v-for="i in count" :key="i" />
  </div>
</template>
