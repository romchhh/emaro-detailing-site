'use client'

import Image from 'next/image'
import { BookingTrigger } from '../booking/BookingProvider'

import { useAboutImages, useDictionary } from '../../../i18n/LocaleProvider'
import { SectionHeading } from './SectionHeading'
import styles from './sections.module.css'

export default function AboutSection() {
  const dict = useDictionary()
  const { team: ABOUT_TEAM_IMAGE, cta: ABOUT_CTA_IMAGE } = useAboutImages()

  return (
    <section id="o-nas" className={`${styles.section} ${styles.aboutSection}`}>
      <div className={styles.inner}>
        <SectionHeading
          title={<>{dict.about.titleBefore}<em>{dict.about.titleEm}</em></>}
        />
        <div className={styles.aboutLayout}>
          <div className={styles.aboutCopy}>
            {dict.about.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
          <div className={styles.aboutMedia}>
            <Image
              src={ABOUT_TEAM_IMAGE.src}
              alt={dict.about.teamImageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 420px"
              className={styles.aboutImage}
              style={{ objectPosition: ABOUT_TEAM_IMAGE.position }}
            />
          </div>
        </div>

        <div className={styles.aboutCtaCard}>
          <div className={styles.aboutCtaInner}>
            <div className={styles.aboutCtaContent}>
              <h3 className={styles.aboutCtaTitle}>{dict.about.ctaTitle}</h3>
              <p className={styles.aboutCtaSub}>{dict.about.ctaText}</p>
              <BookingTrigger className={styles.aboutCtaBtn}>
                <span className={styles.aboutCtaBtnLabel}>{dict.about.ctaBtn}</span>
                <span className={styles.aboutCtaBtnIcon} aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 14 L14 2 M6 2 H14 V10" />
                  </svg>
                </span>
              </BookingTrigger>
            </div>

            <div className={styles.aboutCtaMedia}>
              <Image
                src={ABOUT_CTA_IMAGE.src}
                alt={dict.about.ctaImageAlt}
                fill
                sizes="(max-width: 768px) 280px, 420px"
                className={styles.aboutCtaImage}
                style={{ objectPosition: ABOUT_CTA_IMAGE.position }}
                priority={false}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
