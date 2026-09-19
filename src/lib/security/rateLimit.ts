type Bucket = { hits: number[] }

const buckets = new Map<string, Bucket>()

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first.slice(0, 64)
  }
  return (request.headers.get('x-real-ip') || 'unknown').slice(0, 64)
}

/** Sliding-window rate limit. Returns true when the caller should be blocked. */
export function isRateLimited(
  key: string,
  { windowMs, max }: { windowMs: number; max: number },
): boolean {
  const now = Date.now()
  const bucket = buckets.get(key) ?? { hits: [] }
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs)
  bucket.hits.push(now)
  buckets.set(key, bucket)

  // Cap map size to avoid unbounded growth
  if (buckets.size > 5000) {
    const oldest = buckets.keys().next().value
    if (oldest) buckets.delete(oldest)
  }

  return bucket.hits.length > max
}
