<script setup lang="ts">
import type { UserProfile } from '~/types/api'

const props = defineProps<{ user: UserProfile | null | undefined }>()

const avatarSrc = computed(
  () => resolveApiImage(props.user?.profile?.profile_photo) ?? '/images/orchard_app_icons/profile-elementor-io-optimized.webp'
)
const fullName = computed(() => {
  const p = props.user?.profile
  return [p?.firstname, p?.lastname].filter(Boolean).join(' ') || 'Account'
})
const username = computed(() => props.user?.profile?.username)
</script>

<template>
  <div class="flex flex-col items-center gap-3 rounded-lg border border-[var(--oc-border-default)] bg-[var(--oc-bg-surface)] px-5 py-8 text-center shadow-sm">
    <span class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--oc-bg-muted)]">
      <NuxtImg :src="avatarSrc" width="80" height="80" alt="" class="h-full w-full object-cover" />
    </span>
    <div>
      <p class="text-lg font-semibold text-[var(--oc-text-primary)]">{{ fullName }}</p>
      <p v-if="username" class="text-sm text-[var(--oc-text-muted)]">@{{ username }}</p>
    </div>
  </div>
</template>
