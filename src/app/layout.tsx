import type { Metadata, Viewport } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
import './emaro.css'
import { pl } from '../i18n/dictionaries/pl'
import {
  absoluteUrl,
  APPLE_TOUCH_ICON,
  getSiteVerification,
  OG_IMAGE,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  SITE_NAME,
  SITE_URL,
} from './seo'

const montserrat = Montserrat({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
})

const verification = getSiteVerification()

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: pl.seo.defaultTitle,
    template: `%s | ${SITE_NAME}`,
  },
  description: pl.seo.defaultDescription,
  keywords: pl.seo.keywords,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'automotive',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: 'black-translucent',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'geo.region': 'PL-MZ',
    'geo.placename': 'Warszawa',
    'geo.position': '52.2297;21.0122',
    ICBM: '52.2297, 21.0122',
  },
  alternates: {
    canonical: absoluteUrl('/pl'),
    languages: {
      pl: absoluteUrl('/pl'),
      uk: absoluteUrl('/uk'),
      'x-default': absoluteUrl('/pl'),
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    alternateLocale: ['uk_UA'],
    url: absoluteUrl('/pl'),
    siteName: SITE_NAME,
    title: pl.seo.defaultTitle,
    description: pl.seo.defaultDescription,
    images: [
      {
        url: OG_IMAGE,
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        alt: pl.seo.ogImageAlt,
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: pl.seo.defaultTitle,
    description: pl.seo.defaultDescription,
    images: [
      {
        url: OG_IMAGE,
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        alt: pl.seo.ogImageAlt,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [
      { url: '/images/emaro/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/images/emaro/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/emaro/logo.png', sizes: '500x500', type: 'image/png' },
    ],
    apple: [{ url: APPLE_TOUCH_ICON, sizes: '180x180', type: 'image/png' }],
    shortcut: ['/images/emaro/favicon-32.png'],
  },
  manifest: '/manifest.webmanifest',
  ...(verification ? { verification } : {}),
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0a0a0a' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // lang is updated client-side by HtmlLang in [locale] layout — avoid headers()
  // here so pages can use ISR instead of forced dynamic SSR.
  return (
    <html lang="pl">
      <body className={`emaro ${montserrat.className}`}>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  )
}
