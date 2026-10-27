<script setup lang="ts">
const props = defineProps<{ html: string | null | undefined }>()
const safe = computed(() => sanitizeHtml(props.html))
</script>

<template>
  <div v-html="safe" />
</template>
