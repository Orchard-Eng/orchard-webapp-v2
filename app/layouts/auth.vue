<template>
  <div class="flex min-h-screen bg-[var(--oc-bg-canvas)]">
    <div class="relative hidden w-1/2 lg:block">
      <AuthCarousel class="absolute inset-0" />
      <div class="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
      <img src="/images/logo_white.svg" alt="Orchard" class="absolute bottom-8 left-8 h-7 w-auto">
    </div>

    <div class="flex w-full flex-col items-center justify-center px-4 py-12 lg:w-1/2">
      <div class="w-full max-w-sm">
        <div class="mb-8 flex justify-center">
          <AppLogo />
        </div>
        <slot />
      </div>
    </div>
  </div>
</template>
