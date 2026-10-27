<script setup lang="ts">
const props = defineProps<{ value: number | string }>()

function toNumber(value: number | string): number {
  const cleaned = typeof value === 'string' ? value.replace(/,/g, '') : value
  return Number(cleaned) || 0
}

// Initialized directly from the incoming value so there's no animation on first mount —
// only later changes (e.g. a post-transaction refetch) tween, covering both a balance
// going up (funding) and down (invest/withdraw) with the same ease-out curve.
const display = ref(toNumber(props.value))
let frame: number | null = null

watch(
  () => props.value,
  (next) => {
    const from = display.value
    const to = toNumber(next)
    if (from === to) return
    if (frame != null) cancelAnimationFrame(frame)
    const duration = 800
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - (1 - t) ** 3
      display.value = from + (to - from) * eased
      frame = t < 1 ? requestAnimationFrame(tick) : null
    }
    frame = requestAnimationFrame(tick)
  }
)

onUnmounted(() => {
  if (frame != null) cancelAnimationFrame(frame)
})
</script>

<template>
  <span class="oc-tnum">{{ formatNaira(display) }}</span>
</template>
