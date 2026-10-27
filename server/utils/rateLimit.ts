// In-memory sliding-window rate limiter — good enough for a single Nitro instance at
// launch. If this ever runs across multiple server instances, this state won't be shared
// between them and would need a store like Redis instead.
const hits = new Map<string, number[]>()

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  timestamps.push(now)
  hits.set(key, timestamps)
  return timestamps.length > limit
}
