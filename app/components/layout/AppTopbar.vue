<script setup lang="ts">
import { RiGridLine, RiMenuLine } from '@remixicon/vue'

const ui = useUiStore()

function onToggleClick() {
  if (window.innerWidth < 1024) {
    ui.openMobileNav()
  } else {
    ui.toggleSidebarCollapsed()
  }
}
</script>

<template>
  <header
    class="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] px-4"
  >
    <button
      type="button"
      class="flex h-9 w-9 items-center justify-center rounded-md text-[var(--oc-text-secondary)] transition-colors duration-fast ease-standard hover:bg-[var(--oc-bg-subtle)]"
      aria-label="Toggle navigation"
      @click="onToggleClick"
    >
      <RiMenuLine class="h-5 w-5 lg:hidden" />
      <RiGridLine class="hidden h-5 w-5 lg:block" />
    </button>

    <div class="flex items-center gap-3">
      <ThemeToggle />
      <UserMenu />
    </div>
  </header>
</template>
