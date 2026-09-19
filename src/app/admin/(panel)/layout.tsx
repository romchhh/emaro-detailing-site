import AdminGuard from '@/app/components/admin/AdminGuard'
import AdminShell from '@/app/components/admin/AdminShell'

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminShell>{children}</AdminShell>
    </AdminGuard>
  )
}
