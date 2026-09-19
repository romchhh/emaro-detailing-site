'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BookingTrigger } from './booking/BookingProvider'
import LanguageSwitcher from './LanguageSwitcher'
import { useBodyScrollLock } from '../lib/useBodyScrollLock'
import { useBrand, useDictionary, useLocale } from '../../i18n/LocaleProvider'
import { NAV_SECTIONS, localePath } from '../../i18n/paths'
import styles from './Navbar.module.css'

export default function Navbar({ transparent = false }: { transparent?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dict = useDictionary()
  const locale = useLocale()
  const brand = useBrand()
  const phoneTel = brand.phone.replace(/\s/g, '')
  const phoneDisplay = brand.phone.replace(/^\+48\s*/, '')
  const whatsappHref = brand.whatsapp || `https://wa.me/${phoneTel.replace('+', '')}`

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useBodyScrollLock(menuOpen)

  const onHero = transparent && !scrolled

  return (
    <>
      <nav className={`${styles.nav} ${onHero ? styles.onHero : styles.scrolled}`}>
        <Link href={localePath(locale)} className={styles.brand} aria-label={brand.name}>
          <Image
            src={brand.logo}
            alt={brand.name}
            width={180}
            height={72}
            className={styles.logo}
            priority
          />
        </Link>

        <div className={styles.center}>
          {NAV_SECTIONS.map(({ key, anchor }) => (
            <a key={key} href={localePath(locale, anchor)}>
              {dict.nav[key]}
            </a>
          ))}
        </div>

        <div className={styles.right}>
          <LanguageSwitcher onHero={onHero} />
          <BookingTrigger className={styles.pillBtn}>
            {dict.nav.cta}
          </BookingTrigger>
          <a
            href={whatsappHref}
            className={styles.pillBtn}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`WhatsApp ${brand.phone}`}
          >
            <span className={styles.pillIconWrap}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.52 3.48A11.77 11.77 0 0 0 12.05 0C5.5 0 .17 5.33.17 11.88c0 2.09.55 4.14 1.59 5.95L0 24l6.35-1.66a11.83 11.83 0 0 0 5.69 1.45h.01c6.55 0 11.88-5.33 11.88-11.88 0-3.17-1.23-6.14-3.41-8.43Zm-8.47 18.3h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.77.99 1.01-3.68-.24-.38a9.85 9.85 0 0 1-1.51-5.24c0-5.45 4.44-9.89 9.9-9.89a9.8 9.8 0 0 1 7.01 2.91 9.83 9.83 0 0 1 2.89 7c0 5.46-4.44 9.9-9.88 9.9Zm5.43-7.43c-.3-.15-1.76-.87-2.04-.96-.27-.1-.47-.15-.67.15-.2.3-.76.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.45-.88-.79-1.47-1.76-1.64-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.08-.79.38-.27.3-1.03 1-1.03 2.44s1.05 2.82 1.2 3.02c.15.2 2.06 3.15 4.99 4.42.7.3 1.24.48 1.67.61.7.22 1.34.19 1.85.12.56-.08 1.76-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35Z" />
              </svg>
            </span>
            {phoneDisplay}
          </a>
        </div>

        <div className={styles.mobileActions}>
          <LanguageSwitcher onHero={onHero} />
          <a href={whatsappHref} className={styles.pillBtn} target="_blank" rel="noopener noreferrer">
            <span className={styles.pillIconWrap}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.52 3.48A11.77 11.77 0 0 0 12.05 0C5.5 0 .17 5.33.17 11.88c0 2.09.55 4.14 1.59 5.95L0 24l6.35-1.66a11.83 11.83 0 0 0 5.69 1.45h.01c6.55 0 11.88-5.33 11.88-11.88 0-3.17-1.23-6.14-3.41-8.43Zm-8.47 18.3h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.77.99 1.01-3.68-.24-.38a9.85 9.85 0 0 1-1.51-5.24c0-5.45 4.44-9.89 9.9-9.89a9.8 9.8 0 0 1 7.01 2.91 9.83 9.83 0 0 1 2.89 7c0 5.46-4.44 9.9-9.88 9.9Zm5.43-7.43c-.3-.15-1.76-.87-2.04-.96-.27-.1-.47-.15-.67.15-.2.3-.76.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.45-.88-.79-1.47-1.76-1.64-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.08-.79.38-.27.3-1.03 1-1.03 2.44s1.05 2.82 1.2 3.02c.15.2 2.06 3.15 4.99 4.42.7.3 1.24.48 1.67.61.7.22 1.34.19 1.85.12.56-.08 1.76-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35Z" />
              </svg>
            </span>
            {phoneDisplay}
          </a>
          <button type="button" className={styles.hamburger} onClick={() => setMenuOpen(true)} aria-label={dict.nav.openMenu}>
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div className={`${styles.drawer} ${menuOpen ? styles.open : ''}`} role="dialog" aria-modal="true">
        <div className={styles.drawerTop}>
          <Link href={localePath(locale)} className={styles.drawerBrand} onClick={() => setMenuOpen(false)}>
            <Image src={brand.logo} alt={brand.name} width={160} height={64} className={styles.logo} />
          </Link>
          <button className={styles.drawerClose} onClick={() => setMenuOpen(false)} aria-label={dict.nav.closeMenu}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4 L20 20 M20 4 L4 20"/>
            </svg>
          </button>
        </div>
        <nav className={styles.drawerNav} aria-label={dict.nav.mobileNav}>
          {NAV_SECTIONS.map(({ key, anchor }) => (
            <a key={key} href={localePath(locale, anchor)} onClick={() => setMenuOpen(false)}>
              {dict.nav[key]}
            </a>
          ))}
        </nav>
        <div className={styles.drawerActions}>
          <LanguageSwitcher />
          <BookingTrigger className={styles.drawerCta} onClick={() => setMenuOpen(false)}>
            <span className={styles.drawerCtaLabel}>{dict.nav.cta}</span>
            <span className={styles.drawerCtaIcon} aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 14 L14 2 M6 2 H14 V10" />
              </svg>
            </span>
          </BookingTrigger>
        </div>
      </div>
    </>
  )
}
