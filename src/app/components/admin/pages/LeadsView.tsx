'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { adminFetch } from '../adminApi'
import {
  AdminCard,
  AdminPageHeader,
  DangerButton,
  GhostButton,
  PrimaryButton,
  StatusBadge,
} from '../AdminUi'
import ui from '../AdminUi.module.css'
import type { Lead, LeadStatus } from '@/lib/cms/types'

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'Nowa' },
  { value: 'in_progress', label: 'W toku' },
  { value: 'done', label: 'Zamknięta' },
  { value: 'archived', label: 'Archiwum' },
]

function formatTime(iso: string) {
  try {
    return new Intl.DateTimeFormat('pl-PL', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Europe/Warsaw',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export default function LeadsView() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filter, setFilter] = useState<'all' | LeadStatus>('all')
  const [selected, setSelected] = useState<Lead | null>(null)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const data = await adminFetch<{ leads: Lead[] }>('/api/admin/leads')
    setLeads(data.leads)
  }, [])

  useEffect(() => {
    void load().catch((err: Error) => setError(err.message))
  }, [load])

  const filtered = useMemo(() => {
    if (filter === 'all') return leads
    return leads.filter((lead) => lead.status === filter)
  }, [leads, filter])

  async function updateLead(patch: { status?: LeadStatus; notes?: string }) {
    if (!selected) return
    setSaving(true)
    try {
      const data = await adminFetch<{ lead: Lead }>('/api/admin/leads', {
        method: 'PATCH',
        body: JSON.stringify({ id: selected.id, ...patch }),
      })
      setSelected(data.lead)
      setNotes(data.lead.notes || '')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'save_failed')
    } finally {
      setSaving(false)
    }
  }

  async function removeLead(id: string) {
    if (!confirm('Usunąć zgłoszenie?')) return
    await adminFetch(`/api/admin/leads?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (selected?.id === id) setSelected(null)
    await load()
  }

  if (error && leads.length === 0) return <p className={ui.empty}>Błąd: {error}</p>

  return (
    <div className={ui.stack}>
      <AdminPageHeader
        title="Zgłoszenia"
        description="Wszystkie leady z formularzy kontaktowych i booking. Powiadomienia Telegram działają równolegle."
      />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <GhostButton onClick={() => setFilter('all')}>
          Wszystkie ({leads.length})
        </GhostButton>
        {STATUS_OPTIONS.map((option) => (
          <GhostButton key={option.value} onClick={() => setFilter(option.value)}>
            {option.label} ({leads.filter((l) => l.status === option.value).length})
          </GhostButton>
        ))}
      </div>

      <div className={ui.grid2}>
        <AdminCard title="Lista" subtitle={`${filtered.length} pozycji`}>
          <div className={ui.tableWrap}>
            <table className={ui.table}>
              <thead>
                <tr>
                  <th>Klient</th>
                  <th>Usługa</th>
                  <th>Status</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={ui.empty}>
                      Brak zgłoszeń w tym filtrze.
                    </td>
                  </tr>
                ) : (
                  filtered.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => {
                        setSelected(lead)
                        setNotes(lead.notes || '')
                      }}
                      style={{
                        cursor: 'pointer',
                        background: selected?.id === lead.id ? 'rgba(255,214,10,0.12)' : undefined,
                      }}
                    >
                      <td>
                        <strong>{lead.name}</strong>
                        <div className={ui.muted}>{lead.phone}</div>
                      </td>
                      <td>{lead.service || '—'}</td>
                      <td>
                        <StatusBadge status={lead.status} />
                      </td>
                      <td>{formatTime(lead.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </AdminCard>

        <AdminCard title="Szczegóły" subtitle={selected ? selected.source : 'Wybierz zgłoszenie'}>
          {!selected ? (
            <p className={ui.empty}>Kliknij wiersz po lewej, aby zobaczyć szczegóły.</p>
          ) : (
            <div className={ui.stack} style={{ gap: 14 }}>
              <div>
                <strong>{selected.name}</strong>
                <div className={ui.muted}>{formatTime(selected.createdAt)}</div>
              </div>
              <p>
                <span className={ui.muted}>Telefon:</span> {selected.phone}
              </p>
              {selected.email ? (
                <p>
                  <span className={ui.muted}>E-mail:</span> {selected.email}
                </p>
              ) : null}
              {selected.service ? (
                <p>
                  <span className={ui.muted}>Usługa:</span> {selected.service}
                </p>
              ) : null}
              {selected.comment ? (
                <p>
                  <span className={ui.muted}>Komentarz:</span> {selected.comment}
                </p>
              ) : null}
              {selected.pageUrl ? (
                <p>
                  <span className={ui.muted}>Strona:</span>{' '}
                  <a href={selected.pageUrl} target="_blank" rel="noreferrer">
                    {selected.pagePath || selected.pageUrl}
                  </a>
                </p>
              ) : null}
              <p>
                <span className={ui.muted}>Język:</span> {selected.locale || '—'}
              </p>

              <label className={ui.field}>
                <span>Status</span>
                <select
                  value={selected.status}
                  onChange={(e) => void updateLead({ status: e.target.value as LeadStatus })}
                  disabled={saving}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className={ui.field}>
                <span>Notatki wewnętrzne</span>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </label>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <PrimaryButton onClick={() => void updateLead({ notes })} disabled={saving}>
                  Zapisz notatki
                </PrimaryButton>
                <DangerButton onClick={() => void removeLead(selected.id)}>Usuń</DangerButton>
              </div>
            </div>
          )}
        </AdminCard>
      </div>
    </div>
  )
}
