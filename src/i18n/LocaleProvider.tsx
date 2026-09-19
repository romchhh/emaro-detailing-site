'use client'

import { createContext, useContext } from 'react'
import type { Locale } from './config'
import type { Dictionary } from './types'
import type { BrandSettings } from '@/lib/cms/types'
import type {
  BeforeAfterItem,
  GalleryItem,
  ReviewItem,
  ServiceItem,
} from '@/app/data/siteContent'

export type AboutImage = { src: string; position: string }

type LocaleContextValue = {
  locale: Locale
  dict: Dictionary
  brand: BrandSettings
  services: ServiceItem[]
  gallery: GalleryItem[]
  beforeAfter: Array<BeforeAfterItem & { beforeImage?: string }>
  reviews: ReviewItem[]
  aboutTeam: AboutImage
  aboutCta: AboutImage
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({
  locale,
  dict,
  brand,
  services,
  gallery,
  beforeAfter,
  reviews,
  aboutTeam,
  aboutCta,
  children,
}: LocaleContextValue & { children: React.ReactNode }) {
  return (
    <LocaleContext.Provider
      value={{
        locale,
        dict,
        brand,
        services,
        gallery,
        beforeAfter,
        reviews,
        aboutTeam,
        aboutCta,
      }}
    >
      {children}
    </LocaleContext.Provider>
  )
}

function useLocaleContext() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('Locale hooks must be used within LocaleProvider')
  return ctx
}

export function useLocale() {
  return useLocaleContext().locale
}

export function useDictionary() {
  return useLocaleContext().dict
}

export function useBrand() {
  return useLocaleContext().brand
}

export function useServices() {
  return useLocaleContext().services
}

export function useGallery() {
  return useLocaleContext().gallery
}

export function useBeforeAfter() {
  return useLocaleContext().beforeAfter
}

export function useReviews() {
  return useLocaleContext().reviews
}

export function useAboutImages() {
  const ctx = useLocaleContext()
  return { team: ctx.aboutTeam, cta: ctx.aboutCta }
}
