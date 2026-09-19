import { cache } from 'react'
import { getCachedSiteMedia } from '@/lib/cms/cache'
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

export const getBrand = cache(() => {
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
})

/** Brand + services/gallery media from CMS (cached 1h, tagged). */
export const getSiteMedia = cache(async () => getCachedSiteMedia())

function buildShellFromLive() {
  try {
    const brand = cmsBrand()
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
  } catch {
    return {
      brand: getBrand(),
      services: [] as ReturnType<typeof cmsServiceItems>,
      gallery: [] as ReturnType<typeof cmsGalleryItems>,
      beforeAfter: [] as ReturnType<typeof cmsBeforeAfterItems>,
      reviews: [] as ReturnType<typeof cmsReviewItems>,
      aboutTeam: { src: '', position: 'center' },
      aboutCta: { src: '', position: 'center' },
    }
  }
}

/** Sync shell for 404 pages that cannot await. */
export function getLocaleShellSync() {
  return buildShellFromLive()
}

/** Async shell for public layouts (uses Next data cache). */
export async function getLocaleShell() {
  return getSiteMedia()
}
