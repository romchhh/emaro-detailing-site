'use client'

import Image from 'next/image'
import { BookingTrigger } from './booking/BookingProvider'
import { useBrand, useDictionary } from '../../i18n/LocaleProvider'
import styles from './Hero.module.css'

export default function Hero() {
  const dict = useDictionary()
  const BRAND = useBrand()
  const { lines, accent, pillars, cardLabel, cardTitle, cardSub } = dict.hero

  return (
    <section id="hero" className={styles.hero} aria-label={BRAND.name}>
      <div className={styles.bg} aria-hidden="true">
        <Image
          src={BRAND.heroDesktop}
          alt=""
          fill
          priority
          sizes="100vw"
          className={`${styles.bgImage} ${styles.bgDesktop}`}
        />
        <Image
          src={BRAND.heroMobile}
          alt=""
          fill
          sizes="100vw"
          loading="lazy"
          className={`${styles.bgImage} ${styles.bgMobile}`}
        />
      </div>
      <div className={styles.overlay} />

      <div className={styles.body}>
        <div className={styles.copy}>
          <h1 className={styles.headline}>
            {lines.map((line, i) => {
              const idx = line.toLowerCase().indexOf(accent.toLowerCase())

              return (
                <span key={line}>
                  {i > 0 && <br />}
                  {idx >= 0 ? (
                    <>
                      {line.slice(0, idx)}
                      <span className={styles.accent}>{line.slice(idx, idx + accent.length)}</span>
                      {line.slice(idx + accent.length)}
                    </>
                  ) : (
                    line
                  )}
                </span>
              )
            })}
          </h1>

          <p className={styles.pillars} aria-label={pillars.join(', ')}>
            {pillars.map((item, i) => (
              <span key={item}>
                {i > 0 && <span className={styles.pillarSep} aria-hidden="true">|</span>}
                {item}
              </span>
            ))}
          </p>
        </div>

        <div className={styles.bottomRow}>
          <div className={styles.contact}>
            <a className={styles.phone} href={`tel:${BRAND.phone.replace(/\s/g, '')}`}>
              {BRAND.phone}
            </a>
            <address className={styles.address}>
              {BRAND.address}
              <br />
              {BRAND.city}
            </address>
          </div>

          <BookingTrigger className={styles.card}>
            <div className={styles.cardText}>
              <p className={styles.cardLabel}>{cardLabel}</p>
              <p className={styles.cardTitle}>{cardTitle}</p>
              <p className={styles.cardSub}>
                {cardSub.split('\n').map((line, i) => (
                  <span key={`${line}-${i}`}>
                    {i > 0 && <br />}
                    {line}
                  </span>
                ))}
              </p>
            </div>
            <div className={styles.cardArrow}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 14 L14 2 M6 2 H14 V10" />
              </svg>
            </div>
          </BookingTrigger>
        </div>
      </div>
    </section>
  )
}
