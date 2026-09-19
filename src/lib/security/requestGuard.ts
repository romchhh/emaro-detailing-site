function normalizeOrigin(value: string): string | null {
  try {
    const url = new URL(value)
    return `${url.protocol}//${url.host}`.toLowerCase()
  } catch {
    return null
  }
}

function allowedOrigins(request: Request): Set<string> {
  const origins = new Set<string>()
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
  const proto =
    request.headers.get('x-forwarded-proto') ||
    (process.env.NODE_ENV === 'production' ? 'https' : 'http')

  if (host) origins.add(`${proto}://${host}`.toLowerCase())

  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (site) {
    const normalized = normalizeOrigin(site)
    if (normalized) origins.add(normalized)
  }

  if (process.env.VERCEL_URL) {
    origins.add(`https://${process.env.VERCEL_URL}`.toLowerCase())
  }

  // Local dev
  origins.add('http://localhost:3000')
  origins.add('http://127.0.0.1:3000')

  return origins
}

/** Reject cross-site POSTs that omit or mismatch Origin/Referer. */
export function isAllowedOrigin(request: Request): boolean {
  const allowed = allowedOrigins(request)
  const origin = request.headers.get('origin')
  if (origin) {
    const normalized = normalizeOrigin(origin)
    return Boolean(normalized && allowed.has(normalized))
  }

  const referer = request.headers.get('referer')
  if (referer) {
    const normalized = normalizeOrigin(referer)
    return Boolean(normalized && allowed.has(normalized))
  }

  // Same-origin fetch from some browsers may omit Origin on POST in edge cases —
  // allow only in development without either header.
  return process.env.NODE_ENV !== 'production'
}

const MIN_FORM_MS = 800
const MAX_FORM_MS = 1000 * 60 * 60 * 6 // 6h

/** Reject instant bot submits and stale/replayed timestamps. */
export function isSuspiciousTiming(formOpenedAt: unknown): boolean {
  if (typeof formOpenedAt !== 'number' || !Number.isFinite(formOpenedAt)) return true
  const age = Date.now() - formOpenedAt
  return age < MIN_FORM_MS || age > MAX_FORM_MS
}

export function expectsJson(request: Request): boolean {
  const ct = request.headers.get('content-type') || ''
  return ct.includes('application/json')
}
