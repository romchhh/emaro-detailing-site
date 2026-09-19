'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { formatPhoneMask } from '@/app/lib/phoneMask'
import { adminFetch } from '../adminApi'
import MediaField from '../MediaField'
import {
  AdminCard,
  AdminPageHeader,
  DangerButton,
  GhostButton,
  PrimaryButton,
} from '../AdminUi'
import ui from '../AdminUi.module.css'
import styles from './ContentView.module.css'
import type { Dictionary } from '@/i18n/types'
import type {
  BrandSettings,
  CmsBeforeAfterItem,
  CmsGalleryItem,
  CmsReview,
  CmsService,
  Localized,
} from '@/lib/cms/types'

type ContentPayload = {
  brand: BrandSettings
  services: CmsService[]
  gallery: CmsGalleryItem[]
  beforeAfter: CmsBeforeAfterItem[]
  reviews: CmsReview[]
  copy: { pl: Dictionary; uk: Dictionary }
}

type Tab =
  | 'brand'
  | 'services'
  | 'gallery'
  | 'beforeAfter'
  | 'reviews'
  | 'texts'

const TABS: { id: Tab; label: string }[] = [
  { id: 'brand', label: 'Kontakty / brand' },
  { id: 'services', label: 'Usługi i ceny' },
  { id: 'gallery', label: 'Galeria' },
  { id: 'beforeAfter', label: 'Przed / Po' },
  { id: 'reviews', label: 'Opinie' },
  { id: 'texts', label: 'Teksty PL / UK' },
]

const EMPTY_L: Localized = { pl: '', uk: '' }

function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

function normalizePayload(payload: ContentPayload): ContentPayload {
  return {
    ...payload,
    beforeAfter: payload.beforeAfter.map((item) => ({
      ...item,
      beforeImage: item.beforeImage || '',
      position: item.position || 'center center',
      beforeFilter:
        item.beforeFilter || 'brightness(0.58) saturate(0.42) contrast(1.18)',
      title: item.title || { ...EMPTY_L },
    })),
    gallery: payload.gallery.map((item) => ({
      ...item,
      kind: item.kind === 'video' ? 'video' : item.kind === 'image' ? 'image' : undefined,
      position: item.position || 'center center',
      alt: item.alt || { ...EMPTY_L },
    })),
  }
}

function LField({
  label,
  value,
  onChange,
}: {
  label: string
  value: Localized
  onChange: (next: Localized) => void
}) {
  return (
    <div className={ui.grid2} style={{ gap: 12 }}>
      <label className={ui.field}>
        <span>{label} (PL)</span>
        <textarea
          rows={3}
          value={value?.pl || ''}
          onChange={(e) => onChange({ pl: e.target.value, uk: value?.uk || '' })}
        />
      </label>
      <label className={ui.field}>
        <span>{label} (UK)</span>
        <textarea
          rows={3}
          value={value?.uk || ''}
          onChange={(e) => onChange({ pl: value?.pl || '', uk: e.target.value })}
        />
      </label>
    </div>
  )
}

