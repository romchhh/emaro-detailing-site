import { getBrand } from '../brand'
import type { Dictionary } from '../../i18n/types'
import type { Locale } from '../../i18n/config'
import { localeHtmlLang } from '../../i18n/config'
import {
  OG_IMAGE,
  SAME_AS,
  SCHEMA_LOGO,
  SITE_URL,
  absoluteUrl,
  phoneTel,
} from '../seo'

function JsonLdScript({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

type Props = {
  locale: Locale
  dict: Dictionary
}

export default function JsonLd({ locale, dict }: Props) {
  const brand = getBrand()
  const SITE_NAME = brand.name
  const lang = localeHtmlLang[locale]
  const pageUrl = absoluteUrl(`/${locale}`)

  const organization = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'AutoDetailing'],
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: brand.shortName,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl(SCHEMA_LOGO),
      width: 500,
      height: 500,
    },
    image: [absoluteUrl(OG_IMAGE), absoluteUrl(SCHEMA_LOGO)],
    description: dict.seo.defaultDescription,
    slogan: brand.tagline[locale] || brand.tagline.pl,
    email: brand.email,
    telephone: phoneTel(brand.phone),
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Warszawa',
      addressRegion: 'Mazowieckie',
      addressCountry: 'PL',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 52.2297,
      longitude: 21.0122,
    },
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: 52.2297,
        longitude: 21.0122,
      },
      geoRadius: '50000',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: phoneTel(brand.phone),
      contactType: 'customer service',
      email: brand.email,
      areaServed: ['PL'],
      availableLanguage: ['Polish', 'Ukrainian'],
    },
    priceRange: '$$',
    currenciesAccepted: 'PLN',
    paymentAccepted: 'Cash, Card, Transfer',
    knowsLanguage: ['pl', 'uk'],
    sameAs: [...SAME_AS],
  }

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    alternateName: brand.shortName,
    description: dict.seo.defaultDescription,
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: ['pl', 'uk'],
    potentialAction: {
      '@type': 'CommunicateAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: pageUrl,
        actionPlatform: [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform',
        ],
      },
    },
  }

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${pageUrl}/#webpage`,
    url: pageUrl,
    name: dict.seo.defaultTitle,
    description: dict.seo.defaultDescription,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#organization` },
    inLanguage: lang,
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: absoluteUrl(OG_IMAGE),
      width: 1200,
      height: 630,
    },
  }

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: SITE_NAME,
        item: pageUrl,
      },
    ],
  }

  const services = Object.values(dict.services.items).map((item) => ({
    '@type': 'Offer',
    itemOffered: {
      '@type': 'Service',
      name: item.title,
      description: item.description,
      provider: { '@id': `${SITE_URL}/#organization` },
      areaServed: 'Warszawa i okolice',
      serviceType: 'Auto detailing',
    },
    priceSpecification: {
      '@type': 'PriceSpecification',
      priceCurrency: 'PLN',
      description: item.price,
    },
  }))

  const offerCatalog = {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: dict.services.titleBefore + dict.services.titleEm,
    itemListElement: services,
  }

  return (
    <>
      <JsonLdScript data={organization} />
      <JsonLdScript data={website} />
      <JsonLdScript data={webPage} />
      <JsonLdScript data={breadcrumb} />
      <JsonLdScript data={offerCatalog} />
    </>
  )
}

type PrivacyProps = {
  locale: Locale
  dict: Dictionary
}

export function PrivacyJsonLd({ locale, dict }: PrivacyProps) {
  const brand = getBrand()
  const SITE_NAME = brand.name
  const lang = localeHtmlLang[locale]
  const homeUrl = absoluteUrl(`/${locale}`)
  const pageUrl = absoluteUrl(`/${locale}/privacy`)

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${pageUrl}/#webpage`,
    url: pageUrl,
    name: dict.privacy.metaTitle,
    description: dict.privacy.metaDescription,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#organization` },
    inLanguage: lang,
  }

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: SITE_NAME,
        item: homeUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: dict.privacy.title,
        item: pageUrl,
      },
    ],
  }

  return (
    <>
      <JsonLdScript data={webPage} />
      <JsonLdScript data={breadcrumb} />
    </>
  )
}
