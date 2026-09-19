import type { Dictionary, ServiceCopy } from '@/i18n/types'
import type { Locale } from '@/i18n/config'
import { detectMediaKind } from '@/lib/media/kind'
import { readDb } from './store'
import type {
  BrandSettings,
  CmsBeforeAfterItem,
  CmsGalleryItem,
  CmsReview,
  CmsService,
  Lead,
} from './types'

export function cmsBrand(): BrandSettings {
  return readDb().brand
}

export function cmsServices(): CmsService[] {
  return readDb().services
}

export function cmsGallery(): CmsGalleryItem[] {
  return readDb().gallery
}

export function cmsBeforeAfter(): CmsBeforeAfterItem[] {
  return readDb().beforeAfter
}

export function cmsReviews(): CmsReview[] {
  return readDb().reviews
}

export function cmsLeads(): Lead[] {
  return readDb().leads
}

function applyEntitiesToDictionary(locale: Locale, base: Dictionary): Dictionary {
  const db = readDb()
  const dict = structuredClone(base)

  const serviceItems: Record<string, ServiceCopy> = {}
  const priceItems: Record<string, { title: string; price: string; summary?: string; note?: string }> =
    {}

  for (const service of db.services) {
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
  for (const item of db.gallery) {
    galleryAlts[item.id] = item.alt[locale]
  }
  dict.gallery.alts = galleryAlts

  const beforeItems: Record<string, { title: string }> = {}
  for (const item of db.beforeAfter) {
    beforeItems[item.id] = { title: item.title[locale] }
  }
  dict.beforeAfter.items = beforeItems

  const reviewItems: Record<string, { name: string; text: string }> = {}
  for (const item of db.reviews) {
    reviewItems[item.id] = {
      name: item.name[locale],
      text: item.text[locale],
    }
  }
  dict.reviews.items = reviewItems

  // Keep contact service dropdown in sync with live services
  dict.contact.services = db.services.map((s) => s.title[locale]).filter(Boolean)

  return dict
}

export function cmsDictionary(locale: Locale): Dictionary {
  const db = readDb()
  const base = db.copy[locale] || db.copy.pl
  return applyEntitiesToDictionary(locale, base)
}

export function cmsDashboardStats() {
  const db = readDb()
  const now = Date.now()
  const monthAgo = now - 1000 * 60 * 60 * 24 * 30

  const pageviews = db.analytics.filter((event) => event.type === 'pageview')
  const recentViews = pageviews.filter((event) => new Date(event.createdAt).getTime() >= monthAgo)
  const leadsMonth = db.leads.filter((lead) => new Date(lead.createdAt).getTime() >= monthAgo)
  const newLeads = db.leads.filter((lead) => lead.status === 'new').length
  const visits = recentViews.length
  const conversion = visits > 0 ? ((leadsMonth.length / visits) * 100).toFixed(1) : '0.0'

  const dayLabels = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So']
  const byDay = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(now - (6 - index) * 1000 * 60 * 60 * 24)
    const key = day.toISOString().slice(0, 10)
    const label = dayLabels[day.getDay()]
    const value = pageviews.filter((event) => event.createdAt.startsWith(key)).length
    return { label, value }
  })

  const pathCounts = new Map<string, number>()
  for (const event of recentViews) {
    pathCounts.set(event.path, (pathCounts.get(event.path) || 0) + 1)
  }
  const topPages = Array.from(pathCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([path, views]) => ({
      path,
      views,
      share: `${Math.round((views / Math.max(recentViews.length, 1)) * 100)}%`,
    }))

  return {
    stats: [
      {
        id: 'visits',
        label: 'Wizyty (30 dni)',
        value: visits.toLocaleString('pl-PL'),
        delta: `${recentViews.length} odsłon`,
        trend: 'up' as const,
        hint: 'pageviews',
      },
      {
        id: 'leads',
        label: 'Zgłoszenia (30 dni)',
        value: String(leadsMonth.length),
        delta: `${newLeads} nowych`,
        trend: leadsMonth.length > 0 ? ('up' as const) : ('neutral' as const),
        hint: 'formularze kontakt / booking',
      },
      {
        id: 'conversion',
        label: 'Konwersja',
        value: `${conversion}%`,
        delta: 'zgłoszenia / wizyty',
        trend: 'neutral' as const,
        hint: 'ostatnie 30 dni',
      },
      {
        id: 'services',
        label: 'Usługi w CMS',
        value: String(db.services.length),
        delta: `${db.gallery.length} galeria · ${db.beforeAfter.length} before/after`,
        trend: 'neutral' as const,
        hint: 'aktywny katalog',
      },
    ],
    visitsSeries: byDay,
    topPages,
    recentLeads: db.leads.slice(0, 8),
    trafficSources: [
      { label: 'Organiczne', value: 42, color: '#ffd60a' },
      { label: 'Bezpośrednie', value: 28, color: '#0a0a0a' },
      { label: 'Social', value: 18, color: '#6e6e6e' },
      { label: 'Inne', value: 12, color: '#c4c4c4' },
    ],
  }
}

/** Public structural shapes matching siteContent helpers */
export function cmsServiceItems() {
  return cmsServices().map((s) => ({
    id: s.id,
    category: s.category,
    image: s.image,
    imagePosition: s.imagePosition,
    theme: s.theme,
  }))
}

export function cmsGalleryItems() {
  return cmsGallery().map((g) => ({
    id: g.id,
    src: g.src,
    kind: detectMediaKind(g.src, g.kind),
    position: g.position,
  }))
}

export function cmsBeforeAfterItems() {
  return cmsBeforeAfter().map((item) => ({
    id: item.id,
    image: item.image,
    beforeImage: item.beforeImage,
    position: item.position,
    beforeFilter: item.beforeFilter,
  }))
}

export function cmsReviewItems() {
  return cmsReviews().map((r) => ({
    id: r.id,
    rating: r.rating,
  }))
}
