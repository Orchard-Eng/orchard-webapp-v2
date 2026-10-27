/**
 * Tab-scoped, SSR-safe transient state for multi-step flows (onboarding, 2FA, password
 * reset) that previously threaded email/user_id/free-text messages through the URL query
 * string on every step — visible in browser history, autocomplete, and potentially
 * server/proxy access logs. sessionStorage gives the same "survives a refresh mid-flow"
 * behavior the URL accidentally provided, without ever putting the data in the address bar,
 * and it's cleared automatically when the tab closes.
 */
export function useFlowState<T extends Record<string, unknown>>(key: string) {
  function get(): Partial<T> {
    if (!import.meta.client) return {}
    try {
      const raw = sessionStorage.getItem(key)
      return raw ? (JSON.parse(raw) as Partial<T>) : {}
    } catch {
      return {}
    }
  }

  function set(value: T) {
    if (!import.meta.client) return
    sessionStorage.setItem(key, JSON.stringify(value))
  }

  function clear() {
    if (!import.meta.client) return
    sessionStorage.removeItem(key)
  }

  return { get, set, clear }
}
