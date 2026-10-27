<script setup lang="ts">
import type { Component } from 'vue'

const props = withDefaults(
  defineProps<{
    src: string | null | undefined
    alt: string
    fallbackIcon: Component
    iconClass?: string
  }>(),
  { iconClass: 'h-5 w-5' }
)

const errored = ref(false)
watch(
  () => props.src,
  () => {
    errored.value = false
  }
)

const showImage = computed(() => !!props.src && !errored.value)
</script>

<template>
  <img
    v-if="showImage"
    :src="src!"
    :alt="alt"
    class="h-full w-full rounded-md object-cover"
    @error="errored = true"
  >
  <component :is="fallbackIcon" v-else :class="iconClass" />
</template>
