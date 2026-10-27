<script setup lang="ts">
const props = defineProps<{ value: number | string }>()
</script>

<template>
  <span class="oc-tnum">{{ formatNaira(props.value) }}</span>
</template>
