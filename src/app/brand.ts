import {
  cmsBeforeAfterItems,
  cmsBrand,
  cmsGalleryItems,
  cmsReviewItems,
  cmsServiceItems,
} from '@/lib/cms/content'

/** @deprecated Prefer useBrand() / cmsBrand() — kept for static fallbacks */
export const BRAND = {
  name: 'Emaro Premium Auto Care',
  shortName: 'Emaro',
  tagline: 'więcej niż czyste auto',
  phone: '+48 577 123 029',
  email: 'emaroautocare@gmail.com',
  whatsapp: 'https://wa.me/48577123029',
  telegram: 'https://t.me/emaro_premium',
  address: 'Warszawa i okolice',
  city: 'Warszawa, Polska',
  instagram: 'https://www.instagram.com/emaro.premium/',
  logo: '/images/emaro/logo.png',
  heroDesktop: '/images/emaro/hero-desktop.png',
  heroMobile: '/images/emaro/hero-mobile.png',
  contactImage: '/images/emaro/hero-desktop.png',
} as const

export function getBrand() {
  try {
    return cmsBrand()
  } catch {
    return {
      ...BRAND,
      tagline: { pl: BRAND.tagline, uk: BRAND.tagline },
      aboutTeamImage: '',
      aboutTeamPosition: 'center',
      aboutCtaImage: '',
      aboutCtaPosition: 'center',
      telegramNotify: true,
    }
  }
}

export function getSiteMedia() {
  const brand = getBrand()
  return {
    brand,
    services: cmsServiceItems(),
    gallery: cmsGalleryItems(),
    beforeAfter: cmsBeforeAfterItems(),
    reviews: cmsReviewItems(),
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

/** Props for LocaleProvider (public pages + 404). */
export function getLocaleShell(locale: 'pl' | 'uk') {
  const media = getSiteMedia()
  return {
    brand: media.brand,
    services: media.services,
    gallery: media.gallery,
    beforeAfter: media.beforeAfter,
    reviews: media.reviews,
    aboutTeam: media.aboutTeam,
    aboutCta: media.aboutCta,
  }
}
