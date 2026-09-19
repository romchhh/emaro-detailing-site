'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { adminFetch } from '../adminApi'
import { AdminCard, AdminPageHeader, StatCard, StatusBadge } from '../AdminUi'
import ui from '../AdminUi.module.css'
import type { Lead } from '@/lib/cms/types'

const AreaChart = dynamic(() => import('../AdminCharts').then((m) => m.AreaChart), {
  ssr: false,
})
const BarChart = dynamic(() => import('../AdminCharts').then((m) => m.BarChart), {
  ssr: false,
})

type DashboardPayload = {
  stats: Array<{
    id: string
    label: string
    value: string
    delta: string
    hint: string
    trend: 'up' | 'down' | 'neutral'
  }>
  visitsSeries: Array<{ label: string; value: number }>
  trafficSources: Array<{ label: string; value: number; color: string }>
  topPages: Array<{ path: string; views: number; share: string }>
  recentLeads: Lead[]
}

function formatTime(iso: string) {
  try {
    return new Intl.DateTimeFormat('pl-PL', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'Europe/Warsaw',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export default function DashboardView() {
  const [data, setData] = useState<DashboardPayload | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    void adminFetch<DashboardPayload>('/api/admin/dashboard')
      .then(setData)
      .catch((err: Error) => setError(err.message))
  }, [])

  if (error) return <p className={ui.empty}>Błąd: {error}</p>
  if (!data) return <p className={ui.loading}>Ładowanie dashboardu…</p>

  return (
    <div className={ui.stack}>
      <AdminPageHeader
        title="Przegląd strony"
        description="Wizyty, zgłoszenia i stan katalogu treści Emaro."
        action={
          <Link href="/admin/content" className={ui.primaryBtn} style={{ display: 'inline-flex', textDecoration: 'none' }}>
            Edytuj treści
          </Link>
        }
      />

      <div className={ui.grid4}>
        {data.stats.map((stat) => (
          <StatCard key={stat.id} {...stat} />
        ))}
      </div>

      <div className={ui.grid2}>
        <AdminCard title="Wizyty w tym tygodniu" subtitle="Pageviews według dnia">
          <AreaChart data={data.visitsSeries} />
        </AdminCard>
        <AdminCard title="Źródła ruchu" subtitle="Szacunkowy podział kanałów">
          <BarChart data={data.trafficSources} />
        </AdminCard>
      </div>

      <div className={ui.grid2}>
        <AdminCard title="Ostatnie zgłoszenia" subtitle="Z formularzy kontakt / booking">
          <div className={ui.tableWrap}>
            <table className={ui.table}>
              <thead>
                <tr>
                  <th>Klient</th>
                  <th>Źródło</th>
                  <th>Status</th>
                  <th>Czas (Warszawa)</th>
                </tr>
              </thead>
              <tbody>
                {data.recentLeads.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={ui.empty}>
                      Brak zgłoszeń — pojawią się po wysłaniu formularzy.
                    </td>
                  </tr>
                ) : (
                  data.recentLeads.map((lead) => (
                    <tr key={lead.id}>
                      <td>
                        <strong>{lead.name}</strong>
                        <div className={ui.muted}>{lead.phone}</div>
                      </td>
                      <td>{lead.source}</td>
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

        <AdminCard title="Top strony" subtitle="Ostatnie 30 dni">
          <div className={ui.tableWrap}>
            <table className={ui.table}>
              <thead>
                <tr>
                  <th>Ścieżka</th>
                  <th>Odsłony</th>
                  <th>Udział</th>
                </tr>
              </thead>
              <tbody>
                {data.topPages.length === 0 ? (
                  <tr>
                    <td colSpan={3} className={ui.empty}>
                      Brak danych — wejdź na stronę, aby zebrać pierwsze wizyty.
                    </td>
                  </tr>
                ) : (
                  data.topPages.map((page) => (
                    <tr key={page.path}>
                      <td>{page.path}</td>
                      <td>{page.views}</td>
                      <td>{page.share}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </AdminCard>
      </div>
    </div>
  )
}
