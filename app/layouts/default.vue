<template>
  <div class="flex min-h-screen bg-[var(--oc-bg-canvas)]">
    <AppSidebar />

    <div class="flex min-w-0 flex-1 flex-col">
      <AppTopbar />

      <main class="flex-1 px-6 py-6 sm:px-6 lg:px-8">
        <div class="mx-auto w-full max-w-6xl">
          <slot />
        </div>
      </main>

      <AppFooter />
    </div>
  </div>
</template>
