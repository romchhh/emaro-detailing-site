import type { Dictionary } from '@/i18n/types'
import type { ServiceCategory, ServiceTheme } from '@/app/data/siteContent'

export type Localized = { pl: string; uk: string }

export type LeadStatus = 'new' | 'in_progress' | 'done' | 'archived'
export type LeadSource = 'contact' | 'booking'

export type Lead = {
  id: string
  name: string
  phone: string
  email: string
  service: string
  comment: string
  source: LeadSource
  status: LeadStatus
  locale: string
  pageUrl: string
  pagePath: string
  userAgent: string
  notes: string
  createdAt: string
  updatedAt: string
}

export type AdminUser = {
  id: string
  login: string
  password: string
  name: string
  active: boolean
}

export type AdminSessionRecord = {
  token: string
  userId: string
  login: string
  createdAt: string
  expiresAt: string
}

export type AnalyticsEventType =
  | 'pageview'
  | 'form_start'
  | 'form_submit'
  | 'phone_click'
  | 'whatsapp_click'
  | 'telegram_click'
  | 'lead'

export type AnalyticsEvent = {
  id: string
  type: AnalyticsEventType
  path: string
  locale?: string
  value?: string
  meta?: Record<string, unknown>
  createdAt: string
}

export type BrandSettings = {
  name: string
  shortName: string
  tagline: Localized
  phone: string
  email: string
  whatsapp: string
  telegram: string
  instagram: string
  address: string
  city: string
  logo: string
  heroDesktop: string
  heroMobile: string
  contactImage: string
  aboutTeamImage: string
  aboutTeamPosition: string
  aboutCtaImage: string
  aboutCtaPosition: string
  telegramNotify: boolean
}

export type CmsService = {
  id: string
  category: ServiceCategory
  image: string
  imagePosition: string
  theme: ServiceTheme
  title: Localized
  description: Localized
  price: Localized
  priceNote: Localized
  summary: Localized
}

export type CmsGalleryItem = {
  id: string
  src: string
  /** image | video — inferred from src when omitted */
  kind?: 'image' | 'video'
  position: string
  alt: Localized
}

export type CmsBeforeAfterItem = {
  id: string
  image: string
  beforeImage: string
  position: string
  beforeFilter: string
  title: Localized
}

export type CmsReview = {
  id: string
  rating: number
  name: Localized
  text: Localized
}

export type CmsDb = {
  brand: BrandSettings
  services: CmsService[]
  gallery: CmsGalleryItem[]
  beforeAfter: CmsBeforeAfterItem[]
  reviews: CmsReview[]
  copy: { pl: Dictionary; uk: Dictionary }
  leads: Lead[]
  analytics: AnalyticsEvent[]
  users: AdminUser[]
  sessions: AdminSessionRecord[]
}
