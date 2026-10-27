const PUBLIC_ROUTES = new Set([
  '/login',
  '/signup',
  '/otp',
  '/add-username',
  '/create-pin',
  '/two-factor',
  '/forgot-password',
  '/verify-reset-code',
  '/reset-password',
  '/terms',
  '/privacy'
])

export default defineNuxtRouteMiddleware((to) => {
  if (PUBLIC_ROUTES.has(to.path)) return

  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }
})
