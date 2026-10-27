<script setup lang="ts">
const modelValue = defineModel<string>({ default: '' })
const props = withDefaults(defineProps<{ length?: number; masked?: boolean; invalid?: boolean }>(), {
  length: 6,
  masked: false,
  invalid: false
})

const digits = computed(() => {
  const chars = modelValue.value.split('')
  return Array.from({ length: props.length }, (_, i) => chars[i] ?? '')
})

const inputs = ref<HTMLInputElement[]>([])

function setDigit(index: number, value: string) {
  const clean = value.replace(/\D/g, '').slice(-1)
  const chars = digits.value.slice()
  chars[index] = clean
  modelValue.value = chars.join('').replace(/\s+$/, '')
  if (clean && index < props.length - 1) {
    inputs.value[index + 1]?.focus()
  }
}

function onKeydown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace' && !digits.value[index] && index > 0) {
    inputs.value[index - 1]?.focus()
  }
}

// Without this, pasting a code copied from an email/SMS lands in whichever single box has
// focus and gets truncated to its last character by setDigit's maxlength-1 handling —
// split the clipboard text across all boxes instead.
function onPaste(event: ClipboardEvent) {
  const text = event.clipboardData?.getData('text') ?? ''
  const clean = text.replace(/\D/g, '').slice(0, props.length)
  if (!clean) return
  event.preventDefault()
  modelValue.value = clean
  nextTick(() => {
    const focusIndex = Math.min(clean.length, props.length - 1)
    inputs.value[focusIndex]?.focus()
  })
}
</script>

<template>
  <div class="flex gap-2">
    <input
      v-for="(digit, index) in digits"
      :key="index"
      ref="inputs"
      :value="digit"
      :type="masked ? 'password' : 'text'"
      inputmode="numeric"
      pattern="[0-9]*"
      autocomplete="off"
      maxlength="1"
      :aria-invalid="invalid"
      class="h-11 w-10 rounded-md border bg-[var(--oc-bg-surface)] text-center text-lg font-semibold text-[var(--oc-text-primary)] outline-none focus:ring-2"
      :class="
        invalid
          ? 'border-[var(--oc-status-danger-solid)] focus:border-[var(--oc-status-danger-solid)] focus:ring-[var(--oc-status-danger-solid)]/30'
          : 'border-[var(--oc-border-strong)] focus:border-[var(--oc-border-focus)] focus:ring-[var(--oc-focus-ring)]'
      "
      @input="setDigit(index, ($event.target as HTMLInputElement).value)"
      @keydown="onKeydown(index, $event)"
      @paste="onPaste"
    >
  </div>
</template>
