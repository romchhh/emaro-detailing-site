import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BookingProvider } from '../components/booking/BookingProvider'
import HtmlLang from '../components/HtmlLang'
import AnalyticsBeacon from '../components/AnalyticsBeacon'
import { LocaleProvider } from '../../i18n/LocaleProvider'
import { getDictionary } from '../../i18n/getDictionary'
import { isLocale, locales, type Locale } from '../../i18n/config'
import { buildPageMetadata } from '../lib/pageMetadata'
import { getSiteMedia } from '../brand'

export const dynamic = 'force-dynamic'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const resolved = await params
  if (!isLocale(resolved.locale)) return {}
  const locale = resolved.locale as Locale
  const dict = await getDictionary(locale)

  return buildPageMetadata({
    locale,
    path: '',
    title: dict.seo.defaultTitle,
    description: dict.seo.defaultDescription,
    keywords: dict.seo.keywords,
    ogImageAlt: dict.seo.ogImageAlt,
    absoluteTitle: true,
  })
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const resolved = await params
  if (!isLocale(resolved.locale)) notFound()
  const locale = resolved.locale as Locale
  const dict = await getDictionary(locale)
  const media = getSiteMedia()

  return (
    <LocaleProvider
      locale={locale}
      dict={dict}
      brand={media.brand}
      services={media.services}
      gallery={media.gallery}
      beforeAfter={media.beforeAfter}
      reviews={media.reviews}
      aboutTeam={media.aboutTeam}
      aboutCta={media.aboutCta}
    >
      <BookingProvider>
        <HtmlLang locale={locale} />
        <AnalyticsBeacon locale={locale} />
        {children}
      </BookingProvider>
    </LocaleProvider>
  )
}
