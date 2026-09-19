import { NextResponse } from 'next/server'
import { isAnalyticsEventType } from '@/lib/analytics/events'
import { appendAnalytics, uid } from '@/lib/cms/store'
import { getClientIp, isRateLimited } from '@/lib/security/rateLimit'
import { expectsJson, isAllowedOrigin } from '@/lib/security/requestGuard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  if (!expectsJson(request)) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 415 })
  }

  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })
  }

  const ip = getClientIp(request)
  if (isRateLimited(`analytics:${ip}`, { windowMs: 60_000, max: 40 })) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })
  }

  const body = (await request.json().catch(() => null)) as {
    type?: string
    path?: string
    locale?: string
    value?: string
    meta?: Record<string, unknown>
  } | null

  if (!body?.type || !isAnalyticsEventType(body.type)) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 })
  }

  appendAnalytics({
    id: uid('evt'),
    type: body.type,
    path: (body.path || '/').slice(0, 300),
    locale: body.locale?.slice(0, 8),
    value: body.value?.slice(0, 200),
    meta: body.meta,
    createdAt: new Date().toISOString(),
  })

  return NextResponse.json({ ok: true })
}
