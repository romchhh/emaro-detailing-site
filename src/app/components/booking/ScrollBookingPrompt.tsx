'use client'

import { useBrand, useDictionary } from '../../../i18n/LocaleProvider'
import styles from './ScrollBookingPrompt.module.css'

export default function ScrollBookingPrompt({
  visible,
  onBook,
  onDismiss,
}: {
  visible: boolean
  onBook: () => void
  onDismiss: () => void
}) {
  const dict = useDictionary()
  const brand = useBrand()
  const whatsappHref = brand.whatsapp

  return (
    <div
      className={`${styles.dock} ${visible ? styles.dockVisible : ''}`}
      aria-hidden={!visible}
    >
      <a
        href={whatsappHref}
        className={styles.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`WhatsApp ${brand.phone}`}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.52 3.48A11.77 11.77 0 0 0 12.05 0C5.5 0 .17 5.33.17 11.88c0 2.09.55 4.14 1.59 5.95L0 24l6.35-1.66a11.83 11.83 0 0 0 5.69 1.45h.01c6.55 0 11.88-5.33 11.88-11.88 0-3.17-1.23-6.14-3.41-8.43Zm-8.47 18.3h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.77.99 1.01-3.68-.24-.38a9.85 9.85 0 0 1-1.51-5.24c0-5.45 4.44-9.89 9.9-9.89a9.8 9.8 0 0 1 7.01 2.91 9.83 9.83 0 0 1 2.89 7c0 5.46-4.44 9.9-9.88 9.9Zm5.43-7.43c-.3-.15-1.76-.87-2.04-.96-.27-.1-.47-.15-.67.15-.2.3-.76.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.45-.88-.79-1.47-1.76-1.64-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.08-.79.38-.27.3-1.03 1-1.03 2.44s1.05 2.82 1.2 3.02c.15.2 2.06 3.15 4.99 4.42.7.3 1.24.48 1.67.61.7.22 1.34.19 1.85.12.56-.08 1.76-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35Z" />
        </svg>
      </a>

      <aside className={styles.prompt}>
        <button type="button" className={styles.dismiss} onClick={onDismiss} aria-label={dict.booking.close}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M3 3 L11 11 M11 3 L3 11" />
          </svg>
        </button>
        <p className={styles.title}>{dict.booking.promptTitle}</p>
        <p className={styles.text}>{dict.booking.promptText}</p>
        <button type="button" className={styles.btn} onClick={onBook}>
          {dict.booking.promptBtn}
        </button>
      </aside>
    </div>
  )
}
