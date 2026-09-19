'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { track } from '@/lib/analytics/track'
import type { Locale } from '@/i18n/config'

export default function AnalyticsBeacon({ locale }: { locale: Locale }) {
  const pathname = usePathname()

  useEffect(() => {
    track('pageview', { locale, path: pathname })
  }, [locale, pathname])

  return null
}
