/**
 * Logs an authenticated user out after 10 minutes of no interaction. Client-only (needs
 * `window`/timers). Mirrors useApi.ts's 401 handler for the actual logout+redirect —
 * navigateTo() has to be replayed through the captured Nuxt app context via
 * runWithContext() since this fires from a plain setTimeout callback, detached from Vue's
 * synchronous setup call stack.
 */
const IDLE_LIMIT_MS = 10 * 60 * 1000
const RESET_THROTTLE_MS = 1000
const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'] as const

export default defineNuxtPlugin((nuxtApp) => {
  const authStore = useAuthStore()

  let timer: ReturnType<typeof setTimeout> | null = null
  let lastReset = 0

  function stopTimer() {
    if (timer != null) {
      clearTimeout(timer)
      timer = null
    }
  }

  async function onIdle() {
    stopTimer()
    authStore.logout()
    await nuxtApp.runWithContext(() => navigateTo('/login?idle=1'))
  }

  function startTimer() {
    stopTimer()
    timer = setTimeout(onIdle, IDLE_LIMIT_MS)
  }

  // Throttled so rapid mousemove/scroll events don't churn clearTimeout/setTimeout on every
  // frame — resetting once a second is more than enough resolution for a 10-minute window.
  function onActivity() {
    const now = Date.now()
    if (now - lastReset < RESET_THROTTLE_MS) return
    lastReset = now
    startTimer()
  }

  function attach() {
    for (const event of ACTIVITY_EVENTS) window.addEventListener(event, onActivity, { passive: true })
    startTimer()
  }

  function detach() {
    for (const event of ACTIVITY_EVENTS) window.removeEventListener(event, onActivity)
    stopTimer()
  }

  watch(() => authStore.isAuthenticated, (isAuthenticated) => (isAuthenticated ? attach() : detach()), { immediate: true })
})
