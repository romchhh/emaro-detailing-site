'use client'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { formatPhoneMask, isValidPhone, phoneForSubmit } from '../lib/phoneMask'
import { submitLead } from '../lib/submitLead'
import { useBrand, useDictionary, useLocale } from '../../i18n/LocaleProvider'
import styles from './ContactSection.module.css'

type FormState = {
  name: string
  phone: string
  service: string
  comment: string
  consent: boolean
  website: string
  fax: string
}
type Status = 'idle' | 'loading' | 'success' | 'error'

export default function ContactSection() {
  const dict = useDictionary()
  const BRAND = useBrand()
  const locale = useLocale()
  const formOpenedAt = useRef(Date.now())
  const [form, setForm] = useState<FormState>({
    name: '',
    phone: '',
    service: '',
    comment: '',
    consent: false,
    website: '',
    fax: '',
  })
  const [status, setStatus] = useState<Status>('idle')

  useEffect(() => {
    formOpenedAt.current = Date.now()
  }, [])

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const val = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setForm((f) => ({ ...f, [k]: val }))
    if (status === 'error') setStatus('idle')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.consent) return
    if (!isValidPhone(form.phone)) {
      setStatus('error')
      return
    }
    setStatus('loading')
    try {
      await submitLead({
        source: 'contact',
        name: form.name,
        phone: phoneForSubmit(form.phone),
        service: form.service,
        comment: form.comment,
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
    <section id="kontakt" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.intro}>
          <h2 className={styles.heading}>
            {dict.contact.heading} <em>{dict.contact.headingEm}</em>
          </h2>
          <p className={styles.lead}>{dict.contact.lead}</p>
        </div>

        <div className={styles.panel}>
          <div className={styles.visual}>
            <Image
              src={BRAND.contactImage}
              alt={dict.contact.visualAlt}
              fill
              sizes="(max-width: 900px) 100vw, 48vw"
              className={styles.img}
            />
            <div className={styles.visualOverlay} aria-hidden="true" />
            <div className={styles.visualContent}>
              <p className={styles.visualLabel}>{dict.contact.visualLabel}</p>
              <p className={styles.visualText}>{dict.contact.visualText}</p>
              <div className={styles.visualContacts}>
                <a href={`tel:${BRAND.phone.replace(/\s/g, '')}`}>{BRAND.phone}</a>
                <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
              </div>
            </div>
          </div>

          <div className={styles.formCard}>
            {status === 'success' ? (
              <div className={styles.success}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="24" cy="24" r="20"/>
                  <path d="M14 24 L21 31 L34 18"/>
                </svg>
                <h3>{dict.contact.successTitle}</h3>
                <p>{dict.contact.successText}</p>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <p className={styles.formTitle}>{dict.contact.formTitle}</p>
                <div className={styles.honeypot} aria-hidden="true">
                  <label htmlFor="company">Leave blank</label>
                  <input
                    id="company"
                    name="company_url"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={set('website')}
                  />
                  <label htmlFor="contact-fax">Fax</label>
                  <input
                    id="contact-fax"
                    name="fax_number"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.fax}
                    onChange={set('fax')}
                  />
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label htmlFor="name">{dict.contact.name}</label>
                    <input id="name" type="text" placeholder={dict.contact.namePh} value={form.name} onChange={set('name')} required autoComplete="name" maxLength={120} />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="phone">{dict.contact.phone}</label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder={dict.contact.phonePh}
                      value={form.phone}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, phone: formatPhoneMask(e.target.value) }))
                        if (status === 'error') setStatus('idle')
                      }}
                      required
                      autoComplete="tel"
                      inputMode="tel"
                    />
                  </div>
                </div>
                <div className={styles.field}>
                  <label htmlFor="service">{dict.contact.service}</label>
                  <div className={styles.selectWrap}>
                    <select id="service" value={form.service} onChange={set('service')}>
                      <option value="">{dict.contact.servicePh}</option>
                      {dict.contact.services.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <svg className={styles.chevron} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--stone)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 6 L8 11 L13 6"/>
                    </svg>
                  </div>
                </div>
                <div className={styles.field}>
                  <label htmlFor="comment">{dict.contact.comment}</label>
                  <textarea id="comment" placeholder={dict.contact.commentPh} rows={3} value={form.comment} onChange={set('comment')} maxLength={1000} />
                </div>
                <label className={styles.consent}>
                  <input type="checkbox" checked={form.consent} onChange={set('consent')} required />
                  <span>{dict.contact.consent}</span>
                </label>
                {status === 'error' && <p className={styles.error}>{dict.contact.error}</p>}
                <button type="submit" className={styles.submit} disabled={!form.consent || status === 'loading'}>
                  {status === 'loading' ? dict.contact.submitting : dict.contact.submit}
                  {status !== 'loading' && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M2 14 L14 2 M6 2 H14 V10"/>
                    </svg>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
