<script setup lang="ts">
const props = withDefaults(
  defineProps<{ segments: { label: string; value: number; color: string }[]; showLegend?: boolean }>(),
  { showLegend: true }
)

const total = computed(() => props.segments.reduce((sum, s) => sum + s.value, 0) || 1)

const circumference = 2 * Math.PI * 40

const arcs = computed(() => {
  let offset = 0
  return props.segments.map((segment) => {
    const fraction = segment.value / total.value
    const length = fraction * circumference
    const arc = { ...segment, dasharray: `${length} ${circumference - length}`, dashoffset: -offset }
    offset += length
    return arc
  })
})

const containerRef = ref<HTMLElement | null>(null)
const hovered = ref<{ label: string; percent: number } | null>(null)
const tooltipPos = ref({ x: 0, y: 0 })

function onSegmentMove(event: MouseEvent, segment: { label: string; value: number }) {
  hovered.value = { label: segment.label, percent: Math.round((segment.value / total.value) * 100) }
  const rect = containerRef.value?.getBoundingClientRect()
  if (rect) tooltipPos.value = { x: event.clientX - rect.left, y: event.clientY - rect.top }
}

function onSegmentLeave() {
  hovered.value = null
}
</script>

<template>
  <div class="flex items-center gap-4">
    <div ref="containerRef" class="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 100 100" class="h-24 w-24 -rotate-90">
        <circle cx="50" cy="50" r="40" fill="none" stroke="var(--oc-bg-muted)" stroke-width="14" />
        <circle
          v-for="arc in arcs"
          :key="arc.label"
          cx="50"
          cy="50"
          r="40"
          fill="none"
          :stroke="arc.color"
          stroke-width="14"
          :stroke-dasharray="arc.dasharray"
          :stroke-dashoffset="arc.dashoffset"
          class="cursor-pointer transition-opacity duration-fast ease-standard hover:opacity-70"
          @mousemove="onSegmentMove($event, arc)"
          @mouseleave="onSegmentLeave"
        >
          <title>{{ arc.label }}: {{ formatNaira(arc.value) }} ({{ Math.round((arc.value / total) * 100) }}%)</title>
        </circle>
      </svg>

      <div
        v-if="hovered"
        class="oc-tnum pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs font-medium text-white shadow-md"
        :style="{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y - 8}px` }"
      >
        {{ hovered.label }} — {{ hovered.percent }}%
      </div>
    </div>

    <ul v-if="showLegend" class="space-y-1.5">
      <li v-for="segment in segments" :key="segment.label" class="flex items-center gap-2 text-xs text-[var(--oc-text-secondary)]">
        <span class="h-2.5 w-2.5 shrink-0 rounded-full" :style="{ backgroundColor: segment.color }" />
        {{ segment.label }}
      </li>
    </ul>
  </div>
</template>
