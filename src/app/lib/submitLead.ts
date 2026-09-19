export type LeadPayload = {
  source: 'contact' | 'booking'
  name: string
  phone: string
  email?: string
  service?: string
  comment?: string
  locale?: string
  pageUrl?: string
  pagePath?: string
  website?: string
  fax?: string
  formOpenedAt?: number
}

export async function submitLead(payload: LeadPayload) {
  const response = await fetch('/api/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({
      ...payload,
      pageUrl: typeof window !== 'undefined' ? window.location.href : payload.pageUrl,
      pagePath: typeof window !== 'undefined' ? window.location.pathname : payload.pagePath,
    }),
  })

  if (!response.ok) {
    throw new Error(`Lead submit failed (${response.status})`)
  }

  const data = (await response.json().catch(() => null)) as { ok?: boolean } | null
  if (!data?.ok) {
    throw new Error('Lead submit rejected')
  }
}
