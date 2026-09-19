'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useAdminAuth } from './AdminAuthProvider'
import { adminFetch } from './adminApi'
import { ADMIN_NAV, getAdminPageTitle } from '@/lib/admin/nav'
import type { Lead } from '@/lib/cms/types'
import styles from './AdminShell.module.css'

function NavIcon({ name }: { name: string }) {
  if (name === 'leads') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 4h16v16H4z" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </svg>
    )
  }
  if (name === 'content') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 13h8V3H3v10zm10 8h8V11h-8v10zM3 21h8v-6H3v6zm10-18v6h8V3h-8z" />
    </svg>
  )
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { session, logout } = useAdminAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [newLeadsCount, setNewLeadsCount] = useState(0)

  const refreshLeadsBadge = useCallback(() => {
    void adminFetch<{ leads: Lead[] }>('/api/admin/leads')
      .then((data) => {
        setNewLeadsCount(data.leads.filter((lead) => lead.status === 'new').length)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.classList.add('emaro-admin')
    return () => document.body.classList.remove('emaro-admin')
  }, [])

  useEffect(() => {
    refreshLeadsBadge()
    const timer = window.setInterval(refreshLeadsBadge, 15000)
    return () => window.clearInterval(timer)
  }, [refreshLeadsBadge, pathname])

  async function handleLogout() {
    await logout()
    router.replace('/admin')
  }

  return (
    <div className={styles.shell}>
      <div
        className={`${styles.backdrop} ${menuOpen ? styles.backdropOpen : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      <aside className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarTop}>
          <Link href="/admin/dashboard" className={styles.brand}>
            <span className={styles.brandMark}>Emaro</span>
            <span className={styles.brandBadge}>Admin</span>
          </Link>
        </div>

        <nav className={styles.nav}>
          {ADMIN_NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const badge =
              item.href === '/admin/leads' && newLeadsCount > 0 ? String(newLeadsCount) : undefined
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
              >
                <NavIcon name={item.icon} />
                <span>{item.label}</span>
                {badge ? <span className={styles.navBadge}>{badge}</span> : null}
              </Link>
            )
          })}
        </nav>

        <div className={styles.sidebarBottom}>
          <div className={styles.userCard}>
            <div className={styles.avatar}>{session?.login.slice(0, 1).toUpperCase()}</div>
            <div>
              <strong>{session?.login}</strong>
              <span>{session?.name || 'Administrator'}</span>
            </div>
          </div>
          <button type="button" className={styles.logout} onClick={handleLogout}>
            Wyloguj
          </button>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.menuBtn}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Otwórz menu"
          >
            <span />
            <span />
            <span />
          </button>

          <div className={styles.topbarCopy}>
            <p className={styles.eyebrow}>Emaro Premium Auto Care</p>
            <h1 className={styles.pageTitle}>{getAdminPageTitle(pathname)}</h1>
          </div>

          <div className={styles.topbarActions}>
            <Link href="/pl" className={styles.siteLink} target="_blank">
              Otwórz stronę
            </Link>
          </div>
        </header>

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  )
}
