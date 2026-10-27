<script setup lang="ts">
import {
  RiCompassLine,
  RiDashboardLine,
  RiExchangeLine,
  RiLineChartLine,
  RiPieChartLine,
  RiUserAddLine
} from '@remixicon/vue'

const ui = useUiStore()

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: RiDashboardLine },
  { label: 'Invest', to: '/investments', icon: RiLineChartLine },
  { label: 'Opportunities', to: '/opportunities', icon: RiCompassLine },
  { label: 'Portfolio', to: '/portfolio', icon: RiPieChartLine },
  { label: 'Transactions', to: '/transactions', icon: RiExchangeLine },
  { label: 'Referral', to: '/referral', icon: RiUserAddLine }
]
</script>

<template>
  <!-- mobile backdrop -->
  <Transition
    enter-active-class="transition-opacity duration-base ease-standard"
    leave-active-class="transition-opacity duration-base ease-standard"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div
      v-if="ui.mobileNavOpen"
      class="fixed inset-0 z-40 bg-ink/40 lg:hidden"
      @click="ui.closeMobileNav()"
    />
  </Transition>

  <aside
    class="fixed inset-y-0 left-0 z-50 flex min-h-screen flex-col border-r border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] transition-transform duration-base ease-standard lg:sticky lg:top-0 lg:translate-x-0"
    :class="[
      ui.sidebarCollapsed ? 'lg:w-20' : 'lg:w-64',
      'w-64',
      ui.mobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    ]"
  >
    <div class="flex h-16 shrink-0 items-center px-4">
      <AppLogo :collapsed="ui.sidebarCollapsed" />
    </div>

    <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-6">
      <p
        v-if="!ui.sidebarCollapsed"
        class="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-[var(--oc-text-faint)]"
      >
        General
      </p>
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-4 rounded-md px-3 py-4 text-sm font-medium text-[var(--oc-text-secondary)] transition-colors duration-fast ease-standard hover:bg-[var(--oc-bg-subtle)] hover:text-[var(--oc-text-primary)]"
        active-class="bg-[var(--oc-bg-subtle)] text-[var(--oc-text-primary)]"
        @click="ui.closeMobileNav()"
      >
        <component :is="item.icon" class="h-5 w-5 shrink-0" />
        <span v-if="!ui.sidebarCollapsed">{{ item.label }}</span>
      </NuxtLink>
    </nav>
  </aside>
</template>
