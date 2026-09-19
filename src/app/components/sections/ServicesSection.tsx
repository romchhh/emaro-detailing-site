'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { BookingTrigger } from '../booking/BookingProvider'
import { SERVICE_CATEGORIES, type ServiceItem } from '../../data/siteContent'
import type { Dictionary } from '../../../i18n/types'
import { useDictionary, useServices } from '../../../i18n/LocaleProvider'
import { SectionHeading } from './SectionHeading'
import styles from './sections.module.css'

const THEME_CLASS = {
  dark: styles.serviceDark,
  photo: styles.servicePhoto,
  photoAlt: styles.servicePhotoAlt,
  light: styles.serviceLight,
} as const

const TAG_VARIANTS = [
  styles.servicePriceTag0,
  styles.servicePriceTag1,
  styles.servicePriceTag2,
  styles.servicePriceTag3,
] as const

function ServiceCarousel({
  services,
  dict,
}: {
  services: ServiceItem[]
  dict: Dictionary
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)

  const updateNav = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const { scrollLeft, scrollWidth, clientWidth } = track
    setCanPrev(scrollLeft > 8)
    setCanNext(scrollLeft + clientWidth < scrollWidth - 8)
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    updateNav()
    track.addEventListener('scroll', updateNav, { passive: true })
    window.addEventListener('resize', updateNav)
    return () => {
      track.removeEventListener('scroll', updateNav)
      window.removeEventListener('resize', updateNav)
    }
  }, [updateNav, services])

  const scroll = (direction: 'prev' | 'next') => {
    const track = trackRef.current
    if (!track) return
    const slide = track.querySelector<HTMLElement>(`.${styles.serviceCard}`)
    const gap = 20
    const amount = slide ? slide.offsetWidth + gap : track.clientWidth * 0.8
    track.scrollBy({ left: direction === 'next' ? amount : -amount, behavior: 'smooth' })
  }

  return (
    <div className={styles.servicesCarousel}>
      <button
        type="button"
        className={`${styles.carouselArrow} ${styles.carouselArrowPrev}`}
        onClick={() => scroll('prev')}
        disabled={!canPrev}
        aria-label={dict.services.prev}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M11 3 L5 9 L11 15" />
        </svg>
      </button>

      <div className={styles.servicesViewport}>
        <div ref={trackRef} className={styles.servicesRow}>
          {services.map((service, index) => {
            const copy = dict.services.items[service.id]

            return (
              <article
                key={service.id}
                className={`${styles.serviceCard} ${THEME_CLASS[service.theme]}`}
              >
                <div
                  className={`${styles.servicePriceTag} ${TAG_VARIANTS[index % TAG_VARIANTS.length]}`}
                  aria-label={copy.price}
                >
                  {copy.price}
                </div>

                <div className={styles.serviceMedia}>
                  <Image
                    src={service.image}
                    alt={copy.title}
                    fill
                    sizes="(max-width: 768px) 82vw, 360px"
                    className={styles.serviceImage}
                    style={{ objectPosition: service.imagePosition ?? 'center' }}
                  />
                </div>

                <div className={styles.serviceBody}>
                  <h3 className={styles.serviceTitle}>{copy.title}</h3>
                  <p className={styles.serviceText}>{copy.description}</p>
                  <BookingTrigger className={styles.serviceBtn}>
                    {dict.services.book}
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M2 12 L12 2 M5 2 H12 V9" />
                    </svg>
                  </BookingTrigger>
                </div>
              </article>
            )
          })}
        </div>
      </div>

      <button
        type="button"
        className={`${styles.carouselArrow} ${styles.carouselArrowNext}`}
        onClick={() => scroll('next')}
        disabled={!canNext}
        aria-label={dict.services.next}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M7 3 L13 9 L7 15" />
        </svg>
      </button>
    </div>
  )
}

export default function ServicesSection() {
  const dict = useDictionary()
  const SERVICES = useServices()

  return (
    <section id="uslugi" className={`${styles.section} ${styles.servicesSection}`}>
      <div className={styles.inner}>
        <SectionHeading
          title={<>{dict.services.titleBefore}<em>{dict.services.titleEm}</em></>}
        />

        {SERVICE_CATEGORIES.map((category) => {
          const categoryServices = SERVICES.filter((service) => service.category === category)
          if (categoryServices.length === 0) return null

          return (
            <div key={category} className={styles.categoryBlock}>
              <h3 className={styles.categoryTitle}>{dict.services.categories[category]}</h3>
              <ServiceCarousel services={categoryServices} dict={dict} />
            </div>
          )
        })}

        <div className={styles.servicesNotes}>
          <p className={styles.servicesNote}>{dict.services.notes.join(' ')}</p>
        </div>
      </div>
    </section>
  )
}
