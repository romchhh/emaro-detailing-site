'use client'

import type { AnalyticsEventType } from './events'

type TrackPayload = {
  path?: string
  locale?: string
  value?: string
  meta?: Record<string, unknown>
}

export function track(type: AnalyticsEventType, payload: TrackPayload = {}) {
  if (typeof window === 'undefined') return

  const body = JSON.stringify({
    type,
    path: payload.path || window.location.pathname,
    locale: payload.locale,
    value: payload.value,
    meta: payload.meta,
  })

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' })
      navigator.sendBeacon('/api/analytics/event', blob)
      return
    }
  } catch {
    // fall through
  }

  void fetch('/api/analytics/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {})
}
