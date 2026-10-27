<script setup lang="ts">
import { RiArrowDownSLine, RiLogoutBoxLine, RiSettings3Line, RiUserLine } from '@remixicon/vue'

const authStore = useAuthStore()
const api = useApi()
const open = ref(false)
const rootEl = ref<HTMLElement | null>(null)

const firstName = computed(() => authStore.user?.profile?.firstname ?? 'Account')
const avatarSrc = computed(
  () => resolveApiImage(authStore.user?.profile?.profile_photo) ?? '/images/orchard_app_icons/profile-elementor-io-optimized.webp'
)

function toggle() {
  open.value = !open.value
}

function onClickOutside(event: MouseEvent) {
  if (rootEl.value && !rootEl.value.contains(event.target as Node)) {
    open.value = false
  }
}

async function logout() {
  // POST /users/auth/logout?all=true — confirmed via the Postman collection, 2026-09-08;
  // previously this only cleared local state and never told the backend, so the token
  // stayed valid server-side after a "logout". Clear local state regardless of whether
  // this call succeeds, so a network hiccup never traps the user in a logged-in-looking UI.
  try {
    await api('/users/auth/logout', { method: 'POST', query: { all: true } })
  } catch {
    // ignore — local logout still proceeds below
  }
  authStore.logout()
  open.value = false
  await navigateTo('/login')
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <div ref="rootEl" class="relative">
    <button
      type="button"
      class="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition-colors duration-fast ease-standard hover:bg-[var(--oc-bg-subtle)]"
      @click="toggle"
    >
      <span
        class="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--oc-bg-muted)] text-[var(--oc-text-secondary)]"
      >
        <img :src="avatarSrc" alt="" class="h-full w-full object-cover">
      </span>
      <span class="text-sm font-medium text-[var(--oc-text-primary)]">{{ firstName }}</span>
      <RiArrowDownSLine class="h-4 w-4 text-[var(--oc-text-muted)]" />
    </button>

    <Transition
      enter-active-class="transition-all duration-fast ease-standard"
      leave-active-class="transition-all duration-fast ease-standard"
      enter-from-class="opacity-0 scale-95"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="open"
        class="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-md border border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] shadow-md"
      >
        <NuxtLink
          to="/profile"
          class="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--oc-text-secondary)] hover:bg-[var(--oc-bg-subtle)] hover:text-[var(--oc-text-primary)]"
          @click="open = false"
        >
          <RiUserLine class="h-4 w-4" /> Profile
        </NuxtLink>
        <NuxtLink
          to="/settings"
          class="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--oc-text-secondary)] hover:bg-[var(--oc-bg-subtle)] hover:text-[var(--oc-text-primary)]"
          @click="open = false"
        >
          <RiSettings3Line class="h-4 w-4" /> Settings
        </NuxtLink>
        <button
          type="button"
          class="flex w-full items-center gap-2 border-t border-[var(--oc-border-default)] px-4 py-2.5 text-sm text-[var(--oc-status-danger-fg)] hover:bg-[var(--oc-status-danger-bg)]"
          @click="logout"
        >
          <RiLogoutBoxLine class="h-4 w-4" /> Logout
        </button>
      </div>
    </Transition>
  </div>
</template>
