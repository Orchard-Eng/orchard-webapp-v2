<script setup lang="ts">
// og:image/og:url need an absolute URL for link-preview scrapers, and this app has no
// hardcoded production domain anywhere — computed per-request from the actual incoming
// request instead of guessing one.
const requestUrl = useRequestURL()
useSeoMeta({
  ogUrl: requestUrl.href,
  ogImage: `${requestUrl.origin}/orchard_meta.webp`,
  twitterImage: `${requestUrl.origin}/orchard_meta.webp`
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
