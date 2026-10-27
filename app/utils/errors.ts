/**
 * Extracts the backend's own error message from a failed $fetch/ofetch call. Error
 * responses observed from ship.crowdital.com take the shape {status: false, message}
 * (confirmed by direct testing against POST /users/auth/login, 2026-08-19) — a different
 * envelope from the {success, message, data} shape successful responses use elsewhere.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data?: unknown }).data
    if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
      return data.message
    }
  }
  return fallback
}
