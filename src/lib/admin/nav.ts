export type AdminNavItem = {
  href: string
  label: string
  icon: 'dashboard' | 'leads' | 'content'
}

export const ADMIN_NAV: AdminNavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/admin/leads', label: 'Zgłoszenia', icon: 'leads' },
  { href: '/admin/content', label: 'Treści', icon: 'content' },
]

export function getAdminPageTitle(pathname: string) {
  const item = ADMIN_NAV.find((entry) => pathname.startsWith(entry.href))
  return item?.label ?? 'Panel admina'
}
