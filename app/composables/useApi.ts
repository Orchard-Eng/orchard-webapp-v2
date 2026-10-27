/**
 * Thin wrapper around $fetch for https://ship.crowdital.com/api/ — injects the Sanctum-style
 * bearer token (see stores/auth.ts) and handles 401s by logging out and redirecting to /login.
 */
export function useApi() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  // $fetch's hooks run detached from Vue's synchronous setup call stack, so Nuxt's
  // auto-context tracking can't see them — navigateTo() (and other Nuxt-instance-bound
  // composables) must be replayed through the captured app context via runWithContext.
  const nuxtApp = useNuxtApp()

  const client = $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ options }) {
      const headers = new Headers(options.headers)
      headers.set('Accept', 'application/json, text/plain, */*')
      if (authStore.token) {
        headers.set('Authorization', `Bearer ${authStore.token}`)
      }
      if (options.method && options.method.toUpperCase() !== 'GET') {
        headers.set('Content-Type', 'application/json')
      }
      options.headers = headers
    },
    // Some backend actions (a wrong transaction PIN among them) fail a business-rule check
    // with HTTP 200 and { success: false, message } in the body, rather than a 4xx — $fetch
    // never throws on a 2xx response, so without this every caller (which all just check
    // "did the promise resolve") would treat a soft failure as a success. Throwing here
    // converts it into a real rejection so useAsyncAction and getApiErrorMessage handle it
    // exactly like any other error, in one place instead of per call site.
    onResponse({ response }) {
      const data = response._data
      if (data && typeof data === 'object' && 'success' in data && data.success === false) {
        throw Object.assign(new Error(typeof data.message === 'string' ? data.message : 'Request failed'), { data })
      }
    },
    async onResponseError({ response }) {
      if (response.status === 401) {
        authStore.logout()
        await nuxtApp.runWithContext(() => navigateTo('/login'))
      }
    }
  })

  return client
}
