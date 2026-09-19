'use client'

import { useEffect, useId, useRef, useState, type DragEvent } from 'react'
import { detectMediaKind, isVideoSrc } from '@/lib/media/kind'
import { adminUpload } from './adminApi'
import styles from './MediaField.module.css'

type MediaFieldProps = {
  label: string
  value: string
  onChange: (url: string, meta?: { kind: 'image' | 'video' }) => void
  hint?: string
  /** Allow video uploads (gallery). */
  allowVideo?: boolean
}

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'
const VIDEO_ACCEPT = 'video/mp4,video/webm,video/quicktime,video/ogg,.mp4,.webm,.mov,.m4v'
const MAX_IMAGE_MB = 20
const MAX_VIDEO_MB = 200

function isLikelyMediaUrl(value: string) {
  if (!value.trim()) return false
  if (value.startsWith('/')) return true
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export default function MediaField({
  label,
  value,
  onChange,
  allowVideo = false,
  hint,
}: MediaFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const fieldId = useId()
  const [urlDraft, setUrlDraft] = useState(value || '')
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [brokenPreview, setBrokenPreview] = useState(false)

  const accept = allowVideo ? `${IMAGE_ACCEPT},${VIDEO_ACCEPT}` : IMAGE_ACCEPT
  const defaultHint = allowVideo
    ? `JPG, PNG, WEBP, GIF · MP4, WEBM, MOV · max ${MAX_VIDEO_MB} MB (wideo)`
    : `JPG, PNG, WEBP, GIF · max ${MAX_IMAGE_MB} MB`

  useEffect(() => {
    setUrlDraft(value || '')
    setBrokenPreview(false)
  }, [value])

  async function uploadFiles(files: FileList | File[] | null | undefined) {
    const file = Array.from(files || [])[0]
    if (!file) return

    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v|ogg|ogv)$/i.test(file.name)
    const isImage = file.type.startsWith('image/')

    if (isVideo && !allowVideo) {
      setError('Dozwolone są tylko pliki graficzne.')
      return
    }
    if (!isImage && !isVideo) {
      setError(allowVideo ? 'Dozwolone są zdjęcia i wideo.' : 'Dozwolone są tylko pliki graficzne.')
      return
    }

    const maxMb = isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB
    if (file.size > maxMb * 1024 * 1024) {
      setError(`Plik jest za duży (max ${maxMb} MB).`)
      return
    }

    setUploading(true)
    setError('')
    try {
      const url = await adminUpload(file)
      onChange(url, { kind: isVideo ? 'video' : 'image' })
      setUrlDraft(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się wgrać pliku.')
    } finally {
      setUploading(false)
    }
  }

  function applyUrl() {
    const next = urlDraft.trim()
    if (!next) {
      onChange('')
      setError('')
      return
    }
    if (!isLikelyMediaUrl(next)) {
      setError('Podaj poprawny URL (https://…) lub ścieżkę (/images/…).')
      return
    }
    onChange(next, { kind: detectMediaKind(next) })
    setError('')
    setBrokenPreview(false)
  }

  function clearMedia() {
    onChange('')
    setUrlDraft('')
    setError('')
    setBrokenPreview(false)
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    event.stopPropagation()
    setDragging(false)

    const uri = event.dataTransfer.getData('text/uri-list') || event.dataTransfer.getData('text/plain')
    if (uri && isLikelyMediaUrl(uri.trim()) && event.dataTransfer.files.length === 0) {
      const next = uri.trim().split('\n')[0]?.trim() || ''
      if (next) {
        onChange(next, { kind: detectMediaKind(next) })
        setUrlDraft(next)
        setError('')
        return
      }
    }

    void uploadFiles(event.dataTransfer.files)
  }

  function onPasteUrl(event: React.ClipboardEvent<HTMLInputElement>) {
    const items = event.clipboardData?.items
    if (items) {
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/') || (allowVideo && item.type.startsWith('video/'))) {
          event.preventDefault()
          const file = item.getAsFile()
          if (file) void uploadFiles([file])
          return
        }
      }
    }

    const text = event.clipboardData.getData('text')
    if (text && isLikelyMediaUrl(text.trim())) {
      setTimeout(() => {
        const next = text.trim()
        setUrlDraft(next)
        onChange(next, { kind: detectMediaKind(next) })
        setError('')
      }, 0)
    }
  }

  const previewIsVideo = value ? isVideoSrc(value) : false

  return (
    <div className={styles.root}>
      <div className={styles.labelRow}>
        <label className={styles.label} htmlFor={fieldId}>
          {label}
        </label>
        {value ? (
          <button type="button" className={styles.clearBtn} onClick={clearMedia}>
            Wyczyść
          </button>
        ) : null}
      </div>

      <div className={styles.layout}>
        <div className={`${styles.preview} ${value ? styles.previewFilled : ''}`}>
          {value && !brokenPreview ? (
            previewIsVideo ? (
              <video
                src={value}
                muted
                playsInline
                preload="metadata"
                onError={() => setBrokenPreview(true)}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value} alt="" onError={() => setBrokenPreview(true)} />
            )
          ) : (
            <div className={styles.previewEmpty}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <circle cx="9" cy="10" r="1.5" />
                <path d="M3 16l5-4 4 3 3-2 6 4" />
              </svg>
              <span>
                {brokenPreview
                  ? 'Nie można wczytać podglądu'
                  : allowVideo
                    ? 'Brak pliku'
                    : 'Brak zdjęcia'}
              </span>
            </div>
          )}
          {uploading ? <div className={styles.uploadingOverlay}>Wgrywanie…</div> : null}
        </div>

        <div className={styles.controls}>
          <div
            className={`${styles.dropzone} ${dragging ? styles.dropzoneActive : ''} ${uploading ? styles.dropzoneBusy : ''}`}
            onDragEnter={(event) => {
              event.preventDefault()
              setDragging(true)
            }}
            onDragOver={(event) => {
              event.preventDefault()
              setDragging(true)
            }}
            onDragLeave={(event) => {
              event.preventDefault()
              if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                setDragging(false)
              }
            }}
            onDrop={onDrop}
            onPaste={(event) => {
              const items = event.clipboardData?.items
              if (!items) return
              for (const item of Array.from(items)) {
                if (item.type.startsWith('image/') || (allowVideo && item.type.startsWith('video/'))) {
                  event.preventDefault()
                  const file = item.getAsFile()
                  if (file) void uploadFiles([file])
                  return
                }
              }
            }}
            onClick={() => !uploading && inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                inputRef.current?.click()
              }
            }}
            aria-label={`${label}: przeciągnij plik lub kliknij, aby wybrać`}
          >
            <strong>
              {uploading
                ? 'Wgrywanie…'
                : dragging
                  ? 'Upuść tutaj'
                  : allowVideo
                    ? 'Przeciągnij zdjęcie lub wideo'
                    : 'Przeciągnij zdjęcie'}
            </strong>
            <span>lub kliknij, aby wybrać · możesz też upuścić link</span>
            <span className={styles.hint}>{hint || defaultHint}</span>
            <input
              ref={inputRef}
              id={fieldId}
              type="file"
              accept={accept}
              hidden
              disabled={uploading}
              onChange={(event) => {
                void uploadFiles(event.target.files)
                event.target.value = ''
              }}
            />
          </div>

          <div className={styles.urlBlock}>
            <span className={styles.urlLabel}>Lub wklej link / ścieżkę</span>
            <div className={styles.urlRow}>
              <input
                type="text"
                value={urlDraft}
                placeholder="https://… lub /images/emaro/…"
                onChange={(event) => setUrlDraft(event.target.value)}
                onPaste={onPasteUrl}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    applyUrl()
                  }
                }}
                disabled={uploading}
              />
              <button
                type="button"
                className={styles.urlBtn}
                onClick={applyUrl}
                disabled={uploading || urlDraft.trim() === (value || '')}
              >
                Zastosuj
              </button>
            </div>
          </div>
        </div>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}
      {value ? (
        <p className={styles.path} title={value}>
          {value}
        </p>
      ) : null}
    </div>
  )
}
