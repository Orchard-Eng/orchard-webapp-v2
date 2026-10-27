// Real API JSON responses only carry storage-relative paths (e.g.
// "product_image/efafb793-....png"), not full URLs. Confirmed live (2026-08-19): prefixing
// with https://ship.crowdital.com/storage/ resolves them to real 200 image responses. This
// is a different host+path than the JSON API base (/api/proxy/ -> .../api/, see
// server/api/proxy/[...path].ts) and is fetched directly by the browser via a plain <img>
// tag, so none of that proxy's CORS/Sanctum-CSRF workarounds apply here.
const STORAGE_BASE = 'https://ship.crowdital.com/storage/'

export function resolveApiImage(path: string | null | undefined): string | null {
  if (!path) return null
  return `${STORAGE_BASE}${path}`
}
