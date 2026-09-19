import { BRAND } from '@/app/brand'
import {
  ABOUT_CTA_IMAGE,
  ABOUT_TEAM_IMAGE,
  BEFORE_AFTER_ITEMS,
  GALLERY_IMAGES,
  REVIEW_ITEMS,
  SERVICES,
} from '@/app/data/siteContent'
import { pl } from '@/i18n/dictionaries/pl'
import { uk } from '@/i18n/dictionaries/uk'
import type { Dictionary } from '@/i18n/types'
import { hashPassword } from '@/lib/security/password'
import type {
  BrandSettings,
  CmsBeforeAfterItem,
  CmsDb,
  CmsGalleryItem,
  CmsReview,
  CmsService,
  Localized,
} from './types'

function L(plValue: string, ukValue: string): Localized {
  return { pl: plValue, uk: ukValue }
}

function cloneDict(dict: Dictionary): Dictionary {
  return structuredClone(dict)
}

function buildServices(): CmsService[] {
  return SERVICES.map((service) => {
    const plItem = pl.services.items[service.id]
    const ukItem = uk.services.items[service.id]
    const plPrice = pl.prices.items[service.id]
    const ukPrice = uk.prices.items[service.id]

    return {
      id: service.id,
      category: service.category,
      image: service.image,
      imagePosition: service.imagePosition || 'center center',
      theme: service.theme,
      title: L(plItem?.title || '', ukItem?.title || ''),
      description: L(plItem?.description || '', ukItem?.description || ''),
      price: L(plItem?.price || plPrice?.price || '', ukItem?.price || ukPrice?.price || ''),
      priceNote: L(plItem?.priceNote || '', ukItem?.priceNote || ''),
      summary: L(plPrice?.summary || '', ukPrice?.summary || ''),
    }
  })
}

function buildGallery(): CmsGalleryItem[] {
  return GALLERY_IMAGES.map((item) => ({
    id: item.id,
    src: item.src,
    kind: item.kind,
    position: item.position,
    alt: L(pl.gallery.alts[item.id] || '', uk.gallery.alts[item.id] || ''),
  }))
}

function buildBeforeAfter(): CmsBeforeAfterItem[] {
  return BEFORE_AFTER_ITEMS.map((item) => ({
    id: item.id,
    image: item.image,
    beforeImage: '',
    position: item.position,
    beforeFilter: item.beforeFilter,
    title: L(pl.beforeAfter.items[item.id]?.title || '', uk.beforeAfter.items[item.id]?.title || ''),
  }))
}

function buildReviews(): CmsReview[] {
  return REVIEW_ITEMS.map((item) => ({
    id: item.id,
    rating: item.rating,
    name: L(pl.reviews.items[item.id]?.name || '', uk.reviews.items[item.id]?.name || ''),
    text: L(pl.reviews.items[item.id]?.text || '', uk.reviews.items[item.id]?.text || ''),
  }))
}

function buildBrand(): BrandSettings {
  return {
    name: BRAND.name,
    shortName: BRAND.shortName,
    tagline: L(BRAND.tagline, 'більше ніж просто чисте авто'),
    phone: BRAND.phone,
    email: BRAND.email,
    whatsapp: BRAND.whatsapp,
    telegram: BRAND.telegram,
    instagram: BRAND.instagram,
    address: BRAND.address,
    city: BRAND.city,
    logo: BRAND.logo,
    heroDesktop: BRAND.heroDesktop,
    heroMobile: BRAND.heroMobile,
    contactImage: BRAND.contactImage,
    aboutTeamImage: ABOUT_TEAM_IMAGE.src,
    aboutTeamPosition: ABOUT_TEAM_IMAGE.position,
    aboutCtaImage: ABOUT_CTA_IMAGE.src,
    aboutCtaPosition: ABOUT_CTA_IMAGE.position,
    telegramNotify: true,
  }
}

export function createDefaultDb(): CmsDb {
  return {
    brand: buildBrand(),
    services: buildServices(),
    gallery: buildGallery(),
    beforeAfter: buildBeforeAfter(),
    reviews: buildReviews(),
    copy: {
      pl: cloneDict(pl as Dictionary),
      uk: cloneDict(uk as Dictionary),
    },
    leads: [],
    analytics: [],
    users: [
      {
        id: 'user-admin',
        login: process.env.ADMIN_LOGIN || 'admin',
        password: hashPassword(process.env.ADMIN_PASSWORD || 'emaro2025'),
        name: 'Administrator',
        active: true,
      },
    ],
    sessions: [],
  }
}
