'use client'

export async function adminFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error((data as { error?: string }).error || `Request failed: ${response.status}`)
  }
  return data as T
}

export async function adminUpload(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  const response = await fetch('/api/admin/uploads', { method: 'POST', body: form })
  const data = (await response.json().catch(() => ({}))) as {
    ok?: boolean
    url?: string
    error?: string
    message?: string
  }
  if (!response.ok || !data.url) {
    if (data.message) throw new Error(data.message)
    const code = data.error || 'upload_failed'
    if (code === 'file_too_large') {
      throw new Error('Plik jest za duży. Wideo max 100 MB, zdjęcia max 20 MB.')
    }
    if (code === 'invalid_form') {
      throw new Error(
        'Nie udało się odczytać pliku. Sprawdź rozmiar (wideo max 100 MB, zdjęcia max 20 MB).',
      )
    }
    if (code === 'unsupported_type') throw new Error('Nieobsługiwany typ pliku.')
    if (code === 'unauthorized') throw new Error('Sesja wygasła — zaloguj się ponownie.')
    throw new Error(code)
  }
  return data.url
}
