import { Suspense } from 'react'
import AdminBodyClass from '@/app/components/admin/AdminBodyClass'
import AdminLoginForm from '@/app/components/admin/AdminLoginForm'

export default function AdminLoginPage() {
  return (
    <AdminBodyClass>
      <Suspense
        fallback={
          <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>Ładowanie…</div>
        }
      >
        <AdminLoginForm />
      </Suspense>
    </AdminBodyClass>
  )
}
