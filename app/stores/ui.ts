export const useUiStore = defineStore('ui', () => {
  const sidebarCollapsedCookie = useCookie<boolean>('oc_sidebar_collapsed', { default: () => false })
  const sidebarCollapsed = ref(sidebarCollapsedCookie.value)

  const mobileNavOpen = ref(false)

  function toggleSidebarCollapsed() {
    sidebarCollapsed.value = !sidebarCollapsed.value
    sidebarCollapsedCookie.value = sidebarCollapsed.value
  }

  function openMobileNav() {
    mobileNavOpen.value = true
  }

  function closeMobileNav() {
    mobileNavOpen.value = false
  }

  return { sidebarCollapsed, mobileNavOpen, toggleSidebarCollapsed, openMobileNav, closeMobileNav }
})
