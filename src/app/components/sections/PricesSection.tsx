'use client'

import Image from 'next/image'
import { BookingTrigger } from '../booking/BookingProvider'
import type { ServiceItem } from '../../data/siteContent'
import type { Dictionary } from '../../../i18n/types'
import { useDictionary, useServices } from '../../../i18n/LocaleProvider'
import styles from './sections.module.css'

const CARS_BENTO_LAYOUT = [
  { id: 'cars-interior', variant: 'hero' },
  { id: 'cars-seats-leather', variant: 'stackTop' },
  { id: 'cars-seats-fabric', variant: 'stackBottom' },
  { id: 'cars-exterior', variant: 'tall' },
] as const

const BENTO_VARIANT_CLASS = {
  hero: styles.bentoHero,
  stackTop: styles.bentoStackTop,
  stackBottom: styles.bentoStackBottom,
  tall: styles.bentoTall,
} as const

const BENTO_ROAD_IMAGE =
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80'

function BentoArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 14 L14 2 M6 2 H14 V10" />
    </svg>
  )
}

function CarsBentoGrid({
  dict,
  services,
}: {
  dict: Dictionary
  services: ServiceItem[]
}) {
  const serviceMap = new Map(services.map((service) => [service.id, service]))

  return (
    <div className={styles.pricesBentoWrap}>
      <div className={styles.pricesBentoHeader}>
        <div className={styles.pricesBentoHeading}>
          <span className={styles.pricesBentoTitleLine}>
            {dict.prices.titleBefore}
            <em>{dict.prices.titleEm}</em>
          </span>
          <span className={styles.pricesBentoTitleAccent}>{dict.prices.categories.cars}</span>
        </div>
        <div className={styles.pricesBentoLeadWrap}>
          <span className={styles.pricesBentoSlash} aria-hidden="true">/</span>
          <p className={styles.pricesBentoLead}>{dict.prices.bentoLead}</p>
        </div>
      </div>

      <div className={styles.pricesBentoGrid}>
        {CARS_BENTO_LAYOUT.map(({ id, variant }, index) => {
          const service = serviceMap.get(id)
          if (!service) return null

          const priceCopy = dict.prices.items[id]
          const variantClass = BENTO_VARIANT_CLASS[variant]
          const cardText = priceCopy.summary ?? dict.services.items[id].description

          return (
            <article
              key={id}
              className={`${styles.bentoCard} ${variantClass}`}
            >
                {variant === 'stackTop' ? (
                  <div className={styles.bentoFloatMedia} aria-hidden="true">
                    <Image
                      src={service.image}
                      alt=""
                      fill
                      sizes="220px"
                      className={styles.bentoFloatImage}
                      style={{ objectPosition: service.imagePosition ?? 'center' }}
                    />
                  </div>
                ) : (
                  <div className={styles.bentoMedia}>
                    <Image
                      src={service.image}
                      alt={priceCopy.title}
                      fill
                      sizes="(max-width: 900px) 100vw, 420px"
                      className={styles.bentoImage}
                      style={{ objectPosition: service.imagePosition ?? 'center' }}
                    />
                  </div>
                )}

              {variant !== 'stackTop' && <div className={styles.bentoOverlay} aria-hidden="true" />}

              <div className={styles.bentoTopRow}>
                <BookingTrigger className={styles.bentoArrowBtn} aria-label={dict.prices.book}>
                  <BentoArrowIcon />
                </BookingTrigger>
              </div>

              <div className={styles.bentoBody}>
                <h4 className={styles.bentoCardTitle}>{priceCopy.title}</h4>
                <p className={styles.bentoCardText}>{cardText}</p>
                <span
                  className={`${styles.bentoPriceTag} ${styles[`bentoPriceTag${index % 4}`]}`}
                  aria-label={priceCopy.price}
                >
                  {priceCopy.price}
                </span>
                <BookingTrigger className={styles.bentoBookBtn}>{dict.prices.book}</BookingTrigger>
              </div>
            </article>
          )
        })}

        <article className={`${styles.bentoCard} ${styles.bentoAccent}`}>
          <div className={styles.bentoAccentInner}>
            <span className={styles.bentoAccentIcon} aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="14" cy="10" r="4" />
                <path d="M6 24 C6 19 9.5 16 14 16 C18.5 16 22 19 22 24" />
                <path d="M19 8 L21 6 M22 11 L24 11" />
              </svg>
            </span>
            <div className={styles.bentoAccentCopy}>
              <p className={styles.bentoAccentTitle}>{dict.prices.bentoAccentTitle}</p>
              <p className={styles.bentoAccentSub}>{dict.prices.bentoAccentSub}</p>
            </div>
          </div>
        </article>

        <article className={`${styles.bentoCard} ${styles.bentoWide}`}>
          <div className={styles.bentoMedia}>
            <Image
              src={BENTO_ROAD_IMAGE}
              alt=""
              fill
              sizes="(max-width: 900px) 100vw, 760px"
              className={styles.bentoImage}
              style={{ objectPosition: 'center' }}
            />
          </div>
          <div className={styles.bentoOverlay} aria-hidden="true" />
          <div className={styles.bentoWideBody}>
            <p className={styles.bentoWideSub}>{dict.prices.bentoWideSub}</p>
            <p className={styles.bentoWideTitle}>{dict.prices.bentoWideTitle}</p>
            <BookingTrigger className={styles.bentoWideBtn}>{dict.prices.book}</BookingTrigger>
          </div>
        </article>
      </div>
    </div>
  )
}

function FleetCategoryGrid({
  category,
  dict,
  services,
}: {
  category: 'vans' | 'trucks'
  dict: Dictionary
  services: ServiceItem[]
}) {
  const categoryServices = services.filter((service) => service.category === category)
  if (categoryServices.length === 0) return null

  return (
    <div className={styles.fleetCategory}>
      <div className={styles.fleetCategoryHead}>
        <h3 className={styles.fleetCategoryTitle}>{dict.prices.categories[category]}</h3>
      </div>

      <div className={styles.fleetList}>
        {categoryServices.map((service) => {
          const copy = dict.prices.items[service.id]
          const cardText = copy.summary ?? dict.services.items[service.id].description

          return (
            <article key={service.id} className={styles.fleetRow}>
              <div className={styles.fleetRowMedia}>
                <Image
                  src={service.image}
                  alt={copy.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 240px"
                  className={styles.fleetRowImage}
                  style={{ objectPosition: service.imagePosition ?? 'center' }}
                />
              </div>

              <div className={styles.fleetRowContent}>
                <div className={styles.fleetRowCopy}>
                  <h4 className={styles.fleetRowTitle}>{copy.title}</h4>
                  <p className={styles.fleetRowText}>{cardText}</p>
                </div>

                <div className={styles.fleetRowAside}>
                  <span className={styles.fleetPrice}>{copy.price}</span>
                  <BookingTrigger className={styles.fleetBtn}>{dict.prices.book}</BookingTrigger>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

export default function PricesSection() {
  const dict = useDictionary()
  const SERVICES = useServices()
  const fleetServices = SERVICES.filter((service) => service.category !== 'cars')

  return (
    <section id="ceny" className={`${styles.section} ${styles.pricesSection}`}>
      <div className={styles.inner}>
        <CarsBentoGrid
          dict={dict}
          services={SERVICES.filter((service) => service.category === 'cars')}
        />

        <FleetCategoryGrid category="vans" dict={dict} services={fleetServices} />
        <FleetCategoryGrid category="trucks" dict={dict} services={fleetServices} />

        <p className={styles.priceDisclaimer}>{dict.prices.note}</p>
      </div>
    </section>
  )
}
