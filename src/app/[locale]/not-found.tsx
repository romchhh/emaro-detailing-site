import type { Metadata } from 'next'
import NotFoundContent from '../components/NotFoundContent'
import { BookingProvider } from '../components/booking/BookingProvider'
import { LocaleProvider } from '../../i18n/LocaleProvider'
import { getDictionarySync } from '../../i18n/getDictionary'
import { defaultLocale } from '../../i18n/config'
import { buildPageMetadata } from '../lib/pageMetadata'
import { getLocaleShellSync } from '../brand'

const dict = getDictionarySync(defaultLocale)
const shell = getLocaleShellSync()

export const metadata: Metadata = buildPageMetadata({
  locale: defaultLocale,
  title: dict.notFound.metaTitle,
  description: dict.notFound.metaDescription,
  keywords: dict.seo.keywords,
  ogImageAlt: dict.seo.ogImageAlt,
  noIndex: true,
  absoluteTitle: true,
})

export default function LocaleNotFound() {
  return (
    <LocaleProvider locale={defaultLocale} dict={dict} {...shell}>
      <BookingProvider>
        <NotFoundContent />
      </BookingProvider>
    </LocaleProvider>
  )
}