export default function ContentView() {
  const [data, setData] = useState<ContentPayload | null>(null)
  const [tab, setTab] = useState<Tab>('brand')
  const [localeTab, setLocaleTab] = useState<'pl' | 'uk'>('pl')
  const [textSection, setTextSection] = useState<
    'seo' | 'hero' | 'about' | 'nav' | 'booking' | 'contact' | 'footer'
  >('seo')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [dirty, setDirty] = useState(false)
  const [serviceId, setServiceId] = useState<string | null>(null)
  const [galleryId, setGalleryId] = useState<string | null>(null)
  const [beforeAfterId, setBeforeAfterId] = useState<string | null>(null)
  const [reviewId, setReviewId] = useState<string | null>(null)
  const [draftService, setDraftService] = useState<CmsService | null>(null)
  const [draftGallery, setDraftGallery] = useState<CmsGalleryItem | null>(null)
  const [draftBeforeAfter, setDraftBeforeAfter] = useState<CmsBeforeAfterItem | null>(null)
  const [draftReview, setDraftReview] = useState<CmsReview | null>(null)
  const dataRef = useRef<ContentPayload | null>(null)
  dataRef.current = data

  const load = useCallback(async () => {
    const payload = await adminFetch<ContentPayload & { ok: boolean }>('/api/admin/content')
    const next = normalizePayload({
      brand: payload.brand,
      services: payload.services,
      gallery: payload.gallery,
      beforeAfter: payload.beforeAfter,
      reviews: payload.reviews,
      copy: payload.copy,
    })
    setData(next)
    setDirty(false)
    setServiceId((current) => current || next.services[0]?.id || null)
    setGalleryId((current) => current || next.gallery[0]?.id || null)
    setBeforeAfterId((current) => current || next.beforeAfter[0]?.id || null)
    setReviewId((current) => current || next.reviews[0]?.id || null)
  }, [])

  useEffect(() => {
    void load().catch((err: Error) => setError(err.message))
  }, [load])

  const selectedService = useMemo(
    () => data?.services.find((s) => s.id === serviceId) || null,
    [data, serviceId],
  )
  const selectedGallery = useMemo(
    () => data?.gallery.find((g) => g.id === galleryId) || null,
    [data, galleryId],
  )
  const selectedBeforeAfter = useMemo(
    () => data?.beforeAfter.find((item) => item.id === beforeAfterId) || null,
    [data, beforeAfterId],
  )
  const selectedReview = useMemo(
    () => data?.reviews.find((item) => item.id === reviewId) || null,
    [data, reviewId],
  )

  const serviceForm = draftService ?? selectedService
  const galleryForm = draftGallery ?? selectedGallery
  const beforeAfterForm = draftBeforeAfter ?? selectedBeforeAfter
  const reviewForm = draftReview ?? selectedReview

  function patch(mutator: (draft: ContentPayload) => void) {
    setData((prev) => {
      if (!prev) return prev
      const draft = structuredClone(prev)
      mutator(draft)
      return draft
    })
    setDirty(true)
    setMessage('')
  }

  function updateServiceForm(mutator: (item: CmsService) => void) {
    if (draftService) {
      const next = structuredClone(draftService)
      mutator(next)
      setDraftService(next)
      return
    }
    if (!selectedService) return
    patch((d) => {
      const item = d.services.find((s) => s.id === selectedService.id)
      if (item) mutator(item)
    })
  }

  function updateGalleryForm(mutator: (item: CmsGalleryItem) => void) {
    if (draftGallery) {
      const next = structuredClone(draftGallery)
      mutator(next)
      setDraftGallery(next)
      return
    }
    if (!selectedGallery) return
    patch((d) => {
      const item = d.gallery.find((g) => g.id === selectedGallery.id)
      if (item) mutator(item)
    })
  }

  function updateBeforeAfterForm(mutator: (item: CmsBeforeAfterItem) => void) {
    if (draftBeforeAfter) {
      const next = structuredClone(draftBeforeAfter)
      mutator(next)
      setDraftBeforeAfter(next)
      return
    }
    if (!selectedBeforeAfter) return
    patch((d) => {
      const item = d.beforeAfter.find((row) => row.id === selectedBeforeAfter.id)
      if (item) mutator(item)
    })
  }

  function updateReviewForm(mutator: (item: CmsReview) => void) {
    if (draftReview) {
      const next = structuredClone(draftReview)
      mutator(next)
      setDraftReview(next)
      return
    }
    if (!selectedReview) return
    patch((d) => {
      const item = d.reviews.find((row) => row.id === selectedReview.id)
      if (item) mutator(item)
    })
  }

  async function save() {
    const current = dataRef.current
    if (!current) return
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const payload = await adminFetch<ContentPayload & { ok: boolean }>('/api/admin/content', {
        method: 'PUT',
        body: JSON.stringify(current),
      })
      const next = normalizePayload({
        brand: payload.brand,
        services: payload.services,
        gallery: payload.gallery,
        beforeAfter: payload.beforeAfter,
        reviews: payload.reviews,
        copy: payload.copy,
      })
      setData(next)
      setDirty(false)
      setMessage('Zapisano. Zmiany są widoczne na stronie.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'save_failed')
    } finally {
      setSaving(false)
    }
  }

  function startAddService() {
    setDraftService({
      id: newId('service'),
      category: 'cars',
      image: '',
      imagePosition: 'center center',
      theme: 'photo',
      title: { ...EMPTY_L },
      description: { ...EMPTY_L },
      price: { ...EMPTY_L },
      priceNote: { ...EMPTY_L },
      summary: { ...EMPTY_L },
    })
    setServiceId(null)
    setTab('services')
    setMessage('Wypełnij formularz nowej usługi, potem kliknij „Dodaj do listy”.')
  }

  function confirmAddService() {
    if (!draftService) return
    if (!draftService.title.pl.trim() && !draftService.title.uk.trim()) {
      setError('Podaj tytuł usługi (PL lub UK).')
      return
    }
    const item = structuredClone(draftService)
    patch((d) => {
      d.services.push(item)
    })
    setServiceId(item.id)
    setDraftService(null)
    setError('')
    setMessage('Usługa dodana do listy — zapisz zmiany, aby opublikować.')
  }

  function startAddGallery() {
    setDraftGallery({
      id: newId('g'),
      src: '',
      kind: 'image',
      position: 'center center',
      alt: { ...EMPTY_L },
    })
    setGalleryId(null)
    setTab('gallery')
    setMessage('Dodaj zdjęcie lub wideo (link lub upload), potem „Dodaj do listy”.')
  }

  function confirmAddGallery() {
    if (!draftGallery) return
    if (!draftGallery.src.trim()) {
      setError('Dodaj zdjęcie lub wideo — wgraj plik lub wklej link.')
      return
    }
    const item = structuredClone(draftGallery)
    patch((d) => {
      d.gallery.push(item)
    })
    setGalleryId(item.id)
    setDraftGallery(null)
    setError('')
    setMessage('Element dodany do listy — zapisz zmiany, aby opublikować.')
  }

  function startAddBeforeAfter() {
    setDraftBeforeAfter({
      id: newId('ba'),
      image: '',
      beforeImage: '',
      position: 'center center',
      beforeFilter: 'brightness(0.58) saturate(0.42) contrast(1.18)',
      title: { ...EMPTY_L },
    })
    setBeforeAfterId(null)
    setTab('beforeAfter')
    setMessage('Wypełnij nowy zestaw przed/po, potem „Dodaj do listy”.')
  }

  function confirmAddBeforeAfter() {
    if (!draftBeforeAfter) return
    if (!draftBeforeAfter.image.trim()) {
      setError('Dodaj zdjęcie PO — wgraj plik lub wklej link.')
      return
    }
    const item = structuredClone(draftBeforeAfter)
    patch((d) => {
      d.beforeAfter.push(item)
    })
    setBeforeAfterId(item.id)
    setDraftBeforeAfter(null)
    setError('')
    setMessage('Zestaw dodany do listy — zapisz zmiany, aby opublikować.')
  }

  function startAddReview() {
    setDraftReview({
      id: newId('r'),
      rating: 5,
      name: { ...EMPTY_L },
      text: { ...EMPTY_L },
    })
    setReviewId(null)
    setTab('reviews')
    setMessage('Wypełnij opinię, potem „Dodaj do listy”.')
  }

  function confirmAddReview() {
    if (!draftReview) return
    if (!draftReview.name.pl.trim() && !draftReview.name.uk.trim()) {
      setError('Podaj imię klienta (PL lub UK).')
      return
    }
    const item = structuredClone(draftReview)
    patch((d) => {
      d.reviews.push(item)
    })
    setReviewId(item.id)
    setDraftReview(null)
    setError('')
    setMessage('Opinia dodana do listy — zapisz zmiany, aby opublikować.')
  }

  if (error && !data) return <p className={ui.empty}>Błąd: {error}</p>
  if (!data) return <p className={ui.loading}>Ładowanie treści…</p>

  return (
    <div className={ui.stack}>
      <AdminPageHeader
        title="Zarządzanie treścią"
        description="Edytuj teksty PL/UK, zdjęcia, usługi, ceny, galerię i kontakty. Po zmianach kliknij Zapisz."
        action={
          <PrimaryButton onClick={() => void save()} disabled={saving || !dirty}>
            {saving ? 'Zapisywanie…' : dirty ? 'Zapisz zmiany' : 'Zapisano'}
          </PrimaryButton>
        }
      />

      {message ? <p className={`${styles.banner} ${styles.bannerOk}`}>{message}</p> : null}
      {error ? <p className={`${styles.banner} ${styles.bannerErr}`}>Błąd: {error}</p> : null}

      <div className={styles.tabs}>
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`${styles.tab} ${tab === item.id ? styles.tabActive : ''}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'brand' ? (
        <AdminCard title="Brand i kontakty">
          <div className={ui.stack} style={{ gap: 14 }}>
            <div className={ui.grid2}>
              <label className={ui.field}>
                <span>Nazwa</span>
                <input
                  value={data.brand.name}
                  onChange={(e) =>
                    patch((d) => {
                      d.brand.name = e.target.value
                    })
                  }
                />
              </label>
              <label className={ui.field}>
                <span>Krótka nazwa</span>
                <input
                  value={data.brand.shortName}
                  onChange={(e) =>
                    patch((d) => {
                      d.brand.shortName = e.target.value
                    })
                  }
                />
              </label>
            </div>
            <LField
              label="Tagline"
              value={data.brand.tagline}
              onChange={(value) =>
                patch((d) => {
                  d.brand.tagline = value
                })
              }
            />
            <div className={ui.grid2}>
              <label className={ui.field}>
                <span>Telefon</span>
                <input
                  type="tel"
                  inputMode="tel"
                  value={data.brand.phone}
                  onChange={(e) =>
                    patch((d) => {
                      d.brand.phone = formatPhoneMask(e.target.value)
                    })
                  }
                />
              </label>
              <label className={ui.field}>
                <span>E-mail</span>
                <input
                  value={data.brand.email}
                  onChange={(e) =>
                    patch((d) => {
                      d.brand.email = e.target.value
                    })
                  }
                />
              </label>
              <label className={ui.field}>
                <span>WhatsApp URL</span>
                <input
                  value={data.brand.whatsapp}
                  onChange={(e) =>
                    patch((d) => {
                      d.brand.whatsapp = e.target.value
                    })
                  }
                />
              </label>
              <label className={ui.field}>
                <span>Telegram URL</span>
                <input
                  value={data.brand.telegram}
                  onChange={(e) =>
                    patch((d) => {
                      d.brand.telegram = e.target.value
                    })
                  }
                />
              </label>
              <label className={ui.field}>
                <span>Instagram URL</span>
                <input
                  value={data.brand.instagram}
                  onChange={(e) =>
                    patch((d) => {
                      d.brand.instagram = e.target.value
                    })
                  }
                />
              </label>
              <label className={ui.field}>
                <span>Adres / zasięg</span>
                <input
                  value={data.brand.address}
                  onChange={(e) =>
                    patch((d) => {
                      d.brand.address = e.target.value
                    })
                  }
                />
              </label>
              <label className={ui.field}>
                <span>Miasto</span>
                <input
                  value={data.brand.city}
                  onChange={(e) =>
                    patch((d) => {
                      d.brand.city = e.target.value
                    })
                  }
                />
              </label>
            </div>
            <MediaField
              label="Logo"
              value={data.brand.logo}
              onChange={(url) =>
                patch((d) => {
                  d.brand.logo = url
                })
              }
            />
            <MediaField
              label="Hero desktop"
              value={data.brand.heroDesktop}
              onChange={(url) =>
                patch((d) => {
                  d.brand.heroDesktop = url
                })
              }
            />
            <MediaField
              label="Hero mobile"
              value={data.brand.heroMobile}
              onChange={(url) =>
                patch((d) => {
                  d.brand.heroMobile = url
                })
              }
            />
            <MediaField
              label="Zdjęcie kontakt"
              value={data.brand.contactImage}
              onChange={(url) =>
                patch((d) => {
                  d.brand.contactImage = url
                })
              }
            />
            <MediaField
              label="About — zdjęcie zespołu"
              value={data.brand.aboutTeamImage}
              onChange={(url) =>
                patch((d) => {
                  d.brand.aboutTeamImage = url
                })
              }
            />
            <MediaField
              label="About — CTA auto"
              value={data.brand.aboutCtaImage}
              onChange={(url) =>
                patch((d) => {
                  d.brand.aboutCtaImage = url
                })
              }
            />
            <label className={ui.field} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <input
                type="checkbox"
                checked={data.brand.telegramNotify}
                onChange={(e) =>
                  patch((d) => {
                    d.brand.telegramNotify = e.target.checked
                  })
                }
              />
              <span>Wysyłaj zgłoszenia na Telegram</span>
            </label>
          </div>
        </AdminCard>
      ) : null}

      {tab === 'services' ? (
        <div className={ui.grid2}>
          <AdminCard
            title="Lista usług"
            subtitle="Dodawaj, usuwaj, zmieniaj kolejność (góra = pierwsza)"
            className=""
          >
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <PrimaryButton type="button" onClick={startAddService}>
                Dodaj usługę
              </PrimaryButton>
            </div>
            <div className={ui.stack} style={{ gap: 8 }}>
              {data.services.map((service, index) => (
                <button
                  key={service.id}
                  type="button"
                  className={ui.ghostBtn}
                  style={{
                    justifyContent: 'space-between',
                    width: '100%',
                    background:
                      !draftService && serviceId === service.id
                        ? 'rgba(255,214,10,0.16)'
                        : undefined,
                  }}
                  onClick={() => {
                    setDraftService(null)
                    setServiceId(service.id)
                  }}
                >
                  <span>
                    {index + 1}. {service.title.pl || service.id}
                  </span>
                  <span className={ui.muted}>{service.category}</span>
                </button>
              ))}
            </div>
          </AdminCard>

          <AdminCard
            title={draftService ? 'Nowa usługa' : 'Edycja usługi'}
            subtitle={draftService ? 'Formularz dodawania' : serviceForm?.id || '—'}
          >
            {!serviceForm ? (
              <div className={styles.emptyBox}>
                Wybierz usługę z listy albo kliknij „Dodaj usługę”.
              </div>
            ) : (
              <div className={ui.stack} style={{ gap: 12 }}>
                {!draftService ? (
                  <label className={ui.field}>
                    <span>ID (slug)</span>
                    <input value={serviceForm.id} disabled />
                  </label>
                ) : null}
                <div className={ui.grid2}>
                  <label className={ui.field}>
                    <span>Kategoria</span>
                    <select
                      value={serviceForm.category}
                      onChange={(e) =>
                        updateServiceForm((item) => {
                          item.category = e.target.value as CmsService['category']
                        })
                      }
                    >
                      <option value="cars">cars</option>
                      <option value="vans">vans</option>
                      <option value="trucks">trucks</option>
                    </select>
                  </label>
                </div>
                <MediaField
                  label="Zdjęcie usługi"
                  value={serviceForm.image}
                  onChange={(url) =>
                    updateServiceForm((item) => {
                      item.image = url
                    })
                  }
                />
                <LField
                  label="Tytuł"
                  value={serviceForm.title}
                  onChange={(value) =>
                    updateServiceForm((item) => {
                      item.title = value
                    })
                  }
                />
                <LField
                  label="Opis"
                  value={serviceForm.description}
                  onChange={(value) =>
                    updateServiceForm((item) => {
                      item.description = value
                    })
                  }
                />
                <LField
                  label="Cena"
                  value={serviceForm.price}
                  onChange={(value) =>
                    updateServiceForm((item) => {
                      item.price = value
                    })
                  }
                />
                <LField
                  label="Notatka do ceny"
                  value={serviceForm.priceNote}
                  onChange={(value) =>
                    updateServiceForm((item) => {
                      item.priceNote = value
                    })
                  }
                />
                <LField
                  label="Krótki opis (sekcja cen)"
                  value={serviceForm.summary}
                  onChange={(value) =>
                    updateServiceForm((item) => {
                      item.summary = value
                    })
                  }
                />
                {draftService ? (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <PrimaryButton type="button" onClick={confirmAddService}>
                      Dodaj do listy
                    </PrimaryButton>
                    <GhostButton
                      onClick={() => {
                        setDraftService(null)
                        setMessage('')
                        setError('')
                      }}
                    >
                      Anuluj
                    </GhostButton>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <GhostButton
                      onClick={() =>
                        patch((d) => {
                          const idx = d.services.findIndex((s) => s.id === serviceForm.id)
                          if (idx > 0) {
                            const [item] = d.services.splice(idx, 1)
                            d.services.splice(idx - 1, 0, item)
                          }
                        })
                      }
                    >
                      ↑ Wyżej
                    </GhostButton>
                    <GhostButton
                      onClick={() =>
                        patch((d) => {
                          const idx = d.services.findIndex((s) => s.id === serviceForm.id)
                          if (idx >= 0 && idx < d.services.length - 1) {
                            const [item] = d.services.splice(idx, 1)
                            d.services.splice(idx + 1, 0, item)
                          }
                        })
                      }
                    >
                      ↓ Niżej
                    </GhostButton>
                    <DangerButton
                      onClick={() => {
                        if (!confirm('Usunąć usługę?')) return
                        const id = serviceForm.id
                        patch((d) => {
                          d.services = d.services.filter((s) => s.id !== id)
                        })
                        setServiceId(null)
                      }}
                    >
                      Usuń
                    </DangerButton>
                  </div>
                )}
              </div>
            )}
          </AdminCard>
        </div>
      ) : null}

      {tab === 'gallery' ? (
        <div className={ui.grid2}>
          <AdminCard title="Galeria" subtitle={`${data.gallery.length} elementów`}>
            <div className={styles.toolbar}>
              <PrimaryButton type="button" onClick={startAddGallery}>
                Dodaj zdjęcie / wideo
              </PrimaryButton>
            </div>
            {data.gallery.length === 0 ? (
              <div className={styles.emptyBox}>Brak elementów — kliknij „Dodaj zdjęcie / wideo”.</div>
            ) : (
              <div className={styles.list}>
                {data.gallery.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`${styles.listItem} ${!draftGallery && galleryId === item.id ? styles.listItemActive : ''}`}
                    onClick={() => {
                      setDraftGallery(null)
                      setGalleryId(item.id)
                    }}
                  >
                    {item.kind === 'video' || /\.(mp4|webm|mov|m4v|ogg|ogv)(\?|$)/i.test(item.src) ? (
                      <video className={styles.thumb} src={item.src} muted preload="metadata" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className={styles.thumb} src={item.src} alt="" />
                    )}
                    <div className={styles.listMeta}>
                      <strong>
                        #{index + 1} · {item.kind === 'video' ? 'Wideo' : 'Zdjęcie'} ·{' '}
                        {item.alt?.pl || item.id}
                      </strong>
                      <span>{item.id}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </AdminCard>

          <AdminCard
            title={draftGallery ? 'Nowy element' : 'Edycja elementu'}
            subtitle={draftGallery ? 'Formularz dodawania' : galleryForm?.id || '—'}
          >
            {!galleryForm ? (
              <div className={styles.emptyBox}>Wybierz element z listy lub dodaj nowy</div>
            ) : (
              <div className={styles.editor}>
                <MediaField
                  label="Zdjęcie lub wideo"
                  allowVideo
                  value={galleryForm.src}
                  onChange={(url, meta) =>
                    updateGalleryForm((item) => {
                      item.src = url
                      item.kind = meta?.kind || (url ? item.kind : 'image')
                    })
                  }
                />
                <LField
                  label="Alt / opis (SEO)"
                  value={galleryForm.alt}
                  onChange={(value) =>
                    updateGalleryForm((item) => {
                      item.alt = value
                    })
                  }
                />
                {draftGallery ? (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <PrimaryButton type="button" onClick={confirmAddGallery}>
                      Dodaj do listy
                    </PrimaryButton>
                    <GhostButton
                      onClick={() => {
                        setDraftGallery(null)
                        setMessage('')
                        setError('')
                      }}
                    >
                      Anuluj
                    </GhostButton>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <GhostButton
                      onClick={() =>
                        patch((d) => {
                          const idx = d.gallery.findIndex((x) => x.id === galleryForm.id)
                          if (idx > 0) {
                            const [item] = d.gallery.splice(idx, 1)
                            d.gallery.splice(idx - 1, 0, item)
                          }
                        })
                      }
                    >
                      ↑ Wyżej
                    </GhostButton>
                    <GhostButton
                      onClick={() =>
                        patch((d) => {
                          const idx = d.gallery.findIndex((x) => x.id === galleryForm.id)
                          if (idx >= 0 && idx < d.gallery.length - 1) {
                            const [item] = d.gallery.splice(idx, 1)
                            d.gallery.splice(idx + 1, 0, item)
                          }
                        })
                      }
                    >
                      ↓ Niżej
                    </GhostButton>
                    <DangerButton
                      onClick={() => {
                        if (!confirm('Usunąć zdjęcie?')) return
                        const id = galleryForm.id
                        patch((d) => {
                          d.gallery = d.gallery.filter((x) => x.id !== id)
                        })
                        setGalleryId(null)
                      }}
                    >
                      Usuń
                    </DangerButton>
                  </div>
                )}
              </div>
            )}
          </AdminCard>
        </div>
      ) : null}

      {tab === 'beforeAfter' ? (
        <div className={ui.grid2}>
          <AdminCard title="Nasze prace — przed / po" subtitle={`${data.beforeAfter.length} zestawów`}>
            <div className={styles.toolbar}>
              <PrimaryButton type="button" onClick={startAddBeforeAfter}>
                Dodaj zestaw
              </PrimaryButton>
            </div>
            {data.beforeAfter.length === 0 ? (
              <div className={styles.emptyBox}>Brak zestawów — kliknij „Dodaj zestaw”.</div>
            ) : (
              <div className={styles.list}>
                {data.beforeAfter.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`${styles.listItem} ${!draftBeforeAfter && beforeAfterId === item.id ? styles.listItemActive : ''}`}
                    onClick={() => {
                      setDraftBeforeAfter(null)
                      setBeforeAfterId(item.id)
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className={styles.thumb} src={item.image || undefined} alt="" />
                    <div className={styles.listMeta}>
                      <strong>
                        #{index + 1} · {item.title?.pl || item.id}
                      </strong>
                      <span>{item.id}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </AdminCard>

          <AdminCard
            title={draftBeforeAfter ? 'Nowy zestaw' : 'Edycja zestawu'}
            subtitle={draftBeforeAfter ? 'Formularz dodawania' : beforeAfterForm?.id || '—'}
          >
            {!beforeAfterForm ? (
              <div className={styles.emptyBox}>
                Wybierz zestaw z listy albo kliknij „Dodaj zestaw”.
              </div>
            ) : (
              <div className={styles.editor}>
                <LField
                  label="Tytuł"
                  value={beforeAfterForm.title}
                  onChange={(value) =>
                    updateBeforeAfterForm((item) => {
                      item.title = value
                    })
                  }
                />
                <MediaField
                  label="Zdjęcie PO (po detailingu)"
                  value={beforeAfterForm.image}
                  onChange={(url) =>
                    updateBeforeAfterForm((item) => {
                      item.image = url
                    })
                  }
                />
                <MediaField
                  label="Zdjęcie PRZED (opcjonalnie)"
                  value={beforeAfterForm.beforeImage || ''}
                  onChange={(url) =>
                    updateBeforeAfterForm((item) => {
                      item.beforeImage = url
                    })
                  }
                />
                {draftBeforeAfter ? (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <PrimaryButton type="button" onClick={confirmAddBeforeAfter}>
                      Dodaj do listy
                    </PrimaryButton>
                    <GhostButton
                      onClick={() => {
                        setDraftBeforeAfter(null)
                        setMessage('')
                        setError('')
                      }}
                    >
                      Anuluj
                    </GhostButton>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <GhostButton
                      onClick={() =>
                        patch((d) => {
                          const idx = d.beforeAfter.findIndex((x) => x.id === beforeAfterForm.id)
                          if (idx > 0) {
                            const [item] = d.beforeAfter.splice(idx, 1)
                            d.beforeAfter.splice(idx - 1, 0, item)
                          }
                        })
                      }
                    >
                      ↑ Wyżej
                    </GhostButton>
                    <GhostButton
                      onClick={() =>
                        patch((d) => {
                          const idx = d.beforeAfter.findIndex((x) => x.id === beforeAfterForm.id)
                          if (idx >= 0 && idx < d.beforeAfter.length - 1) {
                            const [item] = d.beforeAfter.splice(idx, 1)
                            d.beforeAfter.splice(idx + 1, 0, item)
                          }
                        })
                      }
                    >
                      ↓ Niżej
                    </GhostButton>
                    <DangerButton
                      onClick={() => {
                        if (!confirm('Usunąć zestaw?')) return
                        const id = beforeAfterForm.id
                        patch((d) => {
                          d.beforeAfter = d.beforeAfter.filter((x) => x.id !== id)
                        })
                        setBeforeAfterId(null)
                      }}
                    >
                      Usuń
                    </DangerButton>
                  </div>
                )}
              </div>
            )}
          </AdminCard>
        </div>
      ) : null}

      {tab === 'reviews' ? (
        <div className={ui.grid2}>
          <AdminCard title="Opinie klientów" subtitle={`${data.reviews.length} opinii`}>
            <div className={styles.toolbar}>
              <PrimaryButton type="button" onClick={startAddReview}>
                Dodaj opinię
              </PrimaryButton>
            </div>
            {data.reviews.length === 0 ? (
              <div className={styles.emptyBox}>Brak opinii — kliknij „Dodaj opinię”.</div>
            ) : (
              <div className={styles.list}>
                {data.reviews.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`${styles.listItem} ${!draftReview && reviewId === item.id ? styles.listItemActive : ''}`}
                    onClick={() => {
                      setDraftReview(null)
                      setReviewId(item.id)
                    }}
                  >
                    <div className={styles.listMeta}>
                      <strong>
                        #{index + 1} · {item.name?.pl || item.id}
                      </strong>
                      <span>
                        {item.rating}/5 · {item.id}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </AdminCard>

          <AdminCard
            title={draftReview ? 'Nowa opinia' : 'Edycja opinii'}
            subtitle={draftReview ? 'Formularz dodawania' : reviewForm?.id || '—'}
          >
            {!reviewForm ? (
              <div className={styles.emptyBox}>Wybierz opinię z listy lub dodaj nową</div>
            ) : (
              <div className={styles.editor}>
                <label className={ui.field}>
                  <span>Ocena (1–5)</span>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={reviewForm.rating}
                    onChange={(e) =>
                      updateReviewForm((item) => {
                        item.rating = Number(e.target.value) || 5
                      })
                    }
                  />
                </label>
                <LField
                  label="Imię"
                  value={reviewForm.name}
                  onChange={(value) =>
                    updateReviewForm((item) => {
                      item.name = value
                    })
                  }
                />
                <LField
                  label="Treść"
                  value={reviewForm.text}
                  onChange={(value) =>
                    updateReviewForm((item) => {
                      item.text = value
                    })
                  }
                />
                {draftReview ? (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <PrimaryButton type="button" onClick={confirmAddReview}>
                      Dodaj do listy
                    </PrimaryButton>
                    <GhostButton
                      onClick={() => {
                        setDraftReview(null)
                        setMessage('')
                        setError('')
                      }}
                    >
                      Anuluj
                    </GhostButton>
                  </div>
                ) : (
                  <DangerButton
                    onClick={() => {
                      if (!confirm('Usunąć opinię?')) return
                      const id = reviewForm.id
                      patch((d) => {
                        d.reviews = d.reviews.filter((x) => x.id !== id)
                      })
                      setReviewId(null)
                    }}
                  >
                    Usuń
                  </DangerButton>
                )}
              </div>
            )}
          </AdminCard>
        </div>
      ) : null}

      {tab === 'texts' ? (
        <AdminCard title="Teksty strony" subtitle="SEO i copy — osobno PL / UK">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            <GhostButton onClick={() => setLocaleTab('pl')}>Polski</GhostButton>
            <GhostButton onClick={() => setLocaleTab('uk')}>Українська</GhostButton>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {(
              [
                ['seo', 'SEO'],
                ['hero', 'Hero'],
                ['about', 'O nas'],
                ['nav', 'Nawigacja'],
                ['booking', 'Booking'],
                ['contact', 'Kontakt UI'],
                ['footer', 'Stopka'],
              ] as const
            ).map(([id, label]) => (
              <GhostButton key={id} onClick={() => setTextSection(id)}>
                {label}
              </GhostButton>
            ))}
          </div>

          {textSection === 'seo' ? (
            <div className={ui.stack} style={{ gap: 12 }}>
              <label className={ui.field}>
                <span>Title</span>
                <input
                  value={data.copy[localeTab].seo.defaultTitle}
                  onChange={(e) =>
                    patch((d) => {
                      d.copy[localeTab].seo.defaultTitle = e.target.value
                    })
                  }
                />
              </label>
              <label className={ui.field}>
                <span>Description</span>
                <textarea
                  rows={4}
                  value={data.copy[localeTab].seo.defaultDescription}
                  onChange={(e) =>
                    patch((d) => {
                      d.copy[localeTab].seo.defaultDescription = e.target.value
                    })
                  }
                />
              </label>
              <label className={ui.field}>
                <span>Keywords (przecinek)</span>
                <textarea
                  rows={3}
                  value={data.copy[localeTab].seo.keywords.join(', ')}
                  onChange={(e) =>
                    patch((d) => {
                      d.copy[localeTab].seo.keywords = e.target.value
                        .split(',')
                        .map((k) => k.trim())
                        .filter(Boolean)
                    })
                  }
                />
              </label>
              <label className={ui.field}>
                <span>OG image alt</span>
                <input
                  value={data.copy[localeTab].seo.ogImageAlt}
                  onChange={(e) =>
                    patch((d) => {
                      d.copy[localeTab].seo.ogImageAlt = e.target.value
                    })
                  }
                />
              </label>
            </div>
          ) : null}

          {textSection === 'hero' ? (
            <div className={ui.stack} style={{ gap: 12 }}>
              <label className={ui.field}>
                <span>Linie nagłówka (każda w nowej linii)</span>
                <textarea
                  rows={4}
                  value={data.copy[localeTab].hero.lines.join('\n')}
                  onChange={(e) =>
                    patch((d) => {
                      d.copy[localeTab].hero.lines = e.target.value.split('\n')
                    })
                  }
                />
              </label>
              <label className={ui.field}>
                <span>Accent</span>
                <input
                  value={data.copy[localeTab].hero.accent}
                  onChange={(e) =>
                    patch((d) => {
                      d.copy[localeTab].hero.accent = e.target.value
                    })
                  }
                />
              </label>
              <label className={ui.field}>
                <span>Pillars (3, przecinek)</span>
                <input
                  value={data.copy[localeTab].hero.pillars.join(', ')}
                  onChange={(e) =>
                    patch((d) => {
                      const parts = e.target.value.split(',').map((p) => p.trim())
                      d.copy[localeTab].hero.pillars = [
                        parts[0] || '',
                        parts[1] || '',
                        parts[2] || '',
                      ]
                    })
                  }
                />
              </label>
              <label className={ui.field}>
                <span>Card label</span>
                <input
                  value={data.copy[localeTab].hero.cardLabel}
                  onChange={(e) =>
                    patch((d) => {
                      d.copy[localeTab].hero.cardLabel = e.target.value
                    })
                  }
                />
              </label>
              <label className={ui.field}>
                <span>Card title</span>
                <input
                  value={data.copy[localeTab].hero.cardTitle}
                  onChange={(e) =>
                    patch((d) => {
                      d.copy[localeTab].hero.cardTitle = e.target.value
                    })
                  }
                />
              </label>
              <label className={ui.field}>
                <span>Card sub</span>
                <input
                  value={data.copy[localeTab].hero.cardSub}
                  onChange={(e) =>
                    patch((d) => {
                      d.copy[localeTab].hero.cardSub = e.target.value
                    })
                  }
                />
              </label>
            </div>
          ) : null}

          {textSection === 'about' ? (
            <div className={ui.stack} style={{ gap: 12 }}>
              <label className={ui.field}>
                <span>Tytuł (przed)</span>
                <input
                  value={data.copy[localeTab].about.titleBefore}
                  onChange={(e) =>
                    patch((d) => {
                      d.copy[localeTab].about.titleBefore = e.target.value
                    })
                  }
                />
              </label>
              <label className={ui.field}>
                <span>Tytuł (em)</span>
                <input
                  value={data.copy[localeTab].about.titleEm}
                  onChange={(e) =>
                    patch((d) => {
                      d.copy[localeTab].about.titleEm = e.target.value
                    })
                  }
                />
              </label>
              <label className={ui.field}>
                <span>Akapity (puste linie rozdzielają)</span>
                <textarea
                  rows={8}
                  value={data.copy[localeTab].about.paragraphs.join('\n\n')}
                  onChange={(e) =>
                    patch((d) => {
                      d.copy[localeTab].about.paragraphs = e.target.value
                        .split(/\n\s*\n/)
                        .map((p) => p.trim())
                        .filter(Boolean)
                    })
                  }
                />
              </label>
              <label className={ui.field}>
                <span>Cytat</span>
                <textarea
                  rows={3}
                  value={data.copy[localeTab].about.quote}
                  onChange={(e) =>
                    patch((d) => {
                      d.copy[localeTab].about.quote = e.target.value
                    })
                  }
                />
              </label>
              <label className={ui.field}>
                <span>CTA tytuł</span>
                <input
                  value={data.copy[localeTab].about.ctaTitle}
                  onChange={(e) =>
                    patch((d) => {
                      d.copy[localeTab].about.ctaTitle = e.target.value
                    })
                  }
                />
              </label>
              <label className={ui.field}>
                <span>CTA tekst</span>
                <textarea
                  rows={3}
                  value={data.copy[localeTab].about.ctaText}
                  onChange={(e) =>
                    patch((d) => {
                      d.copy[localeTab].about.ctaText = e.target.value
                    })
                  }
                />
              </label>
            </div>
          ) : null}

          {textSection === 'nav' ||
          textSection === 'booking' ||
          textSection === 'contact' ||
          textSection === 'footer' ? (
            <div className={ui.stack} style={{ gap: 12 }}>
              {Object.entries(data.copy[localeTab][textSection]).map(([key, value]) => {
                if (typeof value !== 'string') return null
                return (
                  <label key={key} className={ui.field}>
                    <span>{key}</span>
                    <textarea
                      rows={2}
                      value={value}
                      onChange={(e) =>
                        patch((d) => {
                          // @ts-expect-error dynamic section key
                          d.copy[localeTab][textSection][key] = e.target.value
                        })
                      }
                    />
                  </label>
                )
              })}
            </div>
          ) : null}
        </AdminCard>
      ) : null}

      <div className={styles.stickyBar}>
        <p className={`${styles.stickyHint} ${dirty ? styles.stickyHintDirty : ''}`}>
          {dirty ? 'Masz niezapisane zmiany' : 'Wszystkie zmiany zapisane'}
        </p>
        <PrimaryButton type="button" onClick={() => void save()} disabled={saving || !dirty}>
          {saving ? 'Zapisywanie…' : 'Zapisz zmiany'}
        </PrimaryButton>
      </div>
    </div>
  )
}
