import type { Metadata } from 'next'
import './admin.css'
import { AdminAuthProvider } from '@/app/components/admin/AdminAuthProvider'

export const metadata: Metadata = {
  title: 'Emaro Admin',
  robots: { index: false, follow: false },
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>
}
