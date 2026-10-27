import type { ApiEnvelope, DashboardData } from '~/types/api'

/**
 * Hydrates the Pinia auth store from the persisted token cookie on app init, so the
 * bearer token survives reloads/SSR passes without a hydration flash of unauthenticated UI.
 *
 * Only the token is persisted to a cookie (never the user object — that would put a bcrypt
 * PIN hash, BVN, NIN, and bank details into JS-readable storage for no reason). The user
 * profile is instead re-fetched from /users/dashboard, the same endpoint every authenticated
 * page already calls via useLazyAsyncData('dashboard', ...) — sharing that cache key here
 * means a page's own fetch reuses this result instead of firing a second request.
 */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days — balances session convenience against the
// exposure window of a long-lived token sitting in a cookie (agreed during the security audit).

export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()
  const api = useApi()
  const tokenCookie = useCookie<string | null>('oc_auth_token', {
    default: () => null,
    maxAge: COOKIE_MAX_AGE,
    secure: true,
    sameSite: 'lax'
  })

  // Keyed off the token alone — middleware/auth.global.ts only ever checks
  // authStore.isAuthenticated (!!token).
  if (tokenCookie.value) {
    authStore.setToken(tokenCookie.value)

    useAsyncData('dashboard', () => api<ApiEnvelope<DashboardData>>('/users/dashboard')).then(({ data }) => {
      const user = data.value?.data?.dashboard_data?.user
      if (user) authStore.setUser(user)
    })
  }

  watch(
    () => authStore.token,
    (newToken) => {
      tokenCookie.value = newToken
    }
  )
})
