<script setup lang="ts">
import { RiCloseLine } from '@remixicon/vue'

const open = defineModel<boolean>('open', { default: false })
withDefaults(defineProps<{ title?: string }>(), { title: '' })

function close() {
  open.value = false
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value) close()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-base ease-standard"
      leave-active-class="transition-opacity duration-base ease-standard"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-ink/50" @click="close" />

        <Transition
          appear
          enter-active-class="transition-all duration-base ease-standard"
          leave-active-class="transition-all duration-fast ease-standard"
          enter-from-class="opacity-0 scale-95"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            class="relative w-full max-w-md rounded-lg bg-[var(--oc-bg-surface)] shadow-lg"
            role="dialog"
            aria-modal="true"
          >
            <div class="flex items-center justify-between border-b border-[var(--oc-border-default)] px-5 py-4">
              <h2 class="oc-display text-lg font-semibold text-[var(--oc-text-primary)]">
                <slot name="header">{{ title }}</slot>
              </h2>
              <button
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-full text-[var(--oc-text-muted)] transition-colors duration-fast ease-standard hover:bg-[var(--oc-bg-subtle)] hover:text-[var(--oc-text-primary)]"
                aria-label="Close"
                @click="close"
              >
                <RiCloseLine class="h-5 w-5" />
              </button>
            </div>

            <div class="px-5 py-4">
              <slot />
            </div>

            <div v-if="$slots.footer" class="border-t border-[var(--oc-border-default)] px-5 py-4">
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
