'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'

import { useBodyScrollLock } from '../../lib/useBodyScrollLock'
import { useDictionary, useGallery } from '../../../i18n/LocaleProvider'
import { SectionHeading } from './SectionHeading'
import styles from './sections.module.css'

export default function GallerySection() {
  const dict = useDictionary()
  const GALLERY_IMAGES = useGallery()
  const [activeId, setActiveId] = useState<string | null>(null)

  const activeIndex = GALLERY_IMAGES.findIndex((item) => item.id === activeId)
  const activeItem = activeIndex >= 0 ? GALLERY_IMAGES[activeIndex] : null

  const closeLightbox = useCallback(() => setActiveId(null), [])

  useBodyScrollLock(Boolean(activeItem))

  const showPrev = useCallback(() => {
    if (activeIndex <= 0) {
      setActiveId(GALLERY_IMAGES[GALLERY_IMAGES.length - 1]?.id ?? null)
      return
    }
    setActiveId(GALLERY_IMAGES[activeIndex - 1].id)
  }, [activeIndex, GALLERY_IMAGES])

  const showNext = useCallback(() => {
    if (activeIndex < 0 || activeIndex >= GALLERY_IMAGES.length - 1) {
      setActiveId(GALLERY_IMAGES[0]?.id ?? null)
      return
    }
    setActiveId(GALLERY_IMAGES[activeIndex + 1].id)
  }, [activeIndex, GALLERY_IMAGES])

  useEffect(() => {
    if (!activeItem) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeLightbox()
      if (event.key === 'ArrowLeft') showPrev()
      if (event.key === 'ArrowRight') showNext()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeItem, closeLightbox, showPrev, showNext])

  return (
    <section id="galeria" className={`${styles.section} ${styles.gallerySection}`}>
      <div className={styles.inner}>
        <SectionHeading
          title={<><em>{dict.gallery.titleEm}</em></>}
          lead={dict.gallery.placeholder}
        />

        <div className={styles.galleryGrid}>
          {GALLERY_IMAGES.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.galleryItem} ${index === 0 ? styles.galleryFeatured : ''}`}
              onClick={() => setActiveId(item.id)}
              aria-label={dict.gallery.alts[item.id]}
            >
              {item.kind === 'video' ? (
                <>
                  <video
                    src={item.src}
                    className={styles.galleryImage}
                    style={{ objectPosition: item.position }}
                    muted
                    playsInline
                    preload="metadata"
                    draggable={false}
                  />
                  <span className={styles.galleryPlayBadge} aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </>
              ) : (
                <Image
                  src={item.src}
                  alt=""
                  fill
                  sizes={index === 0 ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 50vw, 33vw'}
                  className={styles.galleryImage}
                  style={{ objectPosition: item.position }}
                  draggable={false}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {activeItem && (
        <div
          className={styles.galleryLightbox}
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={dict.gallery.alts[activeItem.id]}
        >
          <div
            className={styles.galleryLightboxPanel}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.galleryLightboxClose}
              onClick={closeLightbox}
              aria-label={dict.booking.close}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M4 4 L14 14 M14 4 L4 14" />
              </svg>
            </button>

            <button
              type="button"
              className={`${styles.galleryLightboxNav} ${styles.galleryLightboxNavPrev}`}
              onClick={showPrev}
              aria-label={dict.services.prev}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 3 L5 9 L11 15" />
              </svg>
            </button>

            <button
              type="button"
              className={`${styles.galleryLightboxNav} ${styles.galleryLightboxNavNext}`}
              onClick={showNext}
              aria-label={dict.services.next}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 3 L13 9 L7 15" />
              </svg>
            </button>

            <div className={styles.galleryLightboxMedia}>
              {activeItem.kind === 'video' ? (
                <video
                  key={activeItem.id}
                  src={activeItem.src}
                  className={styles.galleryLightboxVideo}
                  controls
                  playsInline
                  autoPlay
                  preload="metadata"
                />
              ) : (
                <Image
                  src={activeItem.src}
                  alt={dict.gallery.alts[activeItem.id]}
                  fill
                  sizes="100vw"
                  className={styles.galleryLightboxImage}
                  style={{ objectPosition: activeItem.position }}
                  priority
                  draggable={false}
                />
              )}
            </div>

            <p className={styles.galleryLightboxCaption}>{dict.gallery.alts[activeItem.id]}</p>
          </div>
        </div>
      )}
    </section>
  )
}
