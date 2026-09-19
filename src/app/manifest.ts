import type { MetadataRoute } from 'next'
import { getBrand } from './brand'

export default function manifest(): MetadataRoute.Manifest {
  const brand = getBrand()
  return {
    name: brand.name,
    short_name: brand.shortName,
    description:
      'Emaro Premium Auto Care — mobilny detailing w Warszawie. Mycie, czyszczenie wnętrza i pielęgnacja aut, busów i ciężarówek.',
    start_url: '/pl',
    id: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#FFFFFF',
    theme_color: '#0a0a0a',
    lang: 'pl',
    dir: 'ltr',
    categories: ['business', 'automotive'],
    icons: [
      {
        src: '/images/emaro/favicon-32.png',
        sizes: '32x32',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/emaro/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/emaro/logo.png',
        sizes: '500x500',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/emaro/logo.png',
        sizes: '500x500',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
  }
}
