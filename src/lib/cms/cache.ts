import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import type { Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/types'
import { pl } from '@/i18n/dictionaries/pl'
import { uk } from '@/i18n/dictionaries/uk'
import { detectMediaKind } from '@/lib/media/kind'
import {
  CMS_CACHE_TAG,
  CMS_DICT_TAG,
  CMS_MEDIA_TAG,
} from './cacheInvalidate'
import { readDb } from './store'
import type { BrandSettings, CmsBeforeAfterItem, CmsGalleryItem, CmsReview, CmsService } from './types'

export {
  CMS_CACHE_TAG,
  CMS_DICT_TAG,
  CMS_MEDIA_TAG,
  revalidateCmsCaches,
} from './cacheInvalidate'

const FALLBACK = { pl, uk } as const

export type PublicCmsSnapshot = {
  brand: BrandSettings
  services: CmsService[]
  gallery: CmsGalleryItem[]
  beforeAfter: CmsBeforeAfterItem[]
  reviews: CmsReview[]
  copy: { pl: Dictionary; uk: Dictionary }
}

function loadPublicSnapshot(): PublicCmsSnapshot {
  const db = readDb()
  return {
    brand: db.brand,
    services: db.services,
    gallery: db.gallery,
    beforeAfter: db.beforeAfter,
    reviews: db.reviews,
    copy: db.copy,
  }
}

const getCachedSnapshot = unstable_cache(
  async (): Promise<PublicCmsSnapshot> => loadPublicSnapshot(),
  ['cms-public-snapshot-v1'],
  {
    revalidate: 3600,
    tags: [CMS_CACHE_TAG],
  },
)

function buildDictionary(locale: Locale, snapshot: PublicCmsSnapshot): Dictionary {
  const base = snapshot.copy[locale] || snapshot.copy.pl
  const dict = structuredClone(base)

  const serviceItems: Dictionary['services']['items'] = {}
  const priceItems: Dictionary['prices']['items'] = {}

  for (const service of snapshot.services) {
    serviceItems[service.id] = {
      title: service.title[locale],
      description: service.description[locale],
      price: service.price[locale],
      ...(service.priceNote[locale] ? { priceNote: service.priceNote[locale] } : {}),
    }
    priceItems[service.id] = {
      title: service.title[locale],
      price: service.price[locale],
      ...(service.summary[locale] ? { summary: service.summary[locale] } : {}),
      ...(service.priceNote[locale] ? { note: service.priceNote[locale] } : {}),
    }
  }

  dict.services.items = serviceItems
  dict.prices.items = priceItems

  const galleryAlts: Record<string, string> = {}
  for (const item of snapshot.gallery) {
    galleryAlts[item.id] = item.alt[locale]
  }
  dict.gallery.alts = galleryAlts

  const beforeItems: Record<string, { title: string }> = {}
  for (const item of snapshot.beforeAfter) {
    beforeItems[item.id] = { title: item.title[locale] }
  }
  dict.beforeAfter.items = beforeItems

  const reviewItems: Record<string, { name: string; text: string }> = {}
  for (const item of snapshot.reviews) {
    reviewItems[item.id] = {
      name: item.name[locale],
      text: item.text[locale],
    }
  }
  dict.reviews.items = reviewItems
  dict.contact.services = snapshot.services.map((s) => s.title[locale]).filter(Boolean)

  return dict
}

const getCachedDictPl = unstable_cache(
  async () => buildDictionary('pl', await getCachedSnapshot()),
  ['cms-dict-pl-v1'],
  { revalidate: 3600, tags: [CMS_CACHE_TAG, CMS_DICT_TAG] },
)

const getCachedDictUk = unstable_cache(
  async () => buildDictionary('uk', await getCachedSnapshot()),
  ['cms-dict-uk-v1'],
  { revalidate: 3600, tags: [CMS_CACHE_TAG, CMS_DICT_TAG] },
)

export const getCachedPublicSnapshot = cache(async () => {
  try {
    return await getCachedSnapshot()
  } catch {
    return loadPublicSnapshot()
  }
})

export const getCachedDictionary = cache(async (locale: Locale): Promise<Dictionary> => {
  try {
    return locale === 'uk' ? await getCachedDictUk() : await getCachedDictPl()
  } catch {
    return structuredClone((FALLBACK[locale] ?? FALLBACK.pl) as Dictionary)
  }
})

export type SiteMediaBundle = {
  brand: BrandSettings
  services: ReturnType<typeof mapServices>
  gallery: ReturnType<typeof mapGallery>
  beforeAfter: ReturnType<typeof mapBeforeAfter>
  reviews: ReturnType<typeof mapReviews>
  aboutTeam: { src: string; position: string }
  aboutCta: { src: string; position: string }
}

function mapServices(services: CmsService[]) {
  return services.map((s) => ({
    id: s.id,
    category: s.category,
    image: s.image,
    imagePosition: s.imagePosition,
    theme: s.theme,
  }))
}

function mapGallery(gallery: CmsGalleryItem[]) {
  return gallery.map((g) => ({
    id: g.id,
    src: g.src,
    kind: detectMediaKind(g.src, g.kind),
    position: g.position,
  }))
}

function mapBeforeAfter(items: CmsBeforeAfterItem[]) {
  return items.map((item) => ({
    id: item.id,
    image: item.image,
    beforeImage: item.beforeImage,
    position: item.position,
    beforeFilter: item.beforeFilter,
  }))
}

function mapReviews(reviews: CmsReview[]) {
  return reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
  }))
}

const getCachedMediaBundle = unstable_cache(
  async (): Promise<SiteMediaBundle> => {
    const snapshot = await getCachedSnapshot()
    const brand = snapshot.brand
    return {
      brand,
      services: mapServices(snapshot.services),
      gallery: mapGallery(snapshot.gallery),
      beforeAfter: mapBeforeAfter(snapshot.beforeAfter),
      reviews: mapReviews(snapshot.reviews),
      aboutTeam: {
        src: brand.aboutTeamImage,
        position: brand.aboutTeamPosition,
      },
      aboutCta: {
        src: brand.aboutCtaImage,
        position: brand.aboutCtaPosition,
      },
    }
  },
  ['cms-site-media-v1'],
  { revalidate: 3600, tags: [CMS_CACHE_TAG, CMS_MEDIA_TAG] },
)

export const getCachedSiteMedia = cache(async (): Promise<SiteMediaBundle> => {
  try {
    return await getCachedMediaBundle()
  } catch {
    const snapshot = loadPublicSnapshot()
    const brand = snapshot.brand
    return {
      brand,
      services: mapServices(snapshot.services),
      gallery: mapGallery(snapshot.gallery),
      beforeAfter: mapBeforeAfter(snapshot.beforeAfter),
      reviews: mapReviews(snapshot.reviews),
      aboutTeam: {
        src: brand.aboutTeamImage,
        position: brand.aboutTeamPosition,
      },
      aboutCta: {
        src: brand.aboutCtaImage,
        position: brand.aboutCtaPosition,
      },
    }
  }
})
