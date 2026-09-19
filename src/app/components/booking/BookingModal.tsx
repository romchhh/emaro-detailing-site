'use client'

import { useEffect, useRef, useState } from 'react'
import { formatPhoneMask, isValidPhone, phoneForSubmit } from '../../lib/phoneMask'
import { submitLead } from '../../lib/submitLead'
import { useBrand, useDictionary, useLocale } from '../../../i18n/LocaleProvider'
import styles from './BookingModal.module.css'

type FormState = { name: string; phone: string; email: string; website: string; fax: string }
type Status = 'idle' | 'loading' | 'success' | 'error'

function SubmitArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 14 L14 2 M6 2 H14 V10" />
    </svg>
  )
}

function TelegramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.32 13.53c-.22.62-1.28 1.18-1.76 1.25-.45.07-.98.1-1.58-.1-.36-.12-.83-.3-1.43-.58-2.52-1.09-4.16-3.64-4.28-3.81-.12-.17-1.02-1.36-1.02-2.59 0-1.23.64-1.84.87-2.09.22-.25.49-.31.65-.31.16 0 .33 0 .47.01.15.01.35-.06.55.42.2.48.68 1.66.74 1.78.06.12.1.26.02.42-.08.16-.12.26-.24.4-.12.14-.25.31-.36.42-.12.12-.24.25-.1.49.13.24.58.96 1.25 1.55.86.76 1.58 1 1.82 1.11.24.11.38.1.52-.06.14-.16.6-.7.76-.94.16-.24.32-.2.54-.12.22.08 1.4.66 1.64.78.24.12.4.18.46.28.06.1.06.58-.16 1.2z" />
    </svg>
  )
}

const emptyForm = (): FormState => ({ name: '', phone: '', email: '', website: '', fax: '' })

export default function BookingModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const dict = useDictionary()
  const locale = useLocale()
  const brand = useBrand()
  const dialogRef = useRef<HTMLDivElement>(null)
  const formOpenedAt = useRef(Date.now())
  const [form, setForm] = useState<FormState>(emptyForm)
  const [status, setStatus] = useState<Status>('idle')

  useEffect(() => {
    if (!isOpen) {
      setStatus('idle')
      setForm(emptyForm())
      return
    }

    formOpenedAt.current = Date.now()
    dialogRef.current?.focus()
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!isValidPhone(form.phone)) {
      setStatus('error')
      return
    }
    setStatus('loading')
    try {
      await submitLead({
        source: 'booking',
        name: form.name,
        phone: phoneForSubmit(form.phone),
        email: form.email,
        locale,
        website: form.website,
        fax: form.fax,
        formOpenedAt: formOpenedAt.current,
      })
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        ref={dialogRef}
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.handle} aria-hidden="true" />

        {status === 'success' ? (
          <div className={styles.success}>
            <svg width="52" height="52" viewBox="0 0 48 48" fill="none" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="24" cy="24" r="20" />
              <path d="M14 24 L21 31 L34 18" />
            </svg>
            <h2 id="booking-modal-title" className={styles.title}>{dict.booking.successTitle}</h2>
            <p className={styles.successText}>{dict.booking.successText}</p>
            <button type="button" className={styles.submit} onClick={onClose}>
              <span className={styles.submitLabel}>{dict.booking.close}</span>
              <span className={styles.submitIcon}>
                <SubmitArrowIcon />
              </span>
            </button>
          </div>
        ) : (
          <>
            <h2 id="booking-modal-title" className={styles.title}>{dict.booking.modalTitle}</h2>

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <div className={styles.honeypot} aria-hidden="true">
                <label htmlFor="booking-company">Leave blank</label>
                <input
                  id="booking-company"
                  name="company_url"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.website}
                  onChange={(event) => setForm((prev) => ({ ...prev, website: event.target.value }))}
                />
                <label htmlFor="booking-fax">Fax</label>
                <input
                  id="booking-fax"
                  name="fax_number"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.fax}
                  onChange={(event) => setForm((prev) => ({ ...prev, fax: event.target.value }))}
                />
              </div>
              <input
                id="booking-name"
                type="text"
                className={styles.input}
                placeholder={dict.booking.namePh}
                value={form.name}
                onChange={(event) => {
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                  if (status === 'error') setStatus('idle')
                }}
                required
                autoComplete="name"
                maxLength={120}
              />
              <input
                id="booking-phone"
                type="tel"
                className={styles.input}
                placeholder={dict.booking.phonePh}
                value={form.phone}
                onChange={(event) => {
                  setForm((prev) => ({ ...prev, phone: formatPhoneMask(event.target.value) }))
                  if (status === 'error') setStatus('idle')
                }}
                required
                autoComplete="tel"
                inputMode="tel"
              />
              <input
                id="booking-email"
                type="email"
                className={styles.input}
                placeholder={dict.booking.emailPh}
                value={form.email}
                onChange={(event) => {
                  setForm((prev) => ({ ...prev, email: event.target.value }))
                  if (status === 'error') setStatus('idle')
                }}
                autoComplete="email"
                maxLength={120}
              />

              {status === 'error' && <p className={styles.error}>{dict.booking.error}</p>}

              <button type="submit" className={styles.submit} disabled={status === 'loading'}>
                <span className={styles.submitLabel}>
                  {status === 'loading' ? dict.booking.submitting : dict.booking.submit}
                </span>
                <span className={styles.submitIcon}>
                  <SubmitArrowIcon />
                </span>
              </button>

              <p className={styles.consent}>{dict.booking.consent}</p>
            </form>

            <div className={styles.altContact}>
              <span className={styles.or}>{dict.booking.or}</span>
              <p className={styles.socialLine}>
                <span>{dict.booking.socialLead}</span>
                <a
                  href={brand.telegram}
                  className={`${styles.socialLink} ${styles.socialTelegram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <TelegramIcon />
                  {dict.booking.telegram}
                </a>
                <a
                  href={brand.whatsapp}
                  className={`${styles.socialLink} ${styles.socialWhatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsAppIcon />
                  {dict.booking.whatsapp}
                </a>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
