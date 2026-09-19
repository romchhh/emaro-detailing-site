'use client'

import Image from 'next/image'
import Link from 'next/link'
import { BookingTrigger } from './booking/BookingProvider'
import InstagramIcon from './InstagramIcon'
import { useBrand, useDictionary, useLocale } from '../../i18n/LocaleProvider'
import { NAV_SECTIONS, localePath } from '../../i18n/paths'
import styles from './Footer.module.css'

export default function Footer() {
  const dict = useDictionary()
  const BRAND = useBrand()
  const locale = useLocale()

  return (
    <footer id="site-footer" className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.top}>
          <div className={styles.brandBlock}>
            <Link href={localePath(locale)} className={styles.logoLink} aria-label={BRAND.name}>
              <Image
                src={BRAND.logo}
                alt=""
                width={140}
                height={56}
                className={styles.logo}
              />
            </Link>
            <div className={styles.contacts}>
              <h3 className={styles.infoLabel}>{dict.footer.contactsTitle}</h3>
              <p className={styles.brandName}>{BRAND.name}</p>
              <p className={styles.infoValue}>{BRAND.address}</p>
              <p className={styles.infoValue}>{BRAND.city}</p>
              <a href={`tel:${BRAND.phone.replace(/\s/g, '')}`} className={styles.infoLink}>
                {BRAND.phone}
              </a>
              <a href={`mailto:${BRAND.email}`} className={styles.infoLink}>
                {BRAND.email}
              </a>
            </div>
            <BookingTrigger className={styles.cta}>
              {dict.nav.cta}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 14 L14 2 M6 2 H14 V10" />
              </svg>
            </BookingTrigger>
          </div>

          <div className={styles.infoItem}>
            <h3 className={styles.infoLabel}>{dict.footer.navLabel}</h3>
            <nav className={styles.footerNav} aria-label={dict.footer.navLabel}>
              {dict.footer.links.map((label, i) => (
                <a key={label} href={localePath(locale, NAV_SECTIONS[i]?.anchor ?? '#kontakt')}>
                  {label}
                </a>
              ))}
            </nav>
          </div>

          <div className={styles.infoItem}>
            <h3 className={styles.infoLabel}>{dict.footer.social}</h3>
            <a
              href={BRAND.instagram}
              className={styles.socialLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram @emaro.premium"
            >
              <InstagramIcon size={24} />
              <span>{dict.footer.instagramLabel}</span>
            </a>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>© {new Date().getFullYear()} {BRAND.name}. {dict.footer.rights}</span>
          <div className={styles.bottomLinks}>
            <Link href={localePath(locale, '/privacy')} className={styles.privacyLink}>
              {dict.footer.privacy}
            </Link>
            <span className={styles.credit}>
              {dict.footer.developedBy}{' '}
              <a
                href="https://telebots.site/en"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.creditLink}
              >
                TeleBots
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
