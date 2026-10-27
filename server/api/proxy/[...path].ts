/**
 * Proxies /api/proxy/* to https://ship.crowdital.com/api/* server-side.
 *
 * The real backend's CORS allowlist only permits https://apex-user.crowdital.com
 * (confirmed 2026-08-19 — an OPTIONS preflight from any other Origin gets no
 * Access-Control-Allow-Origin header at all), so a browser calling it directly from this
 * app's own origin is blocked before the request completes, regardless of how correct the
 * request itself is. Routing through our own server sidesteps this: the browser only ever
 * talks to same-origin /api/proxy/*, and this handler makes the actual cross-origin call
 * itself, where CORS doesn't apply.
 *
 * Uses $fetch directly rather than h3's proxyRequest() — proxyRequest merges its own
 * auto-forwarded headers (including Origin) with any passed via fetchOptions rather than
 * letting them override, and an Origin header alone (regardless of proxying) trips the
 * backend's Laravel Sanctum stateful-domain CSRF check (confirmed live: identical requests
 * succeed with no Origin header, fail with 419 "CSRF token mismatch" the moment one is
 * present). This app is pure bearer-token auth and never relies on Sanctum's cookie
 * session, so only forward the handful of headers the backend actually needs.
 */
export default defineEventHandler(async (event) => {
  const path = event.context.params?.path ?? ''
  const query = getRequestURL(event).search

  const config = useRuntimeConfig()
  const target = `${config.apiBase}/api/${path}${query}`

  const incoming = getRequestHeaders(event)
  const headers: Record<string, string> = {
    accept: incoming.accept ?? 'application/json, text/plain, */*'
  }
  // Forward the original browser User-Agent to Laravel 
  if (incoming['user-agent']) { headers['user-agent'] = incoming['user-agent'] }
  if (incoming.authorization) headers.authorization = incoming.authorization
  if (incoming['content-type']) headers['content-type'] = incoming['content-type']

  const method = event.method
  const body = method !== 'GET' && method !== 'HEAD' ? await readRawBody(event) : undefined

  try {
    const response = await $fetch.raw(target, { method, headers, body })
    setResponseStatus(event, response.status, response.statusText)
    return response._data
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) {
      const fetchError = error as { response?: Response; data?: unknown }
      setResponseStatus(event, fetchError.response?.status ?? 500)
      return fetchError.data
    }
    throw error
  }
})
