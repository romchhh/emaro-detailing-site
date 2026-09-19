'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAdminAuth } from './AdminAuthProvider'
import styles from './AdminLoginForm.module.css'

export default function AdminLoginForm() {
  const { login, session, ready } = useAdminAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loginValue, setLoginValue] = useState('admin')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!ready || !session) return
    const next = searchParams.get('next') || '/admin/dashboard'
    router.replace(next.startsWith('/admin') ? next : '/admin/dashboard')
  }, [ready, session, router, searchParams])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setPending(true)
    setError('')
    const ok = await login(loginValue, password, remember)
    setPending(false)
    if (!ok) {
      setError('Nieprawidłowy login lub hasło')
      return
    }
    const next = searchParams.get('next') || '/admin/dashboard'
    router.replace(next.startsWith('/admin') ? next : '/admin/dashboard')
  }

  return (
    <div className={styles.page} style={{ gridTemplateColumns: '1fr', placeItems: 'center', background: '#f3f3f1' }}>
      <div className={styles.panel} style={{ maxWidth: 440, width: '100%', borderRadius: 24, boxShadow: '0 18px 48px rgba(14,14,14,0.08)', margin: 24 }}>
        <div className={styles.brand}>
          <span className={styles.logo}>Emaro</span>
          <span className={styles.badge}>Admin</span>
        </div>
        <div className={styles.intro}>
          <h1 className={styles.title}>Panel administracyjny</h1>
          <p className={styles.lead}>Zarządzaj treściami, zdjęciami i zgłoszeniami strony.</p>
        </div>

        <form className={styles.form} onSubmit={onSubmit}>
          <label className={styles.field}>
            <span>Login</span>
            <input
              value={loginValue}
              onChange={(e) => setLoginValue(e.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label className={styles.field}>
            <span>Hasło</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          <label className={styles.remember}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>Zapamiętaj mnie</span>
          </label>

          {error ? <p className={styles.error}>{error}</p> : null}

          <button type="submit" className={styles.submit} disabled={pending}>
            {pending ? 'Logowanie…' : 'Zaloguj'}
          </button>
        </form>
      </div>
    </div>
  )
}
